/******************************************************************
 * Copyright (C) 2022 LvChengbin
 *
 * File: controllers/forward.controller.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 04/12/2022
 * Description:
 ******************************************************************/

import { Controller, Get, Query, Forward } from '../../../../src';

@Controller( 'forward' )
export class ForwardController {
    @Get()
    @Forward( '/forward/target' )
    index(): string {
        return 'Unforwarded';
    }

    @Get( 'to-submodule' )
    @Forward( '/sub-module/forward/target' )
    toSubmodule(): string {
        return 'Unforwarded';
    }

    @Get( 'target' )
    target( @Query( 'id' ) id: string ): string {
        return id;
    }
}
