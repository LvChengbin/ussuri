/******************************************************************
 * Copyright (C) 2022 LvChengbin
 *
 * File: src/context.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 05/08/2022
 * Description:
 ******************************************************************/

import { RequestOptions } from './interfaces';

export type ContextOptions = RequestOptions;

export class Context {
    options: RequestOptions;
    constructor( options: ContextOptions ) {
        this.options = { ...options };
    }
}
