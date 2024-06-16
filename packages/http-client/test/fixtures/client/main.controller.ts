/******************************************************************
 * Copyright (C) 2022 LvChengbin
 *
 * File: client/main.controller.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 05/11/2022
 * Description:
 ******************************************************************/

import { Controller, Get } from '../../../src';

@Controller()
export class MainController {
    @Get()
    index(): void {}

    @Get( '/id' )
    id(): void {}
}
