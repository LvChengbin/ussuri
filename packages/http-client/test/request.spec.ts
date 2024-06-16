/******************************************************************
 * Copyright (C) 2022 LvChengbin
 *
 * File: test/request.spec.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 05/10/2022
 * Description:
 ******************************************************************/

import { application } from './fixtures/application';
import { Client, HttpClientError } from '../src';

describe( 'Client.request', () => {

    describe( 'nps request', () => {

        it( 'simple request', async () => {
            const response = await Client.request( {
                service : application,
                url : '/',
                method : 'GET'
            } );
            expect( response.status ).toEqual( 200 );
            expect( response.body ).toEqual( { status : 'OK' } );
        } );

        it( '404', () => {
            async function request() {
                return Client.request( {
                    service : application,
                    url : '/404',
                    method : 'GET'
                } );
            }
            expect( request ).rejects.toThrow( HttpClientError );
        } );
    } );
} );
