/******************************************************************
 * Copyright (C) 2022 LvChengbin
 *
 * File: application/index.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 03/30/2022
 * Description:
 ******************************************************************/

import { Application, Module } from '@ussuri/core';
import { Http } from '../../../src';
import { BodyController } from './controllers/body.controller';
import { IndexController } from './controllers/index.controller';
import { ErrorController } from './controllers/error.controller';
import { ResController } from './controllers/res.controller';
import { HeaderController } from './controllers/header.controller';
import { QueryController } from './controllers/query.controller';
import { CtxController } from './controllers/ctx.controller';
import { ParamController } from './controllers/param.controller';
import { StatusController } from './controllers/status.controller';
import { ForwardController } from './controllers/forward.controller';
import { RedirectController } from './controllers/redirect.controller';
import { SubModule } from './module';

// @Module( {
// } )
@Http()
export class Test extends Application {}

export const application = new Test( {
    controllers : [
        BodyController,
        IndexController,
        ErrorController,
        ResController,
        HeaderController,
        QueryController,
        CtxController,
        ParamController,
        StatusController,
        ForwardController,
        RedirectController
    ],
    modules : {
        'sub-module' : SubModule
    }
} );
