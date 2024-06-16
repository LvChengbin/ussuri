/******************************************************************
 * Copyright (C) 2022 LvChengbin
 *
 * File: exceptions/service-unavailable.exception.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 06/12/2022
 * Description:
 ******************************************************************/

import { HttpException } from './http.exception';
import { HttpStatus } from '../enums';
import { createResponse, CreateResponseOptions } from './create-response';

export class ServiceUnavailableException extends HttpException {
    constructor( options?: CreateResponseOptions ) {
        super( createResponse( HttpStatus.SERVICE_UNAVAILABLE, options ) );
    }
}
