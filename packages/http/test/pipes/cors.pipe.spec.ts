/******************************************************************
 * Copyright (C) 2022-2023 NextSeason
 *
 * @File: pipes/cors.pipe.spec.ts
 *
 * This file is part of NextSeason projects.
 * Code in this file can not be copied and/or distributed without the
 * express permission of NextSeason. Inc
 ******************************************************************/

import { assertor } from '@ussuri/testing';
import { HttpStatus } from '../../src';
import { Cors, CorsOptions, CorsWhitelist } from '../../src/pipes';
import { createContext } from '../helpers/context';

function cors( options: CorsOptions | CorsWhitelist, context ): void {
    const Constructor = Cors( options );
    const cors = new Constructor();
    cors.transform( {}, context );
}

describe( 'Cors pipe', () => {

    it( 'should not set `Access-Control-Allow-Origin` when request Origin header missing', () => {
        const context = createContext( {
            url : 'http://example.com'
        } );
        cors( [ 'example.com' ], context );
        return assertor( context.response )
            .expect( ( { headers } ) => {
                expect( headers ).not.toHaveProperty( 'Access-Control-Allow-Origin' );
            } );
    } );

    it( 'should set Access-Control-Allow-Origin header', () => {
        const context = createContext( {
            url : 'http://example.com',
            headers : { origin : 'http://example.com' }
        } );
        cors( [ 'example.com' ], context );
        return assertor( context.response )
            .expect( 'Access-Control-Allow-Origin', 'http://example.com' );
    } );

    it( 'should 204 on preflight request', () => {
        const context = createContext( {
            method : 'OPTIONS',
            url : 'http://example.com',
            headers : {
                origin : 'http://example.com',
                'Access-Control-Request-Method' : 'POST'
            }
        } );
        cors( [ 'example.com' ], context );
        return assertor( context.response )
            .expect( HttpStatus.NO_CONTENT )
            .expect( 'Access-Control-Allow-Origin', 'http://example.com' )
            .expect( 'Access-Control-Allow-Methods', 'GET,HEAD,PUT,POST,DELETE,PATCH' );
    } );

    it( 'should not preflight request if request missing `Access-Control-Request-Method', () => {
        const context = createContext( {
            method : 'OPTIONS',
            url : 'http://example.com',
            headers : { origin : 'http://example.com' }
        } );
        cors( [ 'example.com' ], context );
        return assertor( context.response )
            .expect( response => {
                expect( response.status ).not.toEqual( HttpStatus.NOT_FOUND );
            } );
    } );

    it( 'should add vary header', () => {
        const context = createContext( {
            url : 'http://example.com',
            headers : { origin : 'http://example.com' }
        } );
        cors( [ 'example.com' ], context );
        return assertor( context.response )
            .expect( 'Vary', 'Origin' );
    } );

    it( 'should append origin to existing vary header', () => {
        const context = createContext( {
            url : 'http://example.com',
            headers : { origin : 'http://example.com' }
        }, {
            headers : { vary : 'Accept' }
        } );
        cors( [ 'example.com' ], context );
        return assertor( context.response )
            .expect( 'Vary', 'Origin, Accept' );
    } );

    it( 'should set origin to *', () => {
        const context = createContext( {
            url : 'http://example.com',
            headers : { origin : 'http://example.com' }
        }, {
            headers : { vary : 'Accept' }
        } );
        cors( [ { pattern : 'example.com', origin : '*' } ], context );
        return assertor( context.response )
            .expect( 'Access-Control-Allow-Origin', '*' );
    } );
} );
