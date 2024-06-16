/******************************************************************
 * Copyright (C) 2022-2023 NextSeason
 *
 * @File: decorators/cookie.decorator.ts
 *
 * This file is part of NextSeason projects.
 * Code in this file can not be copied and/or distributed without the
 * express permission of NextSeason. Inc
 ******************************************************************/

import { CookieSerializeOptions } from 'cookie';
import { Application, Pipe, PipeMetadata, OutputMetadata } from '@ussuri/core';
import { createOutputDecorator, createPipeDecorator } from '@ussuri/core/decorator';
import { chain } from '@ussuri/core/pipe';
import { Context } from '../context';

async function response<T>( metadata: OutputMetadata, res: T, context: Context ): Promise<T> {
    const { cookie } = metadata.data as any;
    if( cookie ) {
        const [ name, value, options ] = cookie;
        context.setCookie( name, value, {
            domain : context.hostname,
            ...options
        } );
    }
    return res;
}

async function fn( metadata: PipeMetadata, context: Context, application: Application ): Promise<unknown> {
    const { data } = metadata;
    return chain(
        data.pipes,
        data.property ? context.cookie( data.property ) : context.cookie(),
        context,
        application,
        metadata
    );
}

export function Cookie( name?: string, ...pipes: Pipe[] ): ClassDecorator & MethodDecorator & ParameterDecorator;
export function Cookie(
    name: string,
    value: string,
    options?: CookieSerializeOptions
): ClassDecorator & MethodDecorator;

export function Cookie(
    ...args: [ string?, ...Pipe[] ] | [ string, string, CookieSerializeOptions? ]
): ClassDecorator & MethodDecorator & ParameterDecorator {
    const [ , value ] = args;

    if( typeof value === 'string' ) {
        /**
         * Set cookie
         */
        return createOutputDecorator( response, {
            data : { cookie : args }
        } );
    }

    return createPipeDecorator( { input : fn, parameter : fn }, ...args );
}
