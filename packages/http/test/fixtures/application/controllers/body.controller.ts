/******************************************************************
 * Copyright (C) 2022 LvChengbin
 *
 * File: controllers/body.controller.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 05/27/2022
 * Description:
 ******************************************************************/

import { Dataclass, Property } from '@ussuri/core';
import { Controller, Post, Body, ParseInt } from '../../../../src';

@Dataclass()
class AccountData {
    @Property()
    name: string;

    @Property( ParseInt() )
    age: number;
}

@Controller( 'body' )
export class BodyController {
    @Post( 'dataclass' )
    dataclass( @Body() body: AccountData ): AccountData {
        return body;
    }
}
