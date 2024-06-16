/******************************************************************
 * Copyright (C) 2022 LvChengbin
 *
 * File: exceptions/http-version-not-supported.exception.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 06/12/2022
 * Description:
 ******************************************************************/

import { HttpException } from './http.exception';
import { HttpStatus } from '../enums';
import { createResponse, CreateResponseOptions } from './create-response';

export class HttpVersionNotSupportedException extends HttpException {
    constructor( options?: CreateResponseOptions ) {
        super( createResponse( HttpStatus.HTTP_VERSION_NOT_SUPPORTED, options ) );
    }
}
