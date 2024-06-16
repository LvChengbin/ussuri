/******************************************************************
 * Copyright (C) 2022-2023 NextSeason
 *
 * @File: decorators/finally.decorator.spec.ts
 *
 * This file is part of NextSeason projects.
 * Code in this file can not be copied and/or distributed without the
 * express permission of NextSeason. Inc
 ******************************************************************/

import { Application, Finally, Controller, Action, Module } from '../../src';

describe( '@Finally()', () => {
    describe( 'using as a class decorator', () => {
        it( 'should have called pipes being listed in @Finally()', async () => {

            const pipe = jest.fn();

            @Controller( '/' )
            class IndexController {
                @Action( '' )
                action() {}
            }

            @Finally( pipe )
            @Module( { controllers : [ IndexController ] } )
            class Test extends Application {}

            const app = new Test();

            await app.visit( '/' );

            expect( pipe ).toHaveBeenCalledTimes( 1 );
        } );

        it( 'should have called pipes being listed in @Finally()', async () => {

            const pipe = jest.fn();

            @Controller( '/' )
            class IndexController {
                @Action( '' )
                action() {
                    throw new Error( 'something error' );
                }
            }

            @Finally( pipe )
            @Module( { controllers : [ IndexController ] } )
            class Test extends Application {}

            const app = new Test();

            await expect( app.visit( '/' ) ).rejects.toThrow();
            expect( pipe ).toHaveBeenCalledTimes( 1 );
        } );
    } );
} );
