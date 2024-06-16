/******************************************************************
 * Copyright (C) 2021 LvChengbin
 *
 * File: test/getter.spec.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 07/15/2021
 * Description:
 ******************************************************************/

import { Delegates } from '../src';

class Response {
    get body(): string {
        return 'the body';
    }

    get etag(): string {
        return 'etag';
    }
}

class Context {
    response = new Response;

    @Delegates.Getter<Context, 'response'>( 'response', 'body' )
    body!: Response[ 'body' ];

    @Delegates.Getter<Context, 'response'>( 'response' )
    etag!: Response[ 'etag' ];
}

describe( 'Delegates.Getter', () => {
    it( 'should delegate the property to the target object', () => {
        const context = new Context();
        expect( context ).toHaveProperty( 'body', expect.any( String ) );
    } );

    it( 'should add the getter to the prototype of the target constructor', () => {
        const context = new Context();
        const descriptor = Object.getOwnPropertyDescriptor( context.constructor.prototype, 'body' );
        expect( descriptor ).toBeTruthy();
        expect( descriptor ).toHaveProperty( 'set', undefined );
        expect( descriptor ).toHaveProperty( 'get', expect.any( Function ) );
        expect( Object.getOwnPropertyDescriptor( context, 'body' ) ).toBeFalsy();
    } );

    it( 'should call the original getter', () => {
        const context = new Context();
        const spy = jest.spyOn( Response.prototype, 'body', 'get' );
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        context.body;
        expect( spy ).toHaveBeenCalled();
        spy.mockRestore();
    } );

    it( 'should set the correct "this" while calling the target getter', () => {
        expect.assertions( 1 );
        const context = new Context();
        const spy = jest.spyOn( Response.prototype, 'body', 'get' );
        spy.mockImplementation( function( this: Context ): string {
            expect( this ).toEqual( context.response );
            return '';
        } );
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        context.body;
        spy.mockRestore();
    } );

    it( 'should use the property key passed to the decorator if the name of the getter is not provided', () => {
        const context = new Context();
        expect( context.etag ).toEqual( 'etag' );
    } );
} );
