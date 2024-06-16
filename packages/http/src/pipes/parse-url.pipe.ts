/******************************************************************
 * Copyright (C) 2022 LvChengbin
 *
 * File: pipes/parse-url.pipe.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 03/06/2022
 * Description:
 ******************************************************************/

import { URL } from 'node:url';
import { PipeMetadata } from '@ussuri/core';
import { Application } from '../application';
import { Context } from '../context';
import { BadRequestException } from '../exceptions';
import { ExceptionResponseObject } from './interfaces';

export function ParseURL( exception?: ExceptionResponseObject | Error ) {

    return async ( url: string, ctx: Context, application: Application, metadata: PipeMetadata ): Promise<URL> => {

        try { return new URL( url ) } catch( e: unknown ) {

            if( exception instanceof Error ) throw exception;

            const property = metadata?.data?.property;

            throw new BadRequestException( {
                message : [
                    property ? `Parameter ${String( property )} must be a valid URL` : 'Invalid URL'
                ],
                ...( exception ?? {} )
            } );
        }
    };
}
