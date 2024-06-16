/******************************************************************
 * Copyright (C) 2022-2023 NextSeason
 *
 * @File: src/response.ts
 *
 * This file is part of NextSeason projects.
 * Code in this file can not be copied and/or distributed without the
 * express permission of NextSeason. Inc
 ******************************************************************/

import { HttpStatus } from '@ussuri/http/enums';
import { RequestOptions } from './interfaces';

export interface ResponseData<T = any> {
    body: T;
    status: HttpStatus;
    statusText?: string;
    headers: Record<string, string | number | string[] | undefined>;
}

export class Response<T = any> {

    declare body: T;
    declare status: HttpStatus;
    declare headers: Record<string, string | number | string[] | undefined>;
    declare options: RequestOptions;
    statusText?: string;

    constructor( data: ResponseData<T> & { options: RequestOptions } ) {
        Object.assign( this, data );
    }
}
