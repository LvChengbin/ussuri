/******************************************************************
 * Copyright (C) 2022-2023 NextSeason
 *
 * @File: decorators/header.decorator.ts
 *
 * This file is part of NextSeason projects.
 * Code in this file can not be copied and/or distributed without the
 * express permission of NextSeason. Inc
 ******************************************************************/

import { OutgoingHttpHeaders } from 'node:http';
import { Application, Pipe, PipeMetadata, OutputMetadata } from '@ussuri/core';
import { createOutputDecorator, createPipeDecorator } from '@ussuri/core/decorator';
import { chain } from '@ussuri/core/pipe';
import { Context } from '../context';

async function response<T>( metadata: OutputMetadata, res: T, context: Context ): Promise<T> {

    const { headers } = metadata.data as { headers: OutgoingHttpHeaders };

    if( headers ) {
        Object.keys( headers ).forEach( key => {
            context.response.set( key, headers[ key ] );
        } );
    }

    return res;
}

async function fn( metadata: PipeMetadata, context: Context, application: Application ): Promise<unknown> {
    const { data } = metadata;

    return chain(
        data.pipes,
        data.property ? context.request.get( String( data.property ) ) : context.request.headers,
        context,
        application,
        metadata
    );
}

/**
 * Set response header with property : value
 *
 * @example
 *
 * ```ts
 * class Controller {
 *     @Get()
 *     @Header( 'X-Custom-Header', 'value' )
 *     index() {}
 * }
 * ```
 *
 * @param property - key of header
 * @param value - value of header
 *
 * @return a method decorator
 */
export function Header( property: string, value: number | string | string[] ): ClassDecorator & MethodDecorator;

/**
 * Set response headers with an Object
 *
 * @example
 *
 * ```ts
 * class Controller {
 *     @Get()
 *     @Header( {
 *         'X-Custom-Header' : 'value',
 *         'Content-Type' : 'application/json'
 *     } )
 *     index() {}
 * }
 * ```
 */
export function Header( headers: OutgoingHttpHeaders ): ClassDecorator & MethodDecorator;

/**
 * Get request header with it's name
 *
 * @example
 *
 * ```ts
 * class Controller {
 *     @Get()
 *     index( @Header( 'User-Agent' ) ua: string ) {
 *     }
 * }
 * ```
 */
export function Header( property: string ): ParameterDecorator;

/**
 * Get the whole header object and transform/validate it with Pipes.
 *
 * @example
 *
 * ```ts
 * class Controller {
 *     @Get()
 *     @Header( HeaderValidationPipe )
 *     index( @Header() headers: IncomingHttpHeaders ) {
 *     }
 * }
 * ```
 */
export function Header( ...pipes: Pipe[] ): ClassDecorator & MethodDecorator & ParameterDecorator;

/**
 * Get specific value with header name and transform/validate it with Pipes
 *
 * @example
 *
 * ```ts
 * class Controller {
 *     @Get()
 *     @Header( 'X-CSRF-Token', CSRFTokenValidationPipe )
 *     index( @Header( 'X-Some-Id' ) id: number ) {
 *     }
 * }
 * ```
 */
export function Header( property: string, ...pipes: Pipe[] ): ParameterDecorator & MethodDecorator;

export function Header(
    ...args: [
        ( string | Pipe | OutgoingHttpHeaders )?,
        ( number | string | string[] | Pipe )?,
        ...Pipe[]
    ]
): ParameterDecorator & MethodDecorator & ClassDecorator {
    const [ propertyPipeOrHeaders, pipeOrValue ] = args;
    const t1 = typeof propertyPipeOrHeaders;
    const t2 = typeof pipeOrValue;

    if( t1 === 'string' && t2 === 'string' ) {
        return createOutputDecorator( response, {
            data : {
                headers : {
                    [ propertyPipeOrHeaders as string ] : pipeOrValue as string
                }
            }
        } );
    }

    if( args.length === 1 && t1 !== 'function' && t1 !== 'string' ) {
        return createOutputDecorator( response, {
            data : {
                headers : propertyPipeOrHeaders as OutgoingHttpHeaders
            }
        } );
    }

    return createPipeDecorator( { input : fn, parameter : fn }, ...args as Pipe[] );
}
