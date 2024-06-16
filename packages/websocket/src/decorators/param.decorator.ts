/******************************************************************
 * Copyright (C) 2022-2024 NextSeason
 *
 * @File: decorators/param.decorator.ts
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
        property ? context.params[ property as string ] : context.params,
        context,
        application,
        metadata
    );

    if( !isPlainObject( data ) ) return output;

    if( property ) {
        return { ...data, [ property ] : output };
    }

    return { ...data, ...output };
}

export function Param<T>( property: keyof T ): ParameterDecorator;
export function Param( ...pipes: Pipe[] ): ParameterDecorator & MethodDecorator;
export function Param<T>( property: keyof T, ...pipes: Pipe[] ): ParameterDecorator & MethodDecorator;
export function Param<T>( ...args: [ ( keyof T | Pipe )?, ...Pipe[] ] ): MethodDecorator & ParameterDecorator {
    return createPipeDecorator( { input : fn, parameter : fn }, ...args );
}
