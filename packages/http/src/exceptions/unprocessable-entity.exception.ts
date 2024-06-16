/******************************************************************
 * Copyright (C) 2023 LvChengbin
 *
 * File: exceptions/unprocessable-entity.exception.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 01/08/2023
 * Description:
 ******************************************************************/

import { HttpException } from './http.exception';
import { HttpStatus } from '../enums';
import { createResponse, CreateResponseOptions } from './create-response';

export class UnprocessableEntityException extends HttpException {
    constructor( options?: CreateResponseOptions ) {
        super( createResponse( HttpStatus.UNPROCESSABLE_ENTITY, options ) );
    }
}
