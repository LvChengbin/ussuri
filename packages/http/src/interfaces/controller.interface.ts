/******************************************************************
 * Copyright (C) 2022 LvChengbin
 *
 * File: interfaces/controller.interface.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 03/12/2022
 * Description:
 ******************************************************************/

import { ControllerMetadata as CoreControllerMetadata, ControllerItem as CoreControllerItem } from '@ussuri/core';

type Path =
    | string
    | RegExp
    | ( string | RegExp )[];

export interface ControllerItem extends CoreControllerItem {
    path?: Path;
}

export interface ControllerMetadata extends CoreControllerMetadata {
    path?: Path;
}
