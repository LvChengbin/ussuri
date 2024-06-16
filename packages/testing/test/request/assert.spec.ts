/******************************************************************
 * Copyright (C) 2022 LvChengbin
 *
 * File: request/assert.spec.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 04/14/2022
 * Description:
 ******************************************************************/

import { assert } from '../../src/request/assert';

describe( 'request/assert', () => {
    it( 'strict equal', () => {
        expect( () => { assert( 1, 1 ) } ).not.toThrow();
    } );

    it( 'throw error', () => {
        expect( () => { assert( 1, 2 ) } ).toThrow();
    } );

    it( 'matching with regular expression', () => {
        expect( () => { assert( /^\d+$/, '123' ) } ).not.toThrow();
    } );

    it( 'failed to match with regular expression', () => {
        expect( () => { assert( /^\d+/, 'a123' ) } ).toThrow();
    } );

    it( 'support jest AsymmetricMatcher', () => {
        expect( () => { assert( expect.any( String ), 'abc' ) } ).not.toThrow();
        expect( () => { assert( expect.any( String ), 123 ) } ).toThrow();
    } );
} );
