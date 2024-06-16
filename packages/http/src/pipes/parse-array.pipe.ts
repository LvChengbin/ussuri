/******************************************************************
 * Copyright (C) 2022-2023 NextSeason
 *
 * @File: pipes/parse-array.pipe.ts
 *
 * This file is part of FIMS.
 * Code in this file can not be copied and/or distributed without the
 * express permission of NextSeason. Inc
 ******************************************************************/

import { PipeMetadata, PipeFunction } from '@ussuri/core';
import { Application } from '../application';
import { Context } from '../context';
import { BadRequestException } from '../exceptions';
import { ExceptionResponseObject } from './interfaces';

export interface ParseArrayOptions {
    json?: boolean;
    separator?: string;
    filter?: string[][ 'filter' ];
    map?: string[][ 'map' ];
    exception?: ExceptionResponseObject | Error;
}

export function ParseArray<R = string>( options?: ParseArrayOptions ): PipeFunction {

    const {
        map, filter, exception,
        json = false,
        separator = ','
    } = options ?? {};

    function parse(
        value: undefined,
        ctx: Context,
        application: Application,
        metadata: PipeMetadata
    ): undefined;

    function parse(
        value: string,
        ctx: Context,
        application: Application,
        metadata: PipeMetadata
    ): R[];

    function parse(
        value: string | undefined,
        ctx: Context,
        application: Application,
        metadata: PipeMetadata
    ): R[] | undefined {
        if( value === undefined ) return value;

        let arr: string[];

        if( json ) {
            try {
                arr = Array.isArray( value ) ? value : JSON.parse( value );
            } catch( e: unknown ) {
                if( exception instanceof Error ) throw exception;
                const property = metadata?.data?.property;
                throw new BadRequestException( {
                    statusText : [
                        property ? `${String( property )}` : 'parameter is not a valid JSON string.'
                    ],
                    ...exception
                } );
            }
        } else {
            arr = value.split( separator );
        }

        filter && ( arr = arr.filter( filter as any ) );

        return ( map ? arr.map( map as any ) : arr ) as unknown as R[];
    }

    return parse;
}
