/******************************************************************
 * Copyright (C) 2022 LvChengbin
 *
 * File: browser/index.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 06/11/2022
 * Description:
 ******************************************************************/

import axios, { AxiosRequestConfig } from 'axios';
import { isRequestWithPayload } from '../../utils';
import { RequestOptions } from '../../interfaces';
import { ResponseData } from '../../response';

export async function request( options: RequestOptions ): Promise<ResponseData> {

    const {
        query,
        method = 'GET',
        timeout = 300000,
        withCredentials = false,
        responseType = 'json',
        validateStatus = ( status: number ): boolean => status > 0,
        params, // eslint-disable-line @typescript-eslint/no-unused-vars
        ...rest
    } = options;

    const config: AxiosRequestConfig = {
        params : query,
        method, timeout, withCredentials, responseType, validateStatus,
        ...rest
    };

    if( isRequestWithPayload( config.method as string ) ) {
        config.data = options.data;
    }

    return axios( config ).then( response => ( {
        body : response.data,
        status : response.status,
        statusText : response.statusText,
        headers : response.headers
    } ) );
};
