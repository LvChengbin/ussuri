/******************************************************************
 * Copyright (C) 2022 LvChengbin
 *
 * File: utils/join-pattern.spec.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 03/14/2022
 * Description:
 ******************************************************************/

import { joinPattern } from '../../src/utils/join-pattern';

function getMatches( pattern: RegExp, path: string ): string[] | false {
    let matches = pattern.exec( path );

    if( !matches ) return false;

    matches = Array.prototype.slice.call( pattern.exec( path ) );
    matches.shift();

    return matches;
}

describe( 'utils/join-pattern', () => {

    const join = joinPattern( '/' );

    it( 'empty path', () => {
        const { keys, pattern } = join( '' );
        expect( pattern ).toMatchSnapshot();
        expect( keys ).toEqual( [] );
        const matches = getMatches( pattern, '/' );
        expect( matches ).toEqual( [] );
        expect( getMatches( pattern, '//' ) ).toBeFalsy();
    } );

    it( 'multiple empty path', () => {
        const { keys, pattern } = join( '', '' );
        expect( pattern ).toMatchSnapshot();
        expect( keys ).toEqual( [] );
        const matches = getMatches( pattern, '/' );
        expect( matches ).toEqual( [] );
        expect( getMatches( pattern, '//' ) ).toBeFalsy();
    } );

    it( 'single string', () => {
        const { keys, pattern } = join( '/account/:id(\\d+)/:item' );
        expect( pattern ).toMatchSnapshot();
        expect( keys ).toEqual( [ 'id', 'item' ] );
        const matches = getMatches( pattern, '/account/123/profile' );
        expect( matches ).toEqual( [ '123', 'profile' ] );
        expect( getMatches( pattern, '/account/abc/profile' ) ).toBeFalsy();
        expect( getMatches( pattern, '/account/123//profile' ) ).toBeFalsy();
        expect( getMatches( pattern, '/account/123#profile' ) ).toBeFalsy();
        expect( getMatches( pattern, '/account/122' ) ).toBeFalsy();
    } );

    it( 'multiple strings', () => {
        const { keys, pattern } = join( '/account/:id(\\d+)', ':item' );
        expect( pattern ).toMatchSnapshot();
        expect( keys ).toEqual( [ 'id', 'item' ] );
        const matches = getMatches( pattern, '/account/123/profile' );
        expect( matches ).toEqual( [ '123', 'profile' ] );
        expect( getMatches( pattern, '/account/abc/profile' ) ).toBeFalsy();
        expect( getMatches( pattern, '/account/123//profile' ) ).toBeFalsy();
        expect( getMatches( pattern, '/account/123#profile' ) ).toBeFalsy();
        expect( getMatches( pattern, '/account/122' ) ).toBeFalsy();
    } );

    it( 'should trim separators', () => {
        const { keys, pattern } = join( '/account/:id(\\d+)/', ':item' );
        expect( pattern ).toMatchSnapshot();
        expect( keys ).toEqual( [ 'id', 'item' ] );
        const matches = getMatches( pattern, '/account/123/profile' );
        expect( matches ).toEqual( [ '123', 'profile' ] );
        expect( getMatches( pattern, '/account/abc/profile' ) ).toBeFalsy();
        expect( getMatches( pattern, '/account/123//profile' ) ).toBeFalsy();
        expect( getMatches( pattern, '/account/122' ) ).toBeFalsy();
    } );

    it( 'single regexp', () => {
        const { keys, pattern } = join( /^account\/(?<id>\d+)\/(?<item>[^/]+)/ );
        expect( pattern ).toMatchSnapshot();
        expect( keys ).toEqual( [ 'id', 'item' ] );
        const matches = getMatches( pattern, '/account/123/profile' );
        expect( matches ).toEqual( [ '123', 'profile' ] );
        expect( getMatches( pattern, '/account/abc/profile' ) ).toBeFalsy();
        expect( getMatches( pattern, '/account/122' ) ).toBeFalsy();
    } );

    it( 'single regexp with ahead "/"', () => {
        const { keys, pattern } = join( /^\/account\/(?<id>\d+)\/(?<item>[^/]+)/ );
        expect( pattern ).toMatchSnapshot();
        expect( keys ).toEqual( [ 'id', 'item' ] );
        const matches = getMatches( pattern, '/account/123/profile' );
        expect( matches ).toEqual( [ '123', 'profile' ] );
        expect( getMatches( pattern, '/account/abc/profile' ) ).toBeFalsy();
        expect( getMatches( pattern, '/account/122' ) ).toBeFalsy();
    } );

    it( 'multiple regexps', () => {
        const { keys, pattern } = join( /^\/account\/(?<id>\d+)/, /(?<item>[^/]+)/ );
        expect( pattern ).toMatchSnapshot();
        expect( keys ).toEqual( [ 'id', 'item' ] );
        const matches = getMatches( pattern, '/account/123/profile' );
        expect( matches ).toEqual( [ '123', 'profile' ] );
        expect( getMatches( pattern, '/account/abc/profile' ) ).toBeFalsy();
        expect( getMatches( pattern, '/account/123//profile' ) ).toBeFalsy();
        expect( getMatches( pattern, '/account/122' ) ).toBeFalsy();
    } );

    it( 'mix string patterns and regexps', () => {
        const { keys, pattern } = join( '/account/:id(\\d+)/', /(?<item>[^/]+)/, ':name' );
        expect( pattern ).toMatchSnapshot();
        expect( keys ).toEqual( [ 'id', 'item', 'name' ] );
        const matches = getMatches( pattern, '/account/123/profile/x' );
        expect( matches ).toEqual( [ '123', 'profile', 'x' ] );
        expect( getMatches( pattern, '/account/abc/profile/x' ) ).toBeFalsy();
        expect( getMatches( pattern, '/account/123//profile/x' ) ).toBeFalsy();
        expect( getMatches( pattern, '/account/122' ) ).toBeFalsy();
    } );
} );
