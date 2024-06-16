/******************************************************************
 * Copyright (C) 2022 LvChengbin
 *
 * File: pipes/parse-int.pipe.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 05/03/2022
 * Description:
 ******************************************************************/

import { Application, PipeFunction, PipeMetadata } from '@ussuri/core';
import { Context } from '../context';
import { BadRequestException } from '../exceptions';
import { ExceptionResponseObject } from './interfaces';
import { throwException } from './throw-exception';

/**
 * Parse a value to int, `NaN` or `Infinity` may be returned as the parsing result.
 * Validate the value before parsing if you don't want unexpected values.
 *
 * @example
 *
 * ```ts
 * @Query( 'type', ParseInt() )
 * ```
 */
export function ParseInt(
    defaultValueOrException?: number | ExceptionResponseObject | Error | string,
    exception?: ExceptionResponseObject | Error | string
): PipeFunction {

    let defaultValue: number;

    if( typeof defaultValueOrException === 'number' ) {
        defaultValue = defaultValueOrException;
    } else {
        exception ??= defaultValueOrException;
    }


    function parse( value: undefined ): undefined;
    function parse( value: string ): number;

    function parse(
        value: string | undefined,
        ctx?: Context,
        application?: Application,
        metadata?: PipeMetadata
    ): number | undefined {
        if( value === undefined ) return defaultValue ?? value;
        const n = parseInt( value );
        if( !isNaN( n ) ) return n;

        const property = metadata?.data?.property;
        const message = [
            property ? `${String( property )} should be a number` : 'invalid parameter'
        ];

        throwException( exception, message, BadRequestException );
    }

    return parse;
}
