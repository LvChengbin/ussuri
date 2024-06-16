/******************************************************************
 * Copyright (C) 2022 LvChengbin
 *
 * File: decorators/inject.decorator.spec.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 02/13/2022
 * Description:
 ******************************************************************/

import { Inject, Injection } from '../../src';

describe( 'decorators/inject', () => {
    it( 'using @Inject() as a parameter decorator', () => {

        class B {}

        class A {
            constructor( @Inject( 'B' ) public b: B ) {}
        }

        const injection = new Injection( {
            providers : [
                A,
                { provide : 'B', useClass : B }
            ]
        } );

        const dependencies = injection.dependencies.getDependencies( A );
        expect( dependencies ).toEqual( [ 'B' ] );

        const a = injection.instantiate( A );
        expect( a ).toHaveProperty( 'b', expect.any( B ) );
    } );

    it( 'using @Inject() as a property decorator', () => {

        class B {}

        class A {
            @Inject( 'B' ) public b: B;
        }

        const injection = new Injection( {
            providers : [
                A,
                { provide : 'B', useClass : B }
            ]
        } );

        const dependencies = injection.dependencies.getDependencies( A );
        expect( dependencies ).toEqual( [ 'B' ] );

        const a = injection.instantiate( A );
        expect( a ).toHaveProperty( 'b', expect.any( B ) );
    } );

    it( 'using as a property decorator without giving a token', () => {
        class B {}

        class A {
            @Inject() public b: B;
        }

        const injection = new Injection( {
            providers : [ A, B ]
        } );

        const dependencies = injection.dependencies.getDependencies( A );
        expect( dependencies ).toEqual( [ B ] );

        const a = injection.instantiate( A );
        expect( a ).toHaveProperty( 'b', expect.any( B ) );
    } );
} );
