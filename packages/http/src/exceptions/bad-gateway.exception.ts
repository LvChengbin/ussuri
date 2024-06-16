/******************************************************************
 * Copyright (C) 2022 LvChengbin
 *
 * File: exceptions/bad-gateway.exception.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 06/12/2022
 * Description:
 ******************************************************************/

import { HttpException } from './http.exception';
import { HttpStatus } from '../enums';
import { createResponse, CreateResponseOptions } from './create-response';

export class BadGatewayException extends HttpException {
    constructor( options?: CreateResponseOptions ) {
        super( createResponse( HttpStatus.BAD_GATEWAY, options ) );
    }
}
