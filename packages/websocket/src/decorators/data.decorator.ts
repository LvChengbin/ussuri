/******************************************************************
 * Copyright (C) 2022-2024 NextSeason
 *
 * @File: decorators/data.decorator.ts
 *
 * This file is part of NextSeason projects.
 * Code in this file can not be copied and/or distributed without the
 * express permission of NextSeason. Inc
 ******************************************************************/

import { isPlainObject } from 'is-plain-object';
import { Application, Pipe, PipeMetadata } from '@ussuri/core';
import { createPipeDecorator } from '@ussuri/core/decorator';
import { chain } from '@ussuri/core/pipe';
import { Context } from '../context';

async function fn( metadata: PipeMetadata, context: Context, application: Application, data: any ): Promise<unknown> {

    const property = metadata.data.property;

    const output = await chain(
        metadata.data.pipes,
        property ? context.data?.[ property as string ] : context.data,
        context,
        application,
        metadata
    );

    if( !isPlainObject( data ) ) return output;

    /**
     * Merge data into object if the previous output is a plain object
     *
     * For example:
     *
     * ```ts
     * // the `id` will be merged into output object of @SomeData with property name `id`
     * @Data( 'id' ) @SomeData() data: { id: string } & Data
     * ```
     *
     * ```ts
     * // the output of `@Data( 'id' )` will be merged into the output of `@SomeData`
     * // all properties with same name will be overwritten
     * @Data() @SomeData() data: Data
     * ```
     */
    if( property ) {
        return { ...data, [ property ] : output };
    }

    return { ...data, ...output };
}

export function Data<T>( propety?: keyof T ): ParameterDecorator;
export function Data( ...pipes: Pipe[] ): ParameterDecorator & MethodDecorator;
export function Data<T>( property: keyof T, ...pipes: Pipe[] ): ParameterDecorator & MethodDecorator;
export function Data<T>( ...args: [ ( keyof T | Pipe )?, ...Pipe[] ] ): MethodDecorator & ParameterDecorator {
    return createPipeDecorator( { input : fn, parameter : fn }, ...args );
}
