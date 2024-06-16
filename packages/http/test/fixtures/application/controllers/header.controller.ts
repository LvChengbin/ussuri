/******************************************************************
 * Copyright (C) 2022 LvChengbin
 *
 * File: controllers/header.controller.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 04/10/2022
 * Description:
 ******************************************************************/

import { Controller, Get, Header } from '../../../../src';

@Controller( 'header' )
export class HeaderController {
    @Get( 'set' )
    @Header( 'X-A', 'A' )
    @Header( 'X-B', 'B' )
    @Header( {
        'X-C' : 'C',
        'X-D' : 'D'
    } )
    set(): string {
        return '';
    }

    @Get( 'get' )
    get( @Header( 'X-Custom-Id' ) id: string ): string {
        return id;
    }
}
