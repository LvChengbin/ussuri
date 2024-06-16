/******************************************************************
 * Copyright (C) 2022-2023 NextSeason
 *
 * @File: application/dataclass.spec.ts
 *
 * This file is part of NextSeason projects.
 * Code in this file can not be copied and/or distributed without the
 * express permission of NextSeason. Inc
 ******************************************************************/

import { Injectable } from '@ussuri/injection';
import { Application, Action, Controller, Dataclass, Property, Ctx, Prune } from '../../src';

describe( 'Using dataclass with controller', () => {
    it( '', async () => {

        const booPipeFn = jest.fn();
        const fooPipeFn = jest.fn();

        @Injectable()
        class BooPipe {
            transform( val ) {
                booPipeFn( val );
                return val;
            }
        }

        @Dataclass( BooPipe )
        class BooData {
            @Property()
            name: string;
        }

        @Injectable()
        class FooPipe {
            transform( val ) {
                fooPipeFn( val );
                return val;
            }
        }

        @Prune( false )
        @Dataclass( FooPipe, BooData, FooPipe )
        class FooData {
            @Property()
            name: string;
        }

        @Controller()
        class FooController {
            @Action()
            foo( @Ctx() ctx: FooData ) {
                return ctx;
            }
        }

        const app = new Application( {
            controllers : [ FooController ]
        } );

        const res = await app.callHandler( FooController, 'foo', {
            context : 1,
            name : 'foo'
        } );

        expect( res ).toEqual( {
            name : 'foo'
        } );

        expect( booPipeFn ).toHaveBeenCalledWith( {
            name : 'foo'
        } );

        expect( fooPipeFn ).toHaveBeenCalledWith( {
            name : 'foo',
            context : 1
        } );
    } );
} );
