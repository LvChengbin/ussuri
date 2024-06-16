/******************************************************************
 * Copyright (C) 2022 LvChengbin
 *
 * File: pipes/match.pipe.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 03/06/2022
 * Description:
 ******************************************************************/

import { PipeMetadata } from '@ussuri/core';
import { Application } from '../application';
import { Context } from '../context';
import { BadRequestException } from '../exceptions';
import { ExceptionResponseObject } from './interfaces';

export type MatchPattern = string | RegExp | ( string | RegExp )[];

/**
 *
 * @param pattern - the match pattern, it can be a sting or a regexp or list of strings/regexps
 * @param exception - the exception will be thrown if match failed, the function will throw a HttpException instance by default
 *
 * @example
 *
 * ```ts
 * fn( @Query( 'domain', Match( /\.google\.com$/ ) ) domain: string ) {
 *     return { domain };
 * }
 *
 * fn(
 *     @Query( 'domain', Match( /\.google\.com$/, new Error( 'server error' ) ) ) domain: string
 * ) {
 *     return { domain };
 * }
 *
 * fn(
 *     @Query( 'domain', Match( [ 'example1.com', 'example2.com' ], { status : 400, message : 'message' } ) ) domain: string
 * ) {
 *     return { domain };
 * }
 * ```
 */
export function Match<T extends string | number>( pattern: MatchPattern, exception?: ExceptionResponseObject | Error ) {

    return async ( value: T, ctx: Context, application: Application, metadata: PipeMetadata ): Promise<T> => {

        if( value === undefined ) return value;

        if( typeof pattern === 'string' ) {

            if( pattern === String( value ) ) return value;

        } else if( pattern instanceof RegExp ) {

            if( pattern.test( String( value ) ) ) return value;

        } else {

            const str = String( value );
            for( const item of pattern ) {
                if( item === str || ( item instanceof RegExp && item.test( str ) ) ) {
                    return value;
                }
            }

        }

        if( exception instanceof Error ) throw exception;

        const property = metadata?.data?.property;

        const text = Array.isArray( pattern )
            ? `any of [ ${pattern.map( x => typeof x === 'string' ? `"${String( x ) }"` : String( x ) ).join( ', ' )} ]`
            : `"${String( pattern )}"`;

        throw new BadRequestException( {
            message : [
                property ? `${String( property )} should match ${text}` : `parameter does not match ${text}`
            ],
            ...( exception ?? {} )
        } );
    };
}
