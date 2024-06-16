/******************************************************************
 * Copyright (C) 2022 LvChengbin
 *
 * File: exceptions/unauthorized.exception.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 05/31/2022
 * Description:
 ******************************************************************/

import { HttpException } from './http.exception';
import { HttpStatus } from '../enums';
import { createResponse, CreateResponseOptions } from './create-response';

export class UnauthorizedException extends HttpException {
    constructor( options?: CreateResponseOptions ) {
        super( createResponse( HttpStatus.UNAUTHORIZED, options ) );
    }
}
