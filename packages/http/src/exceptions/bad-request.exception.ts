/******************************************************************
 * Copyright (C) 2022 LvChengbin
 *
 * File: exceptions/bad-request.exception.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 04/03/2022
 * Description:
 ******************************************************************/

import { HttpException } from './http.exception';
import { HttpStatus } from '../enums';
import { createResponse, CreateResponseOptions } from './create-response';

export class BadRequestException extends HttpException {
    constructor( options?: CreateResponseOptions ) {
        super( createResponse( HttpStatus.BAD_REQUEST, options ) );
    }
}
