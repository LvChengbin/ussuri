/******************************************************************
 * Copyright (C) 2022 LvChengbin
 *
 * File: interfaces/action.interface.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 05/08/2022
 * Description:
 ******************************************************************/

import { ActionMetadata as CoreActionMetadata } from '@ussuri/core';
import { RequestMethod } from '@ussuri/http/interfaces';

export interface ActionMetadata extends CoreActionMetadata {
    path?: string;
    method: RequestMethod;
}
