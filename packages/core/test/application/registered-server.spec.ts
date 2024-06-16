/******************************************************************
 * Copyright (C) 2022-2023 NextSeason
 *
 * @File: application/registered-server.spec.ts
 *
 * This file is part of NextSeason projects.
 * Code in this file can not be copied and/or distributed without the
 * express permission of NextSeason. Inc
 ******************************************************************/

import { Application } from '../../src';
import { registerServer } from '../../src/register-server';

describe( 'Registered Server in Application', () => {
    describe( 'start', () => {

        it( 'should call start method', async () => {

            const start = jest.fn( () => 'start' );

            function Server( target: object ) {
                registerServer( target, 'a', {
                    start() { return start() }
                } );
            }

            @Server
            class Test extends Application {}

            const test = new Test();

            const res = await test.start();
            expect( start ).toHaveBeenCalledTimes( 1 );
            expect( res ).toEqual( [ 'start' ] );
        } );
    } );

    describe( 'handle', () => {
        it( 'should call handle method', async () => {
            const handle = jest.fn( () => 'handle' );

            function Server( target: object ) {
                registerServer( target, 'a', {
                    handle( ...args ) { return handle( ...args ) }
                } );
            }

            @Server
            class Test extends Application {}

            const test = new Test();

            const res = await test.handle( 'a', 1, 2, 3 );
            expect( handle ).toHaveBeenCalledTimes( 1 );
            expect( handle ).toHaveBeenCalledWith( 1, 2, 3 );
            expect( res ).toEqual( 'handle' );
        } );

        it( 'should throw error if the server is not registered', async () => {
            class Test extends Application {}
            const test = new Test();
            return expect( test.handle( 'a' ) ).rejects.toThrow();
        } );

        it( 'should throw error if the server doesn\'t provide handle method', async () => {

            function Server( target: object ) {
                registerServer( target, 'a', {} );
            }

            @Server
            class Test extends Application {}

            const test = new Test();
            return expect( test.handle( 'a' ) ).rejects.toThrow();
        } );
    } );
} );
