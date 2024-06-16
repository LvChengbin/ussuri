/******************************************************************
 * Copyright (C) 2021 LvChengbin
 *
 * File: test/method.spec.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 07/15/2021
 * Description:
 ******************************************************************/

import { Delegates } from '../src';

class Response {
    is<T>( type: T ): T {
        return type;
    }

    get<T>( field: T ): T {
        return field;
    }
}

class Context {
    response = new Response;

    @Delegates.Method<Context, 'response'>( 'response', 'is' )
    is!: Response[ 'is' ];

    @Delegates.Method<Context, 'response'>( 'response' )
    get!: Response[ 'get' ];
}

describe( 'Delegates.Method', () => {
    it( 'should delegate the method to the target object', () => {
        const context = new Context();
        expect( context ).toHaveProperty( 'is', expect.any( Function ) );
    } );

    it( 'should add the delegated method to the prototype of the target constructor', () => {
        const context = new Context();
        expect( context.constructor.prototype ).toHaveProperty( 'is', expect.any( Function ) );
    } );

    it( 'should call the original method with correct arguments', () => {
        const spy = jest.spyOn( Response.prototype, 'is' );
        const context = new Context();
        context.is( 'json' );
        expect( spy ).toHaveBeenCalled();
        expect( spy ).toHaveBeenCalledWith( 'json' );
        spy.mockRestore();
    } );

    it( 'should use the original object as the "this" variable of the target method', () => {
        expect.assertions( 1 );
        const context = new Context();
        const spy = jest.spyOn( Response.prototype, 'is' );
        spy.mockImplementation( function( this: Context ) {
            expect( this ).toEqual( context.response );
        } );
        context.is( 'json' );
        spy.mockRestore();
    } );

    it( 'should be able to omit the original method name', () => {
        const context = new Context();
        const spy = jest.spyOn( Response.prototype, 'get' );
        context.get( 'test' );
        expect( spy ).toHaveBeenCalledWith( 'test' );
        spy.mockRestore();
    } );
} );
