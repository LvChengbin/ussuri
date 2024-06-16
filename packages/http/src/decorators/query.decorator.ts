/******************************************************************
 * Copyright (C) 2022-2023 NextSeason
 *
 * @File: decorators/query.decorator.ts
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

    const output = await chain(
        metadata.data.pipes,
        metadata.data.property ? context.request.query[ metadata.data.property as string ] : context.request.query,
        context,
        application,
        metadata
    );

    if( !isPlainObject( output ) || !isPlainObject( data ) ) return output;

    return { ...data, ...output };
}

export function Query<T>( property?: keyof T ): ParameterDecorator;
export function Query( ...pipes: Pipe[] ): ParameterDecorator & MethodDecorator;
export function Query<T>( property: keyof T, ...pipes: Pipe[] ): ParameterDecorator & MethodDecorator;
export function Query<T>( ...args: [ ( keyof T | Pipe )?, ...Pipe[] ] ): MethodDecorator & ParameterDecorator {
    return createPipeDecorator( { input : fn, parameter : fn }, ...args );
}
