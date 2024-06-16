/******************************************************************
 * Copyright (C) 2022 LvChengbin
 *
 * File: exceptions/create-response.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 04/03/2022
 * Description:
 ******************************************************************/

import statuses from 'statuses';

export type CreateResponseOptions =
    | string
    | string[]
    | Record<string, unknown>;

export function createResponse( status: number, options?: CreateResponseOptions ): Record<string, unknown> {

    const response: Record<string, unknown> = {
        status,
        error : statuses.message[ status ] ?? ''
    };
    if( !options ) return response;

    if( typeof options === 'string' || Array.isArray( options ) ) {
        response.message = options;
    } else {
        Object.assign( response, options );
    }

    return response;
}
