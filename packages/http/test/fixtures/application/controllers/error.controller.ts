/******************************************************************
 * Copyright (C) 2022 LvChengbin
 *
 * File: controllers/error.controller.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 04/03/2022
 * Description:
 ******************************************************************/

import { Controller, Get, BadRequestException } from '../../../../src';

@Controller( '/error' )
export class ErrorController {

    @Get( '400' )
    error400(): string {
        throw new BadRequestException( '400' );
    }


    @Get( '404' )
    error404(): string {
        return '404 page';
    }
}
