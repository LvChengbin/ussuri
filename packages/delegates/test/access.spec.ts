/******************************************************************
 * Copyright (C) 2021 LvChengbin
 *
 * File: test/access.spec.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 07/16/2021
 * Description:
 ******************************************************************/

import { Delegates } from '../src';

class Response {

    #body = '';
    #etag = '';

    set body( val: string ) {
        this.#body = val;
    }

    get body(): string {
        return this.#body;
    }

    set etag( val: string ) {
        this.#etag = val;
    }

    get etag(): string {
        return this.#etag;
    }
}

class Context {
    response = new Response();

    @Delegates.Access<Context, 'response'>( 'response', 'body' )
    body!: Response[ 'body' ];

    @Delegates.Access<Context, 'response'>( 'response' )
    etag!: Response[ 'etag' ];
}

describe( 'Delegates.Access', () => {
    it( 'should delegate the property to the target object', () => {
        const context = new Context();
        expect( 'body' in context ).toBeTruthy();
        expect( context ).toHaveProperty( 'body', expect.any( String ) );
    } );

    it( 'should add the accessor to the prototype of the target object', () => {
        const context = new Context();
        const descriptor = Object.getOwnPropertyDescriptor( context.constructor.prototype, 'body' );
        expect( descriptor ).toBeTruthy();
        expect( descriptor ).toHaveProperty( 'get', expect.any( Function ) );
        expect( descriptor ).toHaveProperty( 'set', expect.any( Function ) );
        expect( Object.getOwnPropertyDescriptor( context, 'body' ) ).toBeFalsy();
    } );

    it( 'should call the original getter function', () => {
        const context = new Context();
        const spy = jest.spyOn( Response.prototype, 'body', 'get' );
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        context.body;
        expect( spy ).toHaveBeenCalled();
        spy.mockRestore();
    } );

    it( 'should call the original setter function', () => {
        const context = new Context();
        const spy = jest.spyOn( Response.prototype, 'body', 'set' );
        context.body = 'body';
        expect( spy ).toHaveBeenCalledWith( 'body' );
        spy.mockRestore();
    } );

    it( 'should set correct "this" for setter', () => {
        expect.assertions( 1 );
        const context = new Context();
        const spy = jest.spyOn( Response.prototype, 'body', 'set' );
        spy.mockImplementation( function( this: Context ) {
            expect( this ).toEqual( context.response );
        } );
        context.body = 'body';
        spy.mockRestore();
    } );

    it( 'should set correct "this" for getter', () => {
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

    it( 'should use the property key passed to the decorator if the accessor name is not provided', () => {
        const context = new Context();
        const setterSpy = jest.spyOn( Response.prototype, 'etag', 'set' );
        context.etag = 'new etag';
        expect( setterSpy ).toHaveBeenCalledWith( 'new etag' );
        setterSpy.mockRestore();
        const getterSpy = jest.spyOn( Response.prototype, 'etag', 'get' );
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        context.etag;
        expect( getterSpy ).toHaveBeenCalled();
        getterSpy.mockRestore();
    } );

    it( 'should change the value of the original object', () => {
        const context = new Context();
        context.body = 'body';
        expect( context.body ).toEqual( 'body' );
        expect( context.response.body ).toEqual( 'body' );
    } );
} );
