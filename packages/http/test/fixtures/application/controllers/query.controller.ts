/******************************************************************
 * Copyright (C) 2022 LvChengbin
 *
 * File: controllers/query.controller.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 04/10/2022
 * Description:
 ******************************************************************/

import { Controller, Get, Query, BadRequestException } from '../../../../src';

@Controller( 'query' )
export class QueryController {
    @Get( '/' )
    index<T>( @Query() query: T ): T {
        return query;
    }

    @Get( '/pick' )
    pick( @Query( 'name' ) name: string ): string {
        return name;
    }

    @Get( '/transform' )
    transform(
        @Query( 'name', ( name: string ) => name.toUpperCase() ) name: string
    ): string {
        return name;
    }

    @Get( '/validation' )
    validation(
        @Query( 'name', () => { throw new BadRequestException( 'Invalid name' ) } ) name: string
    ): string {
        return name;
    }
}
