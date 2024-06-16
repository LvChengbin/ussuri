/******************************************************************
 * Copyright (C) 2022-2023 NextSeason
 *
 * @File: test/compile.spec.ts
 *
 * This file is part of NextSeason projects.
 * Code in this file can not be copied and/or distributed without the
 * express permission of NextSeason. Inc
 ******************************************************************/

import { compile } from '../src';

describe( 'compile', () => {

    it( 'should return a function', () => {
        const fn = compile( ':id' );
        expect( typeof fn === 'function' ).toBeTruthy();
    } );

    it( 'support tokens', () => {
        const fn = compile( ':id' );
        expect( fn( {}, { id : () => 1 } ) ).toEqual( '1' );
    } );

    it( 'support context', () => {
        const fn = compile( ':id' );
        expect( fn( { id : 1 } ) ).toEqual( '1' );
    } );

    it( 'support getting data with dot path from context', () => {
        const fn = compile( ':user.id' );
        expect( fn( { user : { id : 1 } } ) ).toEqual( '1' );
    } );

    it( 'using brackets to get property', () => {
        const fn = compile( ':["remote-attr"]' );
        expect( fn( { 'remote-attr' : '127.0.0.1' } ) ).toEqual( '127.0.0.1' );
    } );

    it( 'support special chars in dot path', () => {
        const fn = compile( ':remote-attr' );
        expect( fn( { 'remote-attr' : '127.0.0.1' } ) ).toEqual( '127.0.0.1' );
    } );

    it( 'should not throw exception if the dot path doesn\'t satisfy the given data', () => {
        const fn = compile( ':a.b.c.d' );
        expect( fn( {} ) ).toEqual( '-' );
    } );

    it( 'support multiple tokens', () => {
        const fn = compile( ':origin :status' );
        expect( fn( {} ) ).toEqual( '- -' );
    } );

    it( 'context should be passed to tokens function', () => {
        const context = { id : 1 };
        const tokenfn = jest.fn();
        const fn = compile( ':id' );
        fn( context, { id : tokenfn } );
        expect( tokenfn ).toHaveBeenCalledWith( context );
    } );

    it( 'tokens have higher priority then context', () => {
        const context = { id : 1 };
        const fn = compile( ':id' );
        expect( fn( context ) ).toEqual( '1' );
        expect( fn( context, { id : () => 2 } ) ).toEqual( '2' );
    } );

    // it( 'call a function', () => {
    //     const fn = compile( ':name()' );
    //     expect( fn( { name() { return 'Morgan' } } ) ).toEqual( 'Morgan' );
    // } );
} );
