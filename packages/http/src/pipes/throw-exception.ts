/******************************************************************
 * Copyright (C) 2022-2024 NextSeason
 *
 * @File: pipes/throw-exception.ts
 *
 * This file is part of NextSeason projects.
 * Code in this file can not be copied and/or distributed without the
 * express permission of NextSeason. Inc
 ******************************************************************/

import { Constructor } from 'type-fest';
import { BadRequestException, HttpException } from '../exceptions';
import { ExceptionResponseObject } from './interfaces';

export function throwException(
    exception: ExceptionResponseObject | Error | string | undefined,
    message: string | string[],
    Exception: Constructor<HttpException> = BadRequestException
) {
    if( exception instanceof Error ) throw exception;

    if( typeof exception === 'string' ) {
        throw new Exception( {
            message : [ exception ]
        } );
    }

    throw new Exception( { message, ...exception } );
}
