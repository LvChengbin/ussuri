/******************************************************************
 * Copyright (C) 2022 LvChengbin
 *
 * File: interfaces/injection.interface.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 02/10/2022
 * Description:
 ******************************************************************/

import { Class } from 'type-fest';
import { Scope } from '../enums';

export type InjectionToken =
    | string
    | number
    | symbol
    | bigint
    | Class<any>
    | Function;

export interface InjectableOptions {
    scope?: Scope;
}
