/******************************************************************
 * Copyright (C) 2022 LvChengbin
 *
 * File: application/main.controller.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 05/10/2022
 * Description:
 ******************************************************************/

import { Controller, Get, Query } from '@ussuri/http';

@Controller()
export class MainController {
    @Get()
    index(): Record<string, string> {
        return { status : 'OK' };
    }

    @Get( '/id' )
    id( @Query( 'id' ) id: string ): id {
        return id;
    }

}
