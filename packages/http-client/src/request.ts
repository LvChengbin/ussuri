/******************************************************************
 * Copyright (C) 2022 LvChengbin
 *
 * File: src/request.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 06/11/2022
 * Description:
 ******************************************************************/

import parse from 'url-parse';
import { HttpException, exceptions } from '@ussuri/http/exceptions';
import { RequestOptions } from './interfaces';
import { Response } from './response';
import { request as send } from './platform/node';
import { joinPath, isRequestWithPayload, interpolateURL, mergeData, spreadFormData } from './utils';

export async function request( options: RequestOptions ): Promise<Response> {


    const { interceptors } = options;


    if( interceptors?.request ) {
        options = interceptors.request( options );
    }

    /**
     * `@types/url-parse` marks `pathname` in URLParse interface as readonly by mistake.
     * and it doesn't export the interface from the module.
     */
    const url = parse( options.url ?? '' ) as any;
    const { method = 'GET' } = options;
    options.path && ( url.pathname = joinPath( url.pathname, options.path ) );

    if( isRequestWithPayload( method ) ) {
        options.data = mergeData( options.data, options.payload );
        url.pathname = interpolateURL( url.pathname, {
            ...spreadFormData( options.data ),
            ...options.params
        } );
    } else {
        delete options.data;
        options.query = { ...options.query, ...options.payload };
        url.pathname = interpolateURL( url.pathname, {
            ...options.query,
            ...options.params
        } );
    }

    const config = { ...options, url : url.toString() };

    const res = await send( config );

    const response = new Response( {
        body : res.body ?? null,
        status : res.status,
        statusText : res.statusText ?? '',
        headers : res.headers,
        options : config
    } );

    if( response.status < 200 || response.status > 300 ) {
        const Exception = ( exceptions as any )[ response.status ] ?? HttpException;
        throw new Exception( response as Record<string, any> );
    }
    return response;
}
