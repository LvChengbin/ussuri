/******************************************************************
 * Copyright (C) 2021 LvChengbin
 *
 * File: test/setter.spec.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 07/16/2021
 * Description:
 ******************************************************************/

import { Delegates } from '../src';

class Response {
    set body( val: string ) {
    }

    set etag( val: string ) {
    }
}

class Context {
    response = new Response;

    @Delegates.Setter<Context, 'response'>( 'response', 'body' )
    body!: Response[ 'body' ];

    @Delegates.Setter<Context, 'response'>( 'response' )
    etag!: Response[ 'etag' ];
}

describe( 'Delegates.Setter', () => {
    it( 'should delegate the property to the target object', () => {
        const context = new Context();
        expect( context ).toHaveProperty( 'body', undefined );
        expect( 'body' in context ).toBeTruthy();
    } );

    it( 'should add the setter to the prototype of the target object', () => {
        const context = new Context();
        const descriptor = Object.getOwnPropertyDescriptor( context.constructor.prototype, 'body' );
        expect( descriptor ).toBeTruthy();
        expect( descriptor ).toHaveProperty( 'get', undefined );
        expect( descriptor ).toHaveProperty( 'set', expect.any( Function ) );
        expect( Object.getOwnPropertyDescriptor( context, 'body' ) ).toBeFalsy();
    } );

    it( 'should call the original setter', () => {
        const context = new Context();
        const spy = jest.spyOn( Response.prototype, 'body', 'set' );
        context.body = 'body';
        expect( spy ).toHaveBeenCalledWith( 'body' );
        spy.mockRestore();
    } );

    it( 'should set the correct "this" while calling the target setter function', () => {
        expect.assertions( 1 );
        const context = new Context();
        const spy = jest.spyOn( Response.prototype, 'body', 'set' );
        spy.mockImplementation( function( this: Context ) {
            expect( this ).toEqual( context.response );
        } );
        context.body = 'body';
        spy.mockRestore();
    } );

    it( 'should use the property key passed to the decorator if the name of setter is not provided', () => {
        const context = new Context();
        const spy = jest.spyOn( Response.prototype, 'etag', 'set' );
        context.etag = 'new etag';
        expect( spy ).toHaveBeenCalledWith( 'new etag' );
        spy.mockRestore();
    } );
} );
