/******************************************************************
 * Copyright (C) 2022 LvChengbin
 *
 * File: controllers/redirect.controller.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 04/12/2022
 * Description:
 ******************************************************************/

import { Controller, Get, Status, Redirect, HttpStatus } from '../../../../src';

@Controller( 'redirect' )
export class RedirectController {
    @Get()
    @Redirect()
    index(): string {
        return '/redirect/target';
    }

    @Get( '301' )
    @Status( HttpStatus.MOVED_PERMANENTLY )
    @Redirect()
    index301(): string {
        return '/redirect/target';
    }

    @Get( 'target' )
    target(): string {
        return '';
    }
}
