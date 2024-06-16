/******************************************************************
 * Copyright (C) 2022 LvChengbin
 *
 * File: pipes/in.pipe.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 05/03/2022
 * Description:
 ******************************************************************/

import { PipeMetadata } from '@ussuri/core';
import { BadRequestException } from '../exceptions';
import { ExceptionResponseObject } from './interfaces';
import { throwException } from './throw-exception';

export function In(
    list: any[] | Record<string | number, string | number>,
    exception?: ExceptionResponseObject | Error | string
) {

    /**
     * Support pass an `enum` variable to `In` pipe directly.
     * If the given list is an object, it'll be regraded as an enum.
     */
    const options = Array.isArray( list )
        ? list
        : Object.values( list ).filter( x => typeof x === 'number' );

    return <T>( value: T, context: any, application: any, metadata: PipeMetadata ): T => {
        /**
         * Checking `undefined` or `empty value` should use `Required()` or `NotEmpty` pipe.
         */
        if( value === undefined ) return value;
        if( options.includes( value ) ) return value;

        const property = metadata?.data?.property;
        const str = `[ ${options.join( ', ' )} ]`;
        const message = [
            property ? `${String( property )} should be in ${str}.` : `parameter should be in ${str}.`
        ];

        throwException( exception, message, BadRequestException );

        return value;
    };
}
