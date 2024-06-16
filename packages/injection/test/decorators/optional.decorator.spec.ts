/******************************************************************
 * Copyright (C) 2022 LvChengbin
 *
 * File: decorators/optional.decorator.spec.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 02/13/2022
 * Description:
 ******************************************************************/

import { Inject, Optional, Injection } from '../../src';

describe( 'decorators/optional', () => {
    it( 'using as a parameter decorator', () => {

        class B {}
        class A {
            constructor( @Optional() public b: B ) {}
        }

        const injection = new Injection( {
            providers : [ A ]
        } );

        expect( injection.dependencies.getDependencies( A ) ).toEqual( [ new Injection.EmptyDependency( B ) ] );
        const a = injection.instantiate( A );
        expect( a ).toHaveProperty( 'b', undefined );
    } );

    it( 'using as a property decorator', () => {
        class B {}
        class A {
            @Optional() public b: B;
        }

        const injection = new Injection( {
            providers : [ A ]
        } );

        expect( injection.dependencies.getDependencies( A ) ).toEqual( [ new Injection.EmptyDependency( B ) ] );
        const a = injection.instantiate( A );
        expect( a ).toHaveProperty( 'b', undefined );
    } );

    it( 'using together with @Inject() decorator', () => {
        class B {}
        class A {
            @Inject() @Optional() public b: B;
        }

        const injection = new Injection( {
            providers : [ A ]
        } );

        expect( injection.dependencies.getDependencies( A ) ).toEqual( [ new Injection.EmptyDependency( B ) ] );
        const a = injection.instantiate( A );
        expect( a ).toHaveProperty( 'b', undefined );
    } );

    it( 'specify default value for optional parameter', () => {
        class B {}
        class A {
            constructor( @Optional( 'defaultValue' ) public b: B ) {}
        }

        const injection = new Injection( {
            providers : [ A ]
        } );

        expect( injection.dependencies.getDependencies( A ) ).toEqual( [
            new Injection.EmptyDependency( B, 'defaultValue' )
        ] );
        const a = injection.instantiate( A );
        expect( a ).toHaveProperty( 'b', 'defaultValue' );
    } );
} );
