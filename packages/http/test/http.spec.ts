/******************************************************************
 * Copyright (C) 2022-2023 NextSeason
 *
 * @File: test/http.spec.ts
 *
 * This file is part of NextSeason projects.
 * Code in this file can not be copied and/or distributed without the
 * express permission of NextSeason. Inc
 ******************************************************************/

import { Application } from '@ussuri/core';
import { Query, Get, Controller, Http, HTTP_REGISTERED_SERVER_NAME } from '../src';

describe( 'Http', () => {

    it( 'handle', async () => {

        @Controller( '/test' )
        class TestController {
            @Get( ':action' )
            fn( @Query( 'name' ) name: string ) {
                return name;
            }
        }

        @Http()
        class Test extends Application {}

        const test = new Test( {
            controllers : [ TestController ]
        } );

        const res = await test.handle( HTTP_REGISTERED_SERVER_NAME, {
            request : {
                method : 'GET',
                url : '/test/fn?name=ussuri'
            }
        } );

        expect( res.body ).toEqual( 'ussuri' );
    } );

    it( 'throw 404 if routing error occured', async () => {
        @Controller()
        class TestController {}

        @Http()
        class Test extends Application {}

        const test = new Test( {
            controllers : [ TestController ]
        } );

        const res = await test.handle( HTTP_REGISTERED_SERVER_NAME, {
            request : {
                method : 'GET',
                url : '/nonexistence/rule'
            }
        } );

        expect( res.status ).toEqual( 404 );
    } );
} );
