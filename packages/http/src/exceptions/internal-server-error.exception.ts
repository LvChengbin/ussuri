/******************************************************************
 * Copyright (C) 2022 LvChengbin
 *
 * File: exceptions/internal-server-error.exception.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 06/09/2022
 * Description:
 ******************************************************************/

import { HttpException } from './http.exception';
import { HttpStatus } from '../enums';
import { createResponse, CreateResponseOptions } from './create-response';

export class InternalServerErrorException extends HttpException {
    constructor( options?: CreateResponseOptions ) {
        super( createResponse( HttpStatus.INTERNAL_SERVER_ERROR, options ) );
    }
}
