/******************************************************************
 * Copyright (C) 2022 LvChengbin
 *
 * File: controllers/index.controller.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 04/03/2022
 * Description:
 ******************************************************************/

import { Controller, Get } from '../../../../src';

@Controller()
export class IndexController {
    @Get()
    index(): string {
        return 'Hello World!';
    }
}
