/******************************************************************
 * Copyright (C) 2022 LvChengbin
 *
 * File: interfaces/application-like.interface.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 04/14/2022
 * Description:
 ******************************************************************/

import { RequireAtLeastOne } from 'type-fest';

export type ApplicationLike = RequireAtLeastOne<{
    http?( context: any ): Promise<any>;
    handle?( handler: string | symbol, ...args: any[] ): Promise<any>;
}>;
