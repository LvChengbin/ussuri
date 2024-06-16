/******************************************************************
 * Copyright (C) 2022-2024 NextSeason
 *
 * @File: pipes/is.pipe.ts
 *
 * This file is part of NextSeason projects.
 * Code in this file can not be copied and/or distributed without the
 * express permission of NextSeason. Inc
 ******************************************************************/

import { Application, PipeMetadata } from '@ussuri/core';
import { Context } from '../context';
import { BadRequestException } from '../exceptions';
import { ExceptionResponseObject } from './interfaces';
import { throwException } from './throw-exception';

export function Is<T>(
    is: ( value: T, context?: Context, application?: Application<Context>, metadata?: PipeMetadata ) => boolean,
    exception?: ExceptionResponseObject | Error | string
) {

    return ( ...args: [ T, Context?, Application<Context>?, PipeMetadata? ] ): T => {
        const res = is( ...args );

        if( res ) return args[ 0 ];

        const property = args[ 3 ]?.data?.property;
        const message = [
            property ? `Invalid ${String( property )}.` : 'Invalid parameter'
        ];

        throwException( exception, message, BadRequestException );

        return args[ 0 ];
    };
}
