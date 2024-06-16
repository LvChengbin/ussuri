/******************************************************************
 * Copyright (C) 2022-2023 NextSeason
 *
 * @File: test/websocket.spec.ts
 *
 * This file is part of NextSeason projects.
 * Code in this file can not be copied and/or distributed without the
 * express permission of NextSeason. Inc
 ******************************************************************/

import { Application } from '@ussuri/core';
import { Http, Controller, Get } from '@ussuri/http';
import { WebSocket } from '../src';

describe( '@WebSocket', () => {
    it( '', () => {

        @Controller()
        class HttpController {
            @Get()
            fn() { return 'Http Server' }
        }

        @WebSocket( 6789 )
        @Http( 6789 )
        class Test extends Application {}

        const app = new Test( {
            controllers : [ HttpController ]
        } );
        app.start();

    } );
} );
