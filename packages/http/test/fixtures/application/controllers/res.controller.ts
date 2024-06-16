/******************************************************************
 * Copyright (C) 2022 LvChengbin
 *
 * File: controllers/res.controller.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 04/03/2022
 * Description:
 ******************************************************************/

import { Controller, Get } from '../../../../src';

@Controller( '/response' )
export class ResController {
    @Get( '/json' )
    json(): Record<string, string> {
        return {
            status : 0,
            data : {}
        };
    }
}
