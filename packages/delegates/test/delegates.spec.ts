/******************************************************************
 * Copyright (C) 2021 LvChengbin
 *
 * File: test/delegates.spec.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 07/16/2021
 * Description:
 ******************************************************************/

import { Delegates } from '../src';

class Response {

    #body = 'body';
    #etag = 'etag';
    #writable = true;

    set body( val: string ) {
        this.#body = val;
    }

    get body(): string {
        return this.#body;
    }

    set etag( val: string ) {
        this.#etag = val;
    }

    get writable(): boolean {
        return this.#writable;
    }

    name(): void {
    }

    is<T>( type: T ): T {
        return type;
    }
}

interface Context extends Response {}

@Delegates<Context, 'response'>( Response.prototype, 'response' )
class Context {

    response = new Response();

    name() {}
}

describe( 'Delegates', () => {

    it( 'should skip the constructor in target prototype', () => {
        const context = new Context();
        expect( context.constructor ).toBe( Context );
    } );

    it( 'should delegate all properties from target prototype', () => {
        const context = new Context();
        expect( context ).toHaveProperty( 'body', 'body' );
        expect( context ).toHaveProperty( 'etag', undefined );
        expect( context ).toHaveProperty( 'writable', true );
        expect( context ).toHaveProperty( 'name', expect.any( Function ) );
        expect( context ).toHaveProperty( 'is', expect.any( Function ) );
    } );

    it( 'should bind all properties to the prototype of constructor', () => {
        expect( Object.getOwnPropertyDescriptor( Context.prototype, 'body' ) ).toBeTruthy();
        expect( Object.getOwnPropertyDescriptor( Context.prototype, 'etag' ) ).toBeTruthy();
        expect( Object.getOwnPropertyDescriptor( Context.prototype, 'writable' ) ).toBeTruthy();
        expect( Object.getOwnPropertyDescriptor( Context.prototype, 'name' ) ).toBeTruthy();
        expect( Object.getOwnPropertyDescriptor( Context.prototype, 'is' ) ).toBeTruthy();
    } );
} );
