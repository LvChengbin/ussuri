/******************************************************************
 * Copyright (C) 2022 LvChengbin
 *
 * File: controllers/status.controller.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 04/10/2022
 * Description:
 ******************************************************************/

import { Controller, Get, Status } from '../../../../src';

@Controller( 'status' )
export class StatusController {
    @Get()
    @Status( 206 )
    status206(): string {
        return '206';
    }
}
