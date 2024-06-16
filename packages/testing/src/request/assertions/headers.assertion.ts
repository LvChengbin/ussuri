/******************************************************************
 * Copyright (C) 2022 LvChengbin
 *
 * File: assertions/headers.assertion.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 04/05/2022
 * Description:
 ******************************************************************/

import { expect } from '@jest/globals';
import { JestAsymmetricMatcher } from '../interfaces';
import { assert } from '../assert';
import { Assertion } from './assertion';

function lowercase( src: Record<string, any> ): Record<string, any> {
    return Object.fromEntries( Object.entries( src ).map( ( [ key, value ] ) => [ key.toLowerCase(), value ] ) );
}


export type HeadersAssertionValue =
    | JestAsymmetricMatcher
    | string
    | number
    | string[]
    | RegExp
    | undefined
    | null;

export class HeadersAssertion implements Assertion {

    type = 'headers';

    #headers?: Record<string, unknown>;
    #field?: string;
    #value?: HeadersAssertionValue;

    constructor( headers: Record<string, unknown> );
    constructor( field: string, value: HeadersAssertionValue );
    constructor( field: string | Record<string, unknown>, value?: HeadersAssertionValue ) {
        if( typeof field === 'string' ) {
            this.#field = field.toLowerCase();
            this.#value = value;
        } else {
            this.#headers = lowercase( field );
        }
    }

    assert( response: any ): void {

        expect( response ).toHaveProperty( 'headers' );

        const headers = lowercase( response.headers );

        if( this.#headers ) {
            expect( headers ).toEqual( expect.objectContaining( this.#headers ) );
            return;
        }

        let has = false;

        Object.keys( headers ).forEach( name => {
            if( name === this.#field ) {
                assert( this.#value, headers[ name ] );
                has = true;
            }
        } );

        has || assert( this.#value, undefined );
    }
}
