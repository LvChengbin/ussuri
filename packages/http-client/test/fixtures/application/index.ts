/******************************************************************
 * Copyright (C) 2022 LvChengbin
 *
 * File: application/index.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 05/10/2022
 * Description:
 ******************************************************************/

import { Module } from '@ussuri/core';
import { Application } from '@ussuri/http';
import { MainController } from './main.controller';

@Module( {
    controllers : [ MainController ]
} )
export class TestApplication extends Application {}

export const application = new TestApplication();
