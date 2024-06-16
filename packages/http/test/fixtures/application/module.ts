/******************************************************************
 * Copyright (C) 2022 LvChengbin
 *
 * File: application/module.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 04/10/2022
 * Description:
 ******************************************************************/

import { Module } from '@ussuri/core';
import { ParamController } from './controllers/param.controller';
import { ForwardController } from './controllers/forward.controller';

@Module( {
    controllers : [ ParamController, ForwardController ]
} )
export class SubModule {}
