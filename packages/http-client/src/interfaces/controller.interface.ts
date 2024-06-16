/******************************************************************
 * Copyright (C) 2022 LvChengbin
 *
 * File: interfaces/controller.interface.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 05/08/2022
 * Description:
 ******************************************************************/

import {
    ControllerMetadata as CoreControllerMetadata,
    ControllerItem as CoreControllerItem
} from '@ussuri/core';

export interface ControllerItem extends CoreControllerItem {
    path?: string;
    name?: string;
}

export interface ControllerMetadata extends CoreControllerMetadata {
    path?: string;
    name?: string;
}
