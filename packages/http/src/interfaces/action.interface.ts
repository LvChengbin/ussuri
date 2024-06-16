/******************************************************************
 * Copyright (C) 2022 LvChengbin
 *
 * File: interfaces/action.interface.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 03/12/2022
 * Description:
 ******************************************************************/

import { ActionMetadata as CoreActionMetadata } from '@ussuri/core';
import { RequestMethod } from './request-method.interface';

export interface ActionMetadata extends CoreActionMetadata {
    path?: string | RegExp | ( string | RegExp )[];
    method: RequestMethod;
}
