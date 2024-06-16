/******************************************************************
 * Copyright (C) 2022 LvChengbin
 *
 * File: exceptions/notfound.exception.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 03/27/2022
 * Description:
 ******************************************************************/

import { HttpException } from './http.exception';
import { HttpStatus } from '../enums';
import { createResponse, CreateResponseOptions } from './create-response';

export class NotFoundException extends HttpException {
    constructor( options?: CreateResponseOptions ) {
        super( createResponse( HttpStatus.NOT_FOUND, options ) );
    }
}
