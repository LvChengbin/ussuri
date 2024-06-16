/******************************************************************
 * Copyright (C) 2022 LvChengbin
 *
 * File: src/injection.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 02/13/2022
 * Description:
 ******************************************************************/

import 'reflect-metadata';
import { createInterceptorParameterSync } from '@ussuri/method-interceptor';
import { Cachify } from './cachify';
import { Scope } from './enums';
import { DependencyGraph } from './dependency-graph';
import { InjectionEntry } from './injection-entry';
import { InjectionParam } from './injection-param';
import { EmptyDependency } from './empty-dependency';
import { InstanceCache } from './instance-cache';

import {
    ClassProvider,
    ExtraDependenciesMetadata,
    FactoryProvider,
    InjectableOptions,
    InjectionToken,
    Provider,
    OptionalFactoryDependency
} from './interfaces';

import {
    INJECTABLE_METADATA_KEY,
    INJECT_PROPERTY_METADATA_KEY,
    // INJECT_DEPENDENCIES_METADATA_KEY,
    EXTRA_DEPENDENCIES_METADATA_KEY
} from './constants';

import {
    CircularDependencyException,
    UnknownDependencyException,
    UndefinedDependencyException,
    // DuplicateDependenciesException,
    UnknownPropertyDependencyException
} from './exceptions';

import globalInstanceCache from './global-instance-cache';

const scopeWeight = {
    [ Scope.GLOBAL ] : 100,
    [ Scope.DEFAULT ] : 200,
    [ Scope.DEFERRED ] : 200,
    [ Scope.REQUEST ] : 300,
    [ Scope.TRANSIENT ] : 400
};

const createClassProviderParameters = new Cachify( {
    executor( constructor: ClassProvider[ 'useClass' ] ): unknown[] {
        return createInterceptorParameterSync( constructor )();
    }
} );

export interface ClassProviderDependenciesMetadata {
    constructorParameters: ( InjectionToken | EmptyDependency )[];
    injectedProperties: Record<string | symbol, InjectionToken | EmptyDependency>;
}

export interface FactoryProviderDependenciesMetadata {
    inject: ( InjectionToken | EmptyDependency )[];
}

export interface InjectionOptions {
    providers?: Provider[];
    defaultScope?: Scope;
    autoRegister?: boolean;
}

/**
 * @example
 *
 * ```ts
 *
 * @Injectable()
 * class SampleService {
 *     active() {}
 * }
 *
 * class SampleController {
 *
 *     @Inject() private sample: SampleService;
 *     @Inject( 'DB' ) private db: DBService;
 *
 *     constructor( private sampleService: sampleService, @Inject( 'DB' ) private db: DBService ) {}
 *     foo() {
 *         this.sampleService().active();
 *     }
 * }
 *
 * const injection = new Injection( {
 *     providers : [
 *         SampleService,
 *         { provide : 'DB', useClass : DBService }
 *     ]
 * } )
 *
 * injection.set( [ SampleController ] );
 *
 * const sampleController = injection.instantiate( SampleController );
 * sampleController.foo();
 * ```
 */
export class Injection {

    static Entry = InjectionEntry;

    static Param = InjectionParam;

    static InstanceCache = InstanceCache;

    static EmptyDependency = EmptyDependency;

    static INJECTABLE_METADATA_KEY = INJECTABLE_METADATA_KEY;

    /**
     * Save injectable metadata of a provider
     *
     * @example
     *
     * ```ts
     * Injection.defineInjectableMetadata( SampleProvider, {
     *     scope : Scope.DEFAULT
     * } );
     * ```
     */
    static defineInjectableMetadata( target: any, options?: InjectableOptions ): void {
        Reflect.defineMetadata( INJECTABLE_METADATA_KEY, options, target );
    }

    /**
     * Sometimes we need to add some extra dependencies in different ways, like `Pipes` in nestjs.
     * https://docs.nestjs.com/pipes
     *
     * for example:
     *
     * ```ts
     * @Injectable()
     * class IdValidation {
     *     transform() {}
     * }
     *
     * @Injectable()
     * class SampleProvider {
     *     action( @Query( 'id', IdValidation ) ) {}
     * }
     * ```
     *
     * The dependency `IdValidation` is not injected in SampleProvider's constructor or use `@Inject()` property decorator,
     * so it's not able to be collate in the common way. However, use `Injection.defineExtraDependenciesMetadata()` to declare
     * it manually before set `SampleProvider` into injection instance.
     */
    static defineExtraDependenciesMetadata( target: any, metadata: ExtraDependenciesMetadata ): void {
        const exists = Reflect.getMetadata( EXTRA_DEPENDENCIES_METADATA_KEY, target );

        if( !exists ) {
            Reflect.defineMetadata( EXTRA_DEPENDENCIES_METADATA_KEY, [ metadata ], target );
            return;
        }

        exists.push( metadata );
    }

    /**
     * Denoting if register unlisted dependencies automatically
     */
    public autoRegister: boolean;

    /**
     * The default scope of each provider, using `Scope.DEFAULT` by default
     */
    public defaultScope: Scope = Scope.DEFAULT;

    /**
     * Put all registered providers into a set
     */
    public registeredProviders = new Map<InjectionToken, Provider>();
    public cache = new Map<InjectionToken, unknown>();
    public dependencies = new DependencyGraph<InjectionToken | EmptyDependency, InjectionEntry | null>();

    /**
     * Storing metadatas into current injection instance instead of using Reflect metadata
     */
    public dependenciesMetadata = new Map<InjectionToken, ClassProviderDependenciesMetadata | FactoryProviderDependenciesMetadata>();

    constructor( options: InjectionOptions = {} ) {
        this.defaultScope = options.defaultScope ?? Scope.DEFAULT;
        this.autoRegister = options.autoRegister ?? true;

        options.providers && this.#collateProviders(
            this.#setProvider( options.providers, true ),
            true
        );
    }

    #setProvider(
        provider: Provider | EmptyDependency | ( Provider | EmptyDependency )[],
        register = false
    ): ( EmptyDependency | InjectionToken )[] {

        const providers = Array.isArray( provider ) ? provider : [ provider ];
        const tokens: ( EmptyDependency | InjectionToken )[] = [];

        providers.forEach( ( item: Provider | EmptyDependency ) => {

            if( item instanceof EmptyDependency ) {
                this.dependencies.set( item, null );
                return;
            }

            provider = typeof item === 'function' ? { provide : item, useClass : item } : item;

            const token = provider.provide;

            /**
             * External injections make duplicate dependencies registration.
             * So remove the duplication check here.
             */
            // if( this.dependencies.has( token ) ) {
            //     throw new DuplicateDependenciesException( token );
            // }

            register && this.registeredProviders.set( token, provider );

            const entry = new InjectionEntry( { provider } );

            if( 'scope' in provider && provider.scope !== undefined ) {
                entry.scope = provider.scope;
            } else {
                if( !( 'useClass' in provider ) ) {
                    entry.scope = this.defaultScope;
                } else {
                    entry.scope = Reflect.getMetadata( INJECTABLE_METADATA_KEY, provider.useClass )?.scope ?? this.defaultScope;
                }
            }

            this.dependencies.set( token, entry );

            tokens.push( token );
        } );

        return tokens;
    }

    #scopeBubbleUp( token: InjectionToken | EmptyDependency, path: ( InjectionToken | EmptyDependency )[] ): void {
        if( token instanceof EmptyDependency ) return;
        const currentNode = this.dependencies.get( token ) as InjectionEntry;
        const { scope } = currentNode;
        if( scope === null ) return;
        const weight = scopeWeight[ scope ] ;

        for( const item of path ) {
            const node = this.dependencies.get( item ) as InjectionEntry;
            if( weight <= scopeWeight[ node.scope as Scope ] ) return;
            node.scope = scope;
        }
    }

    #collateClassProvider( entry: InjectionEntry<ClassProvider>, token: InjectionToken ): void {

        // if( entry.provider?.provide.toString().includes( 'MongoClient' ) ) {
        //     console.trace();
        //     console.log( 'ppppppppppppppppppppppp', entry.provider, token );
        // }

        const { useClass, args } = entry.provider;

        // get all parameters of the given constructor if the provider is a `ClassProvider`.
        const params = createClassProviderParameters.get( useClass ) ?? [];

        const constructorParameters: ( InjectionToken | EmptyDependency )[] = [];

        /**
         * `@Inject()` can be used as a property decorator
         *
         * ```ts
         * class Example {
         *     @Inject( ExampleService )
         *     declare service: ExampleService;
         * }
         * ```
         */
        const injectedProperties: Record<string | symbol, InjectionToken | EmptyDependency> = {};

        /**
         * @todo It's wrong to save constructor parameters with `Constructor` of the provider.
         * if a constructor is injected multiple time with different args in an application
         * It'll cause problems.
         */
        Reflect.getMetadata( 'design:paramtypes', useClass )?.forEach( ( paramtype: InjectionToken, i: number ) => {

            // Skip all static arguments provided by the imported provider
            if( args && i < args.length ) return;

            const param = params[ i ];

            /**
             *  the token is being about to inject.
             */
            const t = ( param instanceof InjectionParam && param.token !== undefined )
                ? param.token
                : paramtype;

            if( !this.registeredProviders.has( t ) ) {

                // If the parameter is optional, use `EmptyDependency` instead
                if( ( param instanceof InjectionParam ) && param.optional ) {
                    const empty = new EmptyDependency( t, param.defaultValue );
                    this.#setProvider( empty );
                    this.dependencies.addDependency( token, empty );
                    constructorParameters.push( empty );
                } else if( this.autoRegister && typeof t === 'function' && t.toString().startsWith( 'class' ) ) {
                    const provider = { provide : t, useClass : t } as ClassProvider;
                    this.#collateProviders( this.#setProvider( provider, true ), true );
                    this.dependencies.addDependency( token, t );
                    constructorParameters.push( t );
                } else {
                    throw new UnknownDependencyException( token, i, t );
                }
            } else {
                this.dependencies.addDependency( token, t );
                constructorParameters.push( t );
            }
        } );

        /**
         * Collate dependencies injected with @Inject() property decorator.
         */
        const propertyInjectionMetadata = Reflect.getMetadata( INJECT_PROPERTY_METADATA_KEY, useClass.prototype );

        propertyInjectionMetadata && Object.keys( propertyInjectionMetadata ).forEach( ( key: string | symbol ) => {
            const param = propertyInjectionMetadata[ key ];
            const t = param.token ?? Reflect.getMetadata( 'design:type', useClass.prototype, key );

            if( !this.registeredProviders.has( t ) ) {
                if( !param.optional ) {
                    throw new UnknownPropertyDependencyException( token, key, t );
                }
                const empty = new EmptyDependency( t );
                this.#setProvider( empty );
                this.dependencies.addDependency( token, empty );
                injectedProperties[ key ] = empty;
            } else {
                this.dependencies.addDependency( token, t );
                injectedProperties[ key ] = t;
            }
        } );

        const extraDependenciesMetadata = Reflect.getMetadata( EXTRA_DEPENDENCIES_METADATA_KEY, useClass );

        extraDependenciesMetadata?.forEach( ( metadata: ExtraDependenciesMetadata ) => {
            const { provider } = metadata;
            const provide = typeof provider === 'function' ? provider : provider.provide;
            if( this.dependencies.nodes.has( provide ) ) return;
            this.set( provider );
            this.dependencies.addDependency( token, provide );
        } );

        this.#injectDependenciesMetadata.set( entry.provider.provide, {
            constructorParameters,
            injectedProperties
        } );

        // Reflect.defineMetadata( INJECT_DEPENDENCIES_METADATA_KEY, {
        //     constructorParameters,
        //     injectedProperties
        // }, useClass );
    }

    #injectDependenciesMetadata = new Map<InjectionToken, ClassProviderDependenciesMetadata>();

    #collateFactoryProvider( entry: InjectionEntry<FactoryProvider>, token: InjectionToken ): void {

        const inject: ( InjectionToken | EmptyDependency )[] = [];

        entry.provider.inject?.forEach( ( tokenOrOptions: InjectionToken | OptionalFactoryDependency, i: number ) => {
            let t: InjectionToken;
            let optional = false;

            if( typeof tokenOrOptions === 'object' ) {
                t = tokenOrOptions.token;
                optional = tokenOrOptions.optional ?? false;
            } else {
                t = tokenOrOptions;
            }

            if( !this.registeredProviders.has( token ) ) {
                if( !optional ) {
                    throw new UnknownDependencyException( token, i, t );
                }
                const empty = new EmptyDependency( t );
                this.#setProvider( empty );
                this.dependencies.addDependency( token, empty );
                inject.push( empty );
            } else {
                this.dependencies.addDependency( token, t );
                inject.push( t );
            }
        } );

        this.dependenciesMetadata.set( token, { inject } );
    }

    #instantiateClassProvider<T = unknown>(
        token: InjectionToken,
        entry: InjectionEntry<ClassProvider>,
        cacheMap: Partial<Record<Scope, InstanceCache>>
    ): T {
        const { provider } = entry;
        const { useClass } = provider;
        const instances: unknown[] = [];

        // const metadata = Reflect.getMetadata( INJECT_DEPENDENCIES_METADATA_KEY, useClass ) as ClassProviderDependenciesMetadata;
        const metadata = this.#injectDependenciesMetadata.get( provider.provide ) as ClassProviderDependenciesMetadata;

        if( !metadata ) {
            throw new Error( `Cannot find injection metadata of ${useClass.name}` );
        }

        const { constructorParameters, injectedProperties } = metadata;

        constructorParameters.forEach( ( dependency: InjectionToken | EmptyDependency ) => {
            if( dependency instanceof EmptyDependency ) {
                instances.push( dependency.value ?? undefined );
                return;
            }
            instances.push( this.instantiate( dependency, cacheMap ) );
        } );

        const args = provider.args?.map( ( arg ) => {
            return typeof arg === 'function' ? arg( this ) : arg;
        } ) ?? [];

        const instance = new useClass( ...[ ...args, ...instances ] );

        Object.keys( injectedProperties ).forEach( ( key: string | symbol ) => {
            const token = injectedProperties[ key ];
            instance[ key ] ??= token instanceof EmptyDependency
                ? undefined
                : this.instantiate( token, cacheMap );
        } );

        return instance;
    }

    #instantiateFactoryProvider<T = any>(
        token: InjectionToken,
        entry: InjectionEntry<FactoryProvider>,
        cacheMap: Partial<Record<Scope, InstanceCache>>
    ): T {
        const { provider } = entry;
        const { useFactory } = provider;

        const args = provider.args?.map( arg => {
            return typeof arg === 'function' ? arg( this ) : arg;
        } ) ?? [];

        const instances: unknown[] = [];
        const metadata = this.dependenciesMetadata.get( token ) as FactoryProviderDependenciesMetadata;

        metadata?.inject.forEach( ( dependency: InjectionToken | EmptyDependency ) => {
            if( dependency instanceof EmptyDependency ) {
                instances.push( dependency.value ?? undefined );
                return;
            }
            instances.push( this.instantiate( dependency, cacheMap ) );
        } );

        return useFactory( ...[ ...args, ...instances ] );
    }

    /**
     * Collate dependency relationship between providers, find out circular dependency and bubble up scopes.
     *
     * @param tokens -
     * @param deeply - while setting an `Entrance` provider, it doesn't need to traverse it's dependencies deeply, because before adding entrances providers, for example `controllers`, all providers have already been collated.
     */
    #collateProviders( tokens: ( InjectionToken | EmptyDependency )[], deeply = false ): void {

        const { dependencies } = this;

        tokens.forEach( ( token: EmptyDependency | InjectionToken ) => {
            if( token instanceof EmptyDependency ) return;

            const entry = this.dependencies.get( token );

            if( !entry ) {
                throw new UndefinedDependencyException( token );
            }

            if( 'useClass' in entry.provider ) {
                this.#collateClassProvider( entry as InjectionEntry<ClassProvider>, token );
            } else if( 'useFactory' in entry.provider ) {
                this.#collateFactoryProvider( entry as InjectionEntry<FactoryProvider>, token );
            }

            deeply || dependencies.getDependencies( token ).forEach( ( t ) => {
                this.#scopeBubbleUp( t, [ token ] );
            } );
        } );

        if( deeply ) {

            const visited = new Set<InjectionToken | EmptyDependency>();

            tokens.forEach( ( token: InjectionToken | EmptyDependency ) => {

                // skip visited nodes
                if( visited.has( token ) ) return;

                dependencies.dfs( token, ( t, currentPath, hasCircular ) => {
                    if( t instanceof EmptyDependency ) return;
                    if( hasCircular ) throw new CircularDependencyException( t, currentPath as InjectionToken[] );
                    this.#scopeBubbleUp( t, currentPath );
                    if( visited.has( t ) ) return false;
                    visited.add( t );
                } );

            } );
        }

        /**
         * Instantiate providers whose scope is `Scope.DEFAULT` automatically.
         */
        // tokens.forEach( ( token: InjectionToken | EmptyDependency ) => {
        //     /**
        //      * Instantiate the provider if it's scope is `Scope.DEFAULT`.
        //      */
        //     if( !( token instanceof EmptyDependency ) ) {
        //         const entry = dependencies.get( token );
        //         if( entry?.scope === Scope.DEFAULT ) {
        //             this.instantiate( token );
        //         }
        //     }
        // } );
    }

    set( provider: Provider | EmptyDependency | ( Provider | EmptyDependency )[] ): void {
        this.#collateProviders( this.#setProvider( provider ) );
    }

    get(): ( InjectionEntry | null )[];
    get( token: EmptyDependency ): null | undefined;
    get( token: InjectionToken ): InjectionEntry | undefined;
    get( token?: EmptyDependency | InjectionToken ): ( InjectionEntry | null )[] | InjectionEntry | null | undefined {
        if( !token ) return [ ...this.dependencies.nodes.values() ];
        return this.dependencies.get( token );
    }

    getClassProviders(): ClassProvider[] {
        return this.get()
            .map( entry => entry?.provider )
            .filter( ( provider ): provider is ClassProvider => {
                return !!provider && 'useClass' in provider;
            } );
    }

    /**
     * Instantiate an injectable object
     *
     * @example
     *
     * ```ts
     * const providers = new Map();
     *
     * providers.set( SampleProvider, {
     *     scope : Scope.REQUEST,
     *     useClass : SampleProvider
     * } );
     *
     * const injection = new Injection( { providers } );
     *
     * const requestInstanceCache = new InstanceCache();
     *
     * injection.instantiate( SampleProvider, {
     *     [ Scope.REQUEST ] : requestInstanceCache
     * } );
     * ```
     *
     * @param token - the `InjectionToken` of the target provider
     * @param cacheMap - InstanceCache for storing instances in different scope level.
     */
    instantiate<T = any>(
        token: InjectionToken,
        cacheMap: Partial<Record<Scope, InstanceCache>> = {}
    ): T {

        const entry = this.dependencies.get( token );

        if( !entry ) {
            throw new UndefinedDependencyException( token );
        }

        const cache = ( {
            [ Scope.GLOBAL ] : globalInstanceCache,
            [ Scope.DEFAULT ] : this.cache,
            [ Scope.DEFERRED ] : this.cache,
            ...cacheMap
        } )[ entry.scope ?? this.defaultScope ];

        // if( Scope.GLOBAL ) {
        //     console.log( '999999999999999999999999999', token );
        // }

        /**
         * Try looking for existing instance from cache
         */
        if( cache ) {
            const instance = cache.get( token );
            if( instance ) return instance as T;
        }

        const { provider } = entry;

        /**
         * StaticProvider
         */
        if( 'value' in provider ) return provider.value as T;

        let instance;

        /**
         * ClassProvider
         */
        if( 'useClass' in provider ) {
            instance = this.#instantiateClassProvider<T>(
                token,
                entry as InjectionEntry<ClassProvider>,
                cacheMap
            );
        } else if( 'useFactory' in provider ) {
            instance = this.#instantiateFactoryProvider<T>(
                token,
                entry as InjectionEntry<FactoryProvider>,
                cacheMap
            );
        }

        cache?.set( token, instance );

        return instance as T;
    }
}
