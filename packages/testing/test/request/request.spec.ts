/******************************************************************
 * Copyright (C) 2022 LvChengbin
 *
 * File: request/test.spec.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 04/15/2022
 * Description:
 ******************************************************************/

import { request } from '../../src/request';
import { Test } from '../../src/request/test';

const HOST = 'http://127.0.0.1';

describe( 'request', () => {

    it( 'should return a Test instance', () => {
        const application = {
            handle : jest.fn()
        };
        expect( request( application ) ).toBeInstanceOf( Test );
    } );

    it( 'send a GET request', async () => {
        const handle = jest.fn( () => ( {} ) );
        const application = { handle };
        await request( application )
            .get( '/' )
            .query( 'x', 1 )
            .query( { y : 2, z : 3 } )
            .query( 'a=4&b=5' );

        expect( handle ).toHaveBeenCalledWith( {
            request : {
                url : `${HOST}/?x=1&y=2&z=3&a=4&b=5`,
                method : 'GET',
                headers : {}
            }
        } );
    } );

    it( 'send a POST requst', async () => {
        const handle = jest.fn( () => ( {} ) );
        const application = { handle };
        await request( application )
            .post( '/' )
            .query( { x : 1, y : 2 } )
            .send( 'x', 1 );

        expect( handle ).toHaveBeenCalledWith( {
            request : {
                url : `${HOST}/?x=1&y=2`,
                method : 'POST',
                body : { x : 1 },
                headers : {}
            }
        } );
    } );

    it( 'set request headers', async () => {
        const handle = jest.fn( () => ( {} ) );
        const application = { handle };
        await request( application )
            .post( '/' )
            .set( 'X-Custom-Id', 1 );

        expect( handle ).toHaveBeenCalledWith( {
            request : {
                url : `${HOST}/`,
                method : 'POST',
                body : {},
                headers : {
                    'X-Custom-Id' : 1
                }
            }
        } );
    } );
} );
