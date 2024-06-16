/******************************************************************
 * Copyright (C) 2022-2023 NextSeason
 *
 * @File: test/application.spec.ts
 *
 * This file is part of NextSeason projects.
 * Code in this file can not be copied and/or distributed without the
 * express permission of NextSeason. Inc
 ******************************************************************/

import { request } from '@ussuri/testing';
import { HttpStatus } from '../src';
import { application } from './fixtures/application';

describe( 'application', () => {
    describe( 'errors', () => {
        it( 'should response with 404 Not Found error is the routing rule not exists', () => {
            const path = '/non/existence/path';
            return request( application ).get( path )
                .expect( HttpStatus.NOT_FOUND, expect.stringMatching( path ) );
        } );

        it( '400 error should have been thrown', () => {
            return request( application ).get( '/error/400' )
                .expect( HttpStatus.BAD_REQUEST );
        } );
    } );

    describe( 'response', () => {
        it( 'simple text response', () => {
            return request( application ).get( '/' )
                .expect( HttpStatus.OK )
                .expect( 'content-type', 'text/plain; charset=utf-8' )
                .expect( 'Hello World!' );
        } );

        it( 'json response', () => {
            return request( application ).get( '/response/json' )
                .expect( HttpStatus.OK )
                .expect( 'content-type', /application\/json/ )
                .expect( { status : 0, data : {} } );
        } );
    } );

    describe( '@Header() decorator', () => {
        it( 'set response header', () => {
            return request( application ).get( '/header/set' )
                .expect( HttpStatus.OK )
                .expect( 'X-A', 'A' )
                .expect( 'X-B', 'B' )
                .expect( 'X-C', 'C' )
                .expect( 'X-D', 'D' );
        } );

        it( 'get request header', () => {
            return request( application ).get( '/header/get' )
                .set( 'X-Custom-Id', 1 )
                .expect( HttpStatus.OK )
                .expect( '1' );
        } );
    } );

    describe( '@Query() decorator', () => {
        it( 'get whole request query', () => {
            const query = {
                id : '1',
                name : 'name'
            };

            return request( application ).get( '/query' )
                .query( query )
                .expect( HttpStatus.OK )
                .expect( query );
        } );

        it( 'get item in query object', () => {
            const query = {
                id : '1',
                name : 'name'
            };

            return request( application ).get( '/query/pick' )
                .query( query )
                .expect( HttpStatus.OK )
                .expect( query.name );
        } );

        it( 'transform query value with Pipe function', () => {
            const query = {
                id : '1',
                name : 'name'
            };

            return request( application ).get( '/query/transform' )
                .query( query )
                .expect( HttpStatus.OK )
                .expect( query.name.toUpperCase() );
        } );

        it( 'validate query value', () => {
            return request( application ).get( '/query/validation' )
                .expect( HttpStatus.BAD_REQUEST, 'Invalid name' );
        } );
    } );

    describe( '@Param() decorator', () => {
        it( 'get whole request params', () => {
            const id = '1';
            const name = 'name';

            return request( application ).get( `/param/${id}/${name}` )
                .expect( HttpStatus.OK )
                .expect( { id, name } );
        } );
    } );

    describe( '@Ctx() decorator', () => {
        it( 'get full context with @Ctx() decorator', () => {
            const query = {
                id : '1',
                name : 'name'
            };

            return request( application ).get( '/ctx' )
                .query( query )
                .expect( HttpStatus.OK )
                .expect( query );
        } );
    } );

    describe( '@Status() decorator', () => {
        it( 'set status code', () => {
            return request( application ).get( '/status' )
                .expect( HttpStatus.PARTIAL_CONTENT );
        } );
    } );

    describe( '@Redirect() decorator', () => {
        it( 'redirect request', () => {
            return request( application ).get( '/redirect' )
                .expect( HttpStatus.FOUND )
                .expect( 'Location', '/redirect/target' );
        } );

        it( 'specify status code', () => {
            return request( application ).get( '/redirect/301' )
                .expect( HttpStatus.MOVED_PERMANENTLY )
                .expect( 'Location', '/redirect/target' );
        } );
    } );

    describe( 'modules', () => {
        it.only( 'get whole request params', () => {
            const id = '1';
            const name = 'name';

            return request( application ).get( `/sub-module/param/${id}/${name}` )
                .expect( HttpStatus.OK )
                .expect( { id, name } );
        } );
    } );

    describe( 'Internal forwarding', () => {
        it( 'should have forward request to target path', () => {
            return request( application ).get( '/forward' )
                .query( 'id', 1 )
                .expect( 200 )
                .expect( '1' );

        } );

        it( 'should work in module', () => {
            return request( application ).get( '/sub-module/forward' )
                .query( 'id', 1 )
                .expect( 200 )
                .expect( '1' );
        } );

        it( 'should be able to forward request to sub module', () => {
            return request( application ).get( '/forward/to-submodule' )
                .query( 'id', 1 )
                .expect( 200 )
                .expect( '1' );
        } );
    } );

    describe( 'body', () => {
        it( 'should support dataclass', () => {
            return request( application ).post( '/body/dataclass' )
                .send( {
                    name : 'Achilles',
                    age : '14',
                    sex : 'male'
                } )
                .expect( 200 )
                .expect( { name : 'Achilles', age : 14 } );
        } );
    } );
} );
