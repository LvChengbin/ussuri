/******************************************************************
 * Copyright (C) 2022 LvChengbin
 *
 * File: decorators/exception.decorator.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 03/06/2022
 * Description:
 ******************************************************************/

import { Constructor } from 'type-fest';
import { Pipe, ExceptionPipeMetadata } from '../interfaces';
import { createPipeDecorator } from '../decorator';
import { chain } from '../pipe';
import { Application } from '../application';

async function fn( metadata: ExceptionPipeMetadata, e: unknown, ctx: any, application: Application ): Promise<unknown> {
    return chain( metadata.data.pipes, e, ctx, application, metadata );
}

/**
 * @example
 *
 * ```ts
 * @Exception( PipeFunction )
 * class {}
 * ```
 */
export function Exception( ...pipes: Pipe[] ): MethodDecorator & ClassDecorator;

/**
 * Handle exceptions if matches the `exceptionType` parameter
 *
 * @example
 *
 * ```ts
 * @Exception( CustomException, PipeFunction )
 * class {}
 * ```
 */
export function Exception( exceptionType: Constructor<Error>, ...pipes: Pipe[] ): MethodDecorator & ClassDecorator;

export function Exception( exceptionType: Constructor<Error> | Pipe | null, ...pipes: Pipe[] ): MethodDecorator & ClassDecorator {

    if( exceptionType && !( 'prototype' in exceptionType && exceptionType.prototype instanceof Error ) ) {
        pipes = [ exceptionType as Pipe, ...pipes ];
        exceptionType = null;
    }

    const data = exceptionType ? {
        exceptionType : exceptionType as Constructor<Error>
    } : {};

    return createPipeDecorator( {
        exception : fn,
        exceptionOptions : data
    }, ...pipes );
}
