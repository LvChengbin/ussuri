/******************************************************************
 * Copyright (C) 2022 LvChengbin
 *
 * File: request/index.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 04/14/2022
 * Description:
 ******************************************************************/

import { ApplicationLike } from './interfaces';
import { Test, TestOptions } from './test';
import { Assertor } from './assertor';

export function request<T extends ApplicationLike = ApplicationLike>( options: T | TestOptions<T> ): Test<T> {
    return new Test<T>( options );
}

export function assertor( context: any ): Assertor {
    return new Assertor( context );
}
