/******************************************************************
 * Copyright (C) 2022 LvChengbin
 *
 * File: controllers/ctx.controller.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 04/10/2022
 * Description:
 ******************************************************************/

import { Controller, Get, Ctx, Context } from '../../../../src';

@Controller( 'ctx' )
export class CtxController {
    @Get()
    index( @Ctx() ctx: Context ): Record<string, string> {
        return ctx.request.query;
    }
}
