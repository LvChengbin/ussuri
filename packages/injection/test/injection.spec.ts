/******************************************************************
 * Copyright (C) 2022 LvChengbin
 *
 * File: test/injection.spec.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 02/13/2022
 * Description:
 ******************************************************************/

import {
    Injection,
    Scope,
    Injectable,
    INJECTABLE_METADATA_KEY,
    Inject,
    CircularDependencyException,
    UndefinedDependencyException,
    // DuplicateDependenciesException,
    UnknownDependencyException,
    UnknownPropertyDependencyException
} from '../src';
import { InjectionEntry } from '../src/injection-entry';
import { InjectionParam } from '../src/injection-param';
import { EmptyDependency } from '../src/empty-dependency';
import { InstanceCache } from '../src/instance-cache';

describe( 'injection', () => {
    describe( 'static properties', () => {

        it( 'Entry', () => {
            expect( Injection ).toHaveProperty( 'Entry', InjectionEntry );
        } );

        it( 'Param', () => {
            expect( Injection ).toHaveProperty( 'Param', InjectionParam );
        } );

        it( 'InstanceCache', () => {
            expect( Injection ).toHaveProperty( 'InstanceCache', InstanceCache );
        } );

        it( 'EmptyDependency', () => {
            expect( Injection ).toHaveProperty( 'EmptyDependency', EmptyDependency );
        } );

        it( 'INJECTABLE_METADATA_KEY', () => {
            expect( Injection ).toHaveProperty( 'INJECTABLE_METADATA_KEY', INJECTABLE_METADATA_KEY );
        } );

        it( 'defineInjectableMetadata', () => {
            expect( Injection ).toHaveProperty( 'defineInjectableMetadata', expect.any( Function ) );

            class Test {}
            Injection.defineInjectableMetadata( Test, { scope : Scope.REQUEST } );
            const metadata = Reflect.getMetadata( INJECTABLE_METADATA_KEY, Test );
            expect( metadata ).toEqual( { scope : Scope.REQUEST } );
        } );
    } );

    it( 'should register providers passed to constructor', () => {

        class SampleProvider {}

        const injection = new Injection( {
            providers : [ SampleProvider ]
        } );

        expect( injection.registeredProviders ).toEqual( new Map( [
            [ SampleProvider, { provide : SampleProvider, useClass : SampleProvider } ]
        ] ) );
    } );

    it( 'auto-register', () => {

        class B {}

        @Injectable()
        class A {
            constructor( public b: B ) {}
        }

        const injection = new Injection( {
            providers : [ A ]
        } );

        expect( injection.registeredProviders ).toEqual( new Map( [
            [ A, { provide : A, useClass : A } ],
            [ B, { provide : B, useClass : B } ]
        ] ) );

        const a = injection.instantiate( A );
        expect( a.b ).toBeInstanceOf( B );
    } );

    it( 'should create correct instance', () => {
        class SampleProvider {}

        const injection = new Injection( {
            providers : [ SampleProvider ]
        } );

        const instance = injection.instantiate( SampleProvider );
        expect( instance ).toBeInstanceOf( SampleProvider );
    } );

    it( 'should generate correct dependency graph', () => {
        class SampleService {}

        @Injectable()
        class SampleProvider {
            constructor( public service: SampleService ) {}
        }

        const injection = new Injection( {
            providers : [ SampleProvider, SampleService ]
        } );

        expect( injection.dependencies.nodes.size ).toEqual( 2 );
        expect( injection.dependencies.nodes.has( SampleProvider ) ).toBeTruthy();
        expect( injection.dependencies.nodes.has( SampleService ) ).toBeTruthy();
        expect( injection.dependencies.getDependencies( SampleProvider ) ).toEqual( [ SampleService ] );
    } );

    it( 'correct dependence injection with no @Inject() decorator', () => {

        class SampleService {}

        @Injectable()
        class SampleProvider {
            constructor( public service: SampleService ) {}
        }

        const injection = new Injection( {
            providers : [ SampleProvider, SampleService ]
        } );

        const instance = injection.instantiate( SampleProvider );
        expect( instance ).toHaveProperty( 'service', expect.any( SampleService ) );
    } );

    it( 'should set correct scope to injection entries', () => {
        class A {}

        @Injectable( { scope : Scope.REQUEST } )
        class B {}

        @Injectable( { scope : Scope.REQUEST } )
        class E {}

        @Injectable( { scope : Scope.TRANSIENT } )
        class D {
            constructor( private e: E ) {}
        }

        @Injectable( { scope : Scope.REQUEST } )
        class C {
            constructor( private d: D ) {}
        }

        const injection = new Injection( {
            providers : [ A, B, C, D, E, {
                provide : 'A',
                useClass : A,
                scope : Scope.DEFERRED
            }, {
                provide : 'B',
                useClass : B,
                scope : Scope.TRANSIENT
            } ]
        } );

        const nodes = injection.dependencies.nodes;
        expect( nodes.get( A ).scope ).toEqual( Scope.DEFAULT );
        expect( nodes.get( B ).scope ).toEqual( Scope.REQUEST );
        expect( nodes.get( 'A' ).scope ).toEqual( Scope.DEFERRED );
        expect( nodes.get( C ).scope ).toEqual( Scope.TRANSIENT );
        expect( nodes.get( D ).scope ).toEqual( Scope.TRANSIENT );
    } );

    it( 'should get instance from cache if scope of provider is set to `Scope.DEFAULT`', () => {

        class SampleProvider {}

        const injection = new Injection( {
            providers : [ SampleProvider ]
        } );

        expect( injection.instantiate( SampleProvider ) ).toBe( injection.instantiate( SampleProvider ) );
    } );

    it( 'should always create a new instance if the scope of provider is set to `Scope.TRANSIENT`', () => {
        class SampleProvider {}

        const injection = new Injection( {
            providers : [ {
                provide : SampleProvider,
                useClass : SampleProvider,
                scope : Scope.TRANSIENT
            } ]
        } );

        const instance1 = injection.instantiate( SampleProvider );
        const instance2 = injection.instantiate( SampleProvider );

        expect( instance1 ).not.toBe( instance2 );
    } );

    it( 'set scope with @Injectable', () => {
        @Injectable( { scope : Scope.TRANSIENT } )
        class SampleProvider {}

        const injection = new Injection( {
            providers : [ SampleProvider ]
        } );

        const instance1 = injection.instantiate( SampleProvider );
        const instance2 = injection.instantiate( SampleProvider );

        expect( instance1 ).not.toBe( instance2 );
    } );

    it( 'provide Scope.REQUEST level instance cache', () => {

        @Injectable( { scope : Scope.REQUEST } )
        class B {}

        @Injectable( { scope : Scope.REQUEST } )
        class A {
            constructor( public b: B ) {}
        }

        const injection = new Injection( {
            providers : [ A, B ]
        } );

        const cache = new Injection.InstanceCache();
        const options = { [ Scope.REQUEST ] : cache };

        const instance1 = injection.instantiate( A, options );
        const instance2 = injection.instantiate( A, options );

        expect( instance1 ).toBe( instance2 );
        expect( cache.get( A ) ).toEqual( instance1 );
        expect( cache.get( B ) ).toEqual( injection.instantiate( B, options ) );
    } );

    it( 'set new entry', () => {

        class A {}

        @Injectable()
        class B {
            constructor( public a: A ) {}
        }

        const injection = new Injection( {
            providers : [ A ]
        } );

        injection.set( B );
        const instance1 = injection.instantiate( B );
        const instance2 = injection.instantiate( B );
        expect( instance1 ).toHaveProperty( 'a', expect.any( A ) );
        expect( instance1 ).toBe( instance2 );
    } );

    it( 'instantiate a static provider', () => {

        class A {
            @Inject( '$' ) $: number;
        }

        const injection = new Injection( {
            providers : [
                { provide : '$', value : 123 }
            ]
        } );

        injection.set( A );

        const a = injection.instantiate( A );
        expect( a.$ ).toEqual( 123 );
    } );

    it( 'get entry from injection instance', () => {
        class A {}

        @Injectable()
        class B {
            constructor( public a: A ) {}
        }

        const injection = new Injection( {
            providers : [ A ]
        } );

        injection.set( B );
        expect( injection.get( A ) ).toEqual( {
            provider : {
                provide : A,
                useClass : A
            },
            scope : Scope.DEFAULT
        } );
        expect( injection.get( B ) ).toEqual( {
            provider : {
                provide : B,
                useClass : B
            },
            scope : Scope.DEFAULT
        } );
    } );

    it( 'should instantiate provder in defaule scope automatically', () => {

        const fn1 = jest.fn();
        const fn2 = jest.fn();

        class A {
            constructor() {
                fn2();
            }
        }

        @Injectable()
        class B {
            constructor( public a: A ) {
                fn1();
            }
        }

        const injection = new Injection( {
            providers : [ A ]
        } );

        injection.set( B );

        expect( fn1 ).toHaveBeenCalledTimes( 1 );
        expect( fn2 ).toHaveBeenCalledTimes( 1 );
    } );

    describe( 'exceptions', () => {

        it( 'CircularDependencyException', () => {

            interface IA {} // eslint-disable-line @typescript-eslint/no-empty-interface
            interface IB {} // eslint-disable-line @typescript-eslint/no-empty-interface

            @Injectable()
            class A implements IA {
                constructor( @Inject( 'B' ) private b: IB ) {}
            }

            @Injectable()
            class B implements IB {
                constructor( @Inject( 'A' ) private a: IA ) {}
            }

            function createInstance(): void {
                new Injection( {
                    providers : [
                        { provide : 'A', useClass : A },
                        { provide : 'B', useClass : B }
                    ]
                } );
            }

            expect( createInstance ).toThrow( CircularDependencyException );
        } );

        it( 'UndefinedDependencyException', () => {
            const injection = new Injection( {
                providers : []
            } );

            expect( () => { injection.instantiate( 'A' ) } ).toThrow( UndefinedDependencyException );
        } );

        // it( 'DuplicateDependenciesException', () => {
        //     class A {}
        //     const injection = new Injection( {
        //         providers : [ A ]
        //     } );
        //     expect( () => { injection.set( A ) } ).toThrow( DuplicateDependenciesException );
        // } );

        it( 'UnknownDependencyException', () => {

            @Injectable()
            class A {
                constructor( private b: string ) {}
            }

            function createInstance(): void {
                new Injection( {
                    providers : [ A ]
                } );
            }

            expect( createInstance ).toThrow( UnknownDependencyException );
        } );

        it( 'UnknownPropertyDependencyException', () => {
            class B {}
            class A {
                @Inject() b: B;
            }

            function createInstance(): void {
                new Injection( {
                    providers : [ A ]
                } );
            }

            expect( createInstance ).toThrow( UnknownPropertyDependencyException );
        } );
    } );

    describe( 'extra dependencies', () => {

        it( 'should add extra dependencies node into injection instance', () => {

            class C {}
            class B {}
            class A {
                @Inject() b: B;
            }

            const injection = new Injection( {
                providers : [ B ]
            } );

            Injection.defineExtraDependenciesMetadata( A, {
                provider : C
            } );

            injection.set( A );

            expect( injection.dependencies.nodes.has( C ) ).toEqual( true );
            expect( injection.dependencies.getDependencies( A ) ).toEqual( [ B, C ] );
        } );

        it( 'should not throw error with duplicate providers', () => {
            class B {}
            class A {
                @Inject() b: B;
            }

            const injection = new Injection( {
                providers : [ B ]
            } );

            Injection.defineExtraDependenciesMetadata( A, {
                provider : B
            } );

            injection.set( A );

            expect( injection.dependencies.nodes.has( B ) ).toEqual( true );
            expect( injection.dependencies.getDependencies( A ) ).toEqual( [ B ] );
        } );
    } );

} );
