/******************************************************************
 * Copyright (C) 2022 LvChengbin
 *
 * File: client/client.spec.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 05/07/2022
 * Description:
 ******************************************************************/

import { NPS } from '@ussuri/nps';
import { HttpStatus } from '@ussuri/http';
import { assertor } from '@ussuri/testing';
import { client, TestClient } from './fixtures/client';
import { TestApplication } from './fixtures/application';

const { api } = client;

describe( 'client', () => {
    it( 'simple get request', () => {
        return assertor( api.main.index() )
            .expect( HttpStatus.OK )
            .expect( { status : 'OK' } );
    } );

    it( 'get request with query', () => {
        const id = 'id';
        return assertor( api.main.id( { id } ) )
            .expect( HttpStatus.OK )
            .expect( id );
    } );

    describe( 'NPS', () => {

        beforeAll( () => {
            NPS.inject();
            NPS.register( '@services/test', TestApplication );
            NPS.config = {
                'test.service' : {
                    serviceType : 'NPS',
                    serviceName : '@services/test'
                }
            };
        } );

        it( 'request via NPS registry', () => {
            const client = new TestClient( 'http://test.service' );
            return assertor( client.api.main.index() )
                .expect( HttpStatus.OK )
                .expect( { status : 'OK' } );
        } );
    } );
} );
