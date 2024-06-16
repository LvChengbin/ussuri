/******************************************************************
 * Copyright (C) 2022 LvChengbin
 *
 * File: utils/set-response.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 04/12/2022
 * Description:
 ******************************************************************/

import { Context } from '../context';

export function setResponse<T extends Context>( response: unknown, context: T ): T {
    if( response instanceof Context ) return response as T;
    context.body = typeof response === 'number' ? String( response ) : response;
    return context;
}
