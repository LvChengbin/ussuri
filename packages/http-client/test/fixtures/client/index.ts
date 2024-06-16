/******************************************************************
 * Copyright (C) 2022 LvChengbin
 *
 * File: client/index.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 05/11/2022
 * Description:
 ******************************************************************/

import { Module } from '@ussuri/core';
import { Client } from '../../../src';
import { application } from '../application';
import { MainController } from './main.controller';

@Module( {
    controllers : [ MainController ]
} )
export class TestClient extends Client {}

export const client = new TestClient( {
    requestOptions : {
        service : application
    }
} );
