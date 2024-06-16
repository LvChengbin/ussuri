/******************************************************************
 * Copyright (C) 2022 LvChengbin
 *
 * File: exceptions/forbidden.exception.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 05/31/2022
 * Description:
 ******************************************************************/

import { HttpException } from './http.exception';
import { HttpStatus } from '../enums';
import { createResponse, CreateResponseOptions } from './create-response';

export class ForbiddenException extends HttpException {
    constructor( options?: CreateResponseOptions ) {
        super( createResponse( HttpStatus.FORBIDDEN, options ) );
    }
}
