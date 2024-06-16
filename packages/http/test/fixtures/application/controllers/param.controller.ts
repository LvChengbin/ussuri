/******************************************************************
 * Copyright (C) 2022 LvChengbin
 *
 * File: controllers/param.controller.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 04/10/2022
 * Description:
 ******************************************************************/

import { Controller, Get, Param, BadRequestException } from '../../../../src';

@Controller( 'param' )
export class ParamController {
    @Get( '/:id/:name' )
    index<T>( @Param() param: T ): T {
        return param;
    }

    @Get( '/pick' )
    pick( @Param( 'name' ) name: string ): string {
        return name;
    }

    @Get( '/transform' )
    transform(
        @Param( 'name', ( name: string ) => name.toUpperCase() ) name: string
    ): string {
        return name;
    }

    @Get( '/validation' )
    validation(
        @Param( 'name', () => { throw new BadRequestException( 'Invalid name' ) } ) name: string
    ): string {
        return name;
    }
}
