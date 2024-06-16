/******************************************************************
 * Copyright (C) 2022 LvChengbin
 *
 * File: exceptions/not-acceptable.exception.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 06/12/2022
 * Description:
 ******************************************************************/

import { HttpException } from './http.exception';
import { HttpStatus } from '../enums';
import { createResponse, CreateResponseOptions } from './create-response';

export class NotAcceptableException extends HttpException {
    constructor( options?: CreateResponseOptions ) {
        super( createResponse( HttpStatus.NOT_ACCEPTABLE, options ) );
    }
}
