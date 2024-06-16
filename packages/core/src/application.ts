/******************************************************************
 * Copyright (C) 2022-2023 NextSeason
 *
 * @File: src/application.ts
 *
 * This file is part of NextSeason projects.
 * Code in this file can not be copied and/or distributed without the
 * express permission of NextSeason. Inc
 ******************************************************************/

import 'reflect-metadata';
import { Class, SetOptional } from 'type-fest';
import { createInterceptorBefore, createInterceptorAfter, createInterceptorException, createInterceptorFinally, createInterceptorParameter } from '@ussuri/method-interceptor';
import { Injection, Scope, Provider } from '@ussuri/injection';
import { ModuleDescriptor } from './module';
import { ControllerClass, ControllerItem } from './interfaces';
import { Context } from './context';
import { defineInjectablePipeMetadata, getInjectablePipeMetadata, isPipeTransformConstructor } from './pipe';
import { getActionMetadatas, getActionRoutingMetadata } from './action';
import { MODULE_METADATA_KEY, MODULE_ROUTING_GROUP_NAME } from './constants';
import { compose, ComposeOptions, mergeApplicationOptions, escapeRegexp } from './utils';
import { Dataclass, DataclassMetadata } from './dataclass';
import { InternalRouteMap, Router, RouteMap, RouteMatches, RouteRule } from './router';
import { getControllerRoutingMetadata } from './controller';
import { RouteNotMatchError, ModuleNotFoundError, ControllerNotFoundError, ActionNotFoundError } from './errors';
import { getRegisteredServerMetadata } from './register-server';

interface Handler<T = any> {
    ( context: T ): unknown;
}

export interface ApplicationOptions<T = any> {

    module?: ModuleDescriptor[ 'module' ];
    /**
     * mounting path of current application/module
     */
    path?: Application<T>[];

    /**
     * The default Scope of controllers and providers in current application/module
     */
    defaultScope?: Scope;

    /**
     * Controllers for current application/module, they'll be set into injection instance.
     */
    controllers?:
        | ( ControllerClass | ControllerItem )[]
        | ( ( controllers: ( ControllerClass | ControllerItem )[] ) => ( ControllerClass | ControllerItem )[] );

    /**
     * Providers which will be set into injection instance.
     */
    providers?:
        | Provider[]
        |( ( providers: Provider[] ) => Provider[] );

    /**
     * Modules that will be mounted to the application/module
     */
    modules?:
        | Record<string, Class<unknown> | ModuleDescriptor>
        | ( ( modules: Record<string, Class<unknown> | ModuleDescriptor> ) => Record<string, Class<unknown> | ModuleDescriptor> );
}

export interface MergedApplicationOptions<T = any> {

    module?: ModuleDescriptor[ 'module' ];
    /**
     * mounting path of current application/module
     */
    path?: Application<T>[];

    /**
     * The default Scope of controllers and providers in current application/module
     */
    defaultScope?: Scope;

    /**
     * Controllers for current application/module, they'll be set into injection instance.
     */
    controllers?: ( ControllerClass | ControllerItem )[];

    /**
     * Providers which will be set into injection instance.
     */
    providers?: Provider[];

    /**
     * Modules that will be mounted to the application/module
     */
    modules?: Record<string, Class<unknown> | ModuleDescriptor>;
}

/**
 * @example
 *
 * ```ts
 * new Application( {
 *     controllers : [ TestController ],
 *     providers : [ TestProvider ]
 * } )
 * ```
 *
 * ```ts
 * @Module( {
 *     controllers : [ TestController ],
 *     providers : [ TestProvider ]
 * } )
 * class TestModule {}
 *
 * Application.create( MainModule );
 * ```
 */

export class Application<T = any> {

    static Application: Class<Application> = Application;

    /**
     * Create an Application instance with module, module lifecycle decorators can be used with module class.
     *
     * @example:
     *
     * ```ts
     * @Input()
     * @Output()
     * @Module( options )
     * class MainModule {}
     *
     * const options: ApplicationOptions<T> = {};
     *
     * const app1 = Application.create( MainModule );
     *
     * const app2 = Application.create( MainModule, options );
     *
     * const app3 = Application.create( {
     *     module : MainModule,
     *     options
     * } );
     * ```
     */
    static create<C = any, A extends Application<C> = Application<C>>(
        moduleOrDescriptor: Class<unknown> | ModuleDescriptor<C>,
        options?: ApplicationOptions<C>
    ): A {

        let module: Class<unknown>;

        /**
         * Get metadata of module which may have been added with `@Module()` decorator.
         */

        if( typeof moduleOrDescriptor !== 'function' ) {
            module = moduleOrDescriptor.module;
            options = {
                ...options,
                ...moduleOrDescriptor.options
            };
        } else {
            module = moduleOrDescriptor;
        }

        const metadata = {
            ...Reflect.getMetadata( MODULE_METADATA_KEY, module ),
            module
        };

        return new this.Application( options ? mergeApplicationOptions( options, metadata ) : metadata ) as A;
    }

    /**
     * The `Module` be bound to current `Application`, it'll usually happen while using `Application.create()`.
     */
    module?: ApplicationOptions<T>[ 'module' ];

    path: Application<T>[] = [ this ];

    modules: Record<string, Application<T>> = {};

    injection!: Injection;

    controllers!: ( ControllerClass | ControllerItem )[];

    providers!: Provider[];

    handlers = new Map<ControllerClass, Record<string | symbol, Handler<T>>>();

    router = new Router<T>();

    registeredServersInitialized!: Promise<unknown[]>;

    constructor( applicationOptions: Readonly<ApplicationOptions<T>> = {} ) {
        const options = {
            defaultScope : Scope.DEFAULT,
            ...mergeApplicationOptions(
                applicationOptions,
                Reflect.getMetadata( MODULE_METADATA_KEY, this.constructor ) ?? {}
            )
        };

        options.module && ( this.module = options.module );
        options.path && ( this.path = [ ...options.path, this ] );

        this.setupProviders( options );
        this.setupControllers( options );
        this.setupInjection();
        this.setupModules( options );
        this.setupHandlers();
        this.setupRouters();
        this.setupRegisteredServers();

        for( const instance of this.injection.cache.values() ) {
            if( instance && typeof ( instance as any ).onApplicationBootstrap === 'function' ) {
                ( instance as any ).onApplicationBootstrap( this );
            }
        }
    }

    protected setupProviders( options: MergedApplicationOptions ): void {
        this.providers = [ ...( options.providers ?? [] ) ];
    }

    protected setupControllers( options: MergedApplicationOptions ): void {
        this.controllers = options.controllers ?? [];

        this.controllers.forEach( ( controller: ControllerClass | ControllerItem ) => {
            const controllerClass = typeof controller === 'function' ? controller : controller.useClass;
            const proto = controllerClass.prototype;
            const actionMetadatas = getActionMetadatas( proto );

            actionMetadatas && Reflect.ownKeys( actionMetadatas ).forEach( ( name: string | symbol ) => {
                Reflect.getMetadata( 'design:paramtypes', proto, name )?.forEach( ( paramtype: any ) => {
                    const metadata = Dataclass.metadata( paramtype );
                    metadata && defineInjectablePipeMetadata(
                        controllerClass,
                        DataclassMetadata.pipes( metadata ).filter( isPipeTransformConstructor )
                    );
                } );
            } );
        } );
    }

    protected setupModules( options: MergedApplicationOptions ): void {
        const { modules } = options;

        modules && Object.keys( modules ).forEach( ( name: string ) => {
            this.modules[ name ] = ( this.constructor as any ).create( modules[ name ], {
                path : this.path
            } );
        } );
    }

    protected setupInjection(): void {
        this.injection = new Injection( { providers : this.providers } );

        this.injection.set( getInjectablePipeMetadata( this.module ?? this.constructor ) );

        /**
         * Transform `ControllerItem`s to match `ClassProvider`, and add them into injection instance.
         */
        this.injection.set( this.controllers.map( ( controller: ControllerClass | ControllerItem ) => {

            const isControllerClass = typeof controller === 'function';
            const controllerClass = isControllerClass ? controller : controller.useClass;

            this.injection.set( getInjectablePipeMetadata( controllerClass ) );

            return isControllerClass ? controller : {
                ...controller,
                provide : controller.useClass
            };
        } ) );
    }

    protected setupHandlers(): void {
        const { injection, handlers } = this;

        this.controllers.forEach( ( controller: ControllerClass | ControllerItem ) => {
            const controllerClass = typeof controller === 'function' ? controller : controller.useClass;
            const controllerInterceptorBefore = createInterceptorBefore( controllerClass );
            const controllerInterceptorAfter = createInterceptorAfter( controllerClass );
            const controllerInterceptorException = createInterceptorException( controllerClass );
            const controllerInterceptorFinally = createInterceptorFinally( controllerClass );
            const proto = controllerClass.prototype;
            const actionMetadatas = getActionMetadatas( proto );
            const actions: Record<string | symbol, Handler<T>> = {};

            actionMetadatas && Reflect.ownKeys( actionMetadatas ).forEach( ( name: string | symbol ) => {

                const descriptor = Object.getOwnPropertyDescriptor( proto, name ) as PropertyDescriptor;

                const before = createInterceptorBefore( descriptor );
                const after = createInterceptorAfter( descriptor );
                const exception = createInterceptorException( descriptor );
                const fnly = createInterceptorFinally( descriptor );
                const parameter = createInterceptorParameter<[ T, Application<T> ]>( proto, name );
                const paramtypes = Reflect.getMetadata( 'design:paramtypes', proto, name );

                actions[ name ] = async ( context: T ): Promise<unknown> => {
                    let output;

                    try {
                        const instance = injection.instantiate( controllerClass );
                        await controllerInterceptorBefore( context, this );

                        try {
                            await before( context, this );
                            const params = await parameter( context, this );

                            /**
                             * Transform param to Dataclass if the paramtype is a Dataclass
                             */
                            const promises: Promise<unknown>[] = [];

                            params.forEach( ( param: any, i: number ) => {
                                const paramtype = paramtypes[ i ];
                                if( Dataclass.metadata( paramtype ) ) {
                                    const promise = Dataclass.create(
                                        paramtype,
                                        param,
                                        context,
                                        this,
                                        { paramtype }
                                    ).then( value => {
                                        params[ i ] = value;
                                    } );
                                    promises.push( promise );
                                }
                            } );

                            await Promise.all( promises );

                            output = await instance[ name ]( ...params );
                            output = await after( output, context, this );
                        } catch( e: unknown ) {
                            /**
                             * Exception interceptors are able to suppress the exception and return a normal output value.
                             */
                            output = await exception( e, context, this );
                        } finally {
                            await fnly( context, this );
                        }

                        output = await controllerInterceptorAfter( output, context, this );

                    } catch( e: unknown ) {
                        output = await controllerInterceptorException( e, context, this );
                    } finally {
                        await controllerInterceptorFinally( context, this );
                    }

                    return output;
                };
            } );

            handlers.set( controllerClass, actions );
        } );
    }

    protected setupRouters(): void {
        const { router, controllers } = this;

        controllers.forEach( ( controller: ControllerClass | ControllerItem ) => {
            const controllerClass = typeof controller === 'function' ? controller : controller.useClass;
            const proto = controllerClass.prototype;
            const { rules : rulesController } = getControllerRoutingMetadata( controllerClass ) ?? {};
            const actionRoutingMetadata = getActionRoutingMetadata( proto );

            actionRoutingMetadata && rulesController && Reflect.ownKeys( actionRoutingMetadata ).forEach( ( name: string | symbol ) => {
                const { rules : rulesAction } = actionRoutingMetadata[ name ];

                Reflect.ownKeys( rulesAction ).forEach( group => {
                    rulesAction[ group ].forEach( ( rule ) => {
                        rulesController[ group ]?.forEach( ( item ) => {
                            if( !item.namespace || !rule.namespace || item.namespace === rule.namespace ) {
                                router.add( {
                                    group,
                                    namespace : rule.namespace ?? item.namespace,
                                    pattern : [ item.pattern ?? '', rule.pattern ?? '' ],
                                    handle : rule.handle ?? item.handle,
                                    dest : {
                                        controller : controllerClass,
                                        action : name
                                    }
                                } );
                            }
                        } );
                    } );
                } );

            } );

        } );

        Object.keys( this.modules ).forEach( ( name: string ) => {
            const prefix = ( name.startsWith( '/' ) ? name : `/${name}` ).replace( /\/+$/, '' );

            router.add( {
                namespace : '*',
                group : MODULE_ROUTING_GROUP_NAME,
                pattern : new RegExp( `${escapeRegexp( prefix )}(?:/.*|$|\\?|#)` ),
                dest : () => {
                    // context.routing.path = context.routing.path.slice( prefix.length );
                    return { module : name };
                }
            } );
        } );
    }

    async setupRegisteredServers(): Promise<unknown[]> {
        const metadata = getRegisteredServerMetadata( this.constructor );
        const promises: Promise<unknown>[] = [];

        metadata && Reflect.ownKeys( metadata ).forEach( ( name: string | symbol ) => {
            const init = metadata[ name ].init;
            init && promises.push( init.call( this ) );
        } );

        return promises;
    }

    async start(): Promise<unknown[]> {
        const metadata = getRegisteredServerMetadata( this.constructor );
        const promises: Promise<unknown>[] = [];

        metadata && Reflect.ownKeys( metadata ).forEach( ( name: string | symbol ) => {
            const start = metadata[ name ].start;
            start && promises.push( start.call( this ) );
        } );
        return promises;
    }

    async handle<R = any>( handler: string | symbol, ...args: any[] ): Promise<R> {
        const metadata = getRegisteredServerMetadata( this.constructor );

        const item = metadata?.[ handler ];

        if( !item ) {
            throw new Error( `Server ${String( handler )} not exists in ${this.constructor.name}` );
        }

        const handle = item.handle;

        if( !handle ) {
            throw new Error( `handle doesn't provide handle method in ${this.constructor.name}` );
        }

        return handle.call( this, ...args );
    }

    service<T = any>( ...args: Parameters<Injection[ 'instantiate' ]> ): T {
        return this.injection.instantiate<T>( ...args );
    }

    async close(): Promise<void> {
        const promises: Promise<unknown>[] = [];

        for( const instance of this.injection.cache.values() ) {
            if( instance && typeof ( instance as any ).onApplicationShutdown === 'function' ) {
                promises.push( ( instance as any ).onApplicationShutdown( this ) );
            }
        }

        /**
         * Call all close methods for all mounted modules
         */
        Object.values( this.modules ).forEach( module => {
            promises.push( module.close() );
        } );

        const metadata = getRegisteredServerMetadata( this.constructor );

        metadata && Reflect.ownKeys( metadata ).forEach( ( name: string | symbol ) => {
            const close = metadata[ name ].close;

            if( close ) {
                const res = close.call( this );
                res && promises.push( res );
            }
        } );

        await Promise.all( promises );
    }

    async visit<R = any>(
        ruleOrPath: SetOptional<RouteRule, 'group'> | string,
        context: T,
        options?: ComposeOptions
    ): Promise<R> {

        const rule: SetOptional<RouteRule, 'group'> = typeof ruleOrPath === 'string'
            ? { path : ruleOrPath }
            : ruleOrPath;

        return compose( this, context, async ( context ) => {
            const match = this.router.match( rule );

            if( match === false ) {
                throw new RouteNotMatchError();
            }

            const { rule : { dest, handle }, params, matches } = match;

            let route: RouteMap;

            if( typeof dest === 'function' ) {
                const res = await dest( context, params, matches );
                if( res === undefined ) return context as unknown as R;
                if( res instanceof Context ) return res as R;
                route = res as RouteMap;
            } else {
                route = dest as RouteMap;
            }

            if( 'module' in route ) {
                const name = route.module;

                if( !this.modules[ name ] ) {
                    throw new ModuleNotFoundError( `cannot found module ${name}` );
                }

                const reg = new RegExp( `/${escapeRegexp( name )}` );
                const path = rule.path.replace( reg, '' );

                return this.modules[ name ].visit( { ...rule, path }, context );
            }

            if( handle ) {
                return handle( this, context, route, match );
            }

            return this.run<R>( context, route, match );
        }, options );
    }

    async run<R = any>(
        context: T,
        route: InternalRouteMap,
        match: RouteMatches<T> // eslint-disable-line @typescript-eslint/no-unused-vars
    ): Promise<R> {
        return this.callHandler( route.controller, route.action, context );
    }

    async call( controller: ControllerClass, action: string | symbol, context: T ): Promise<any> {
        return compose( this, context, async ( ctx ) => {
            return this.callHandler( controller, action, ctx );
        } );
    }

    async callHandler( controller: ControllerClass, action: string | symbol, context: T ): Promise<any> {
        const actions = this.handlers.get( controller );

        if( !actions ) {
            throw new ControllerNotFoundError( `${ controller.name } not exists` );
        }

        const handler = actions[ action ];

        if( !handler ) {
            throw new ActionNotFoundError( `${String( action )} does not exist in controller ${ controller.name }` );
        }

        return handler( context );
    }
}
