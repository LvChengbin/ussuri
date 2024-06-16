/******************************************************************
 * Copyright (C) 2022-2023 NextSeason
 *
 * @File: decorators/file.decorator.ts
 *
 * This file is part of NextSeason projects.
 * Code in this file can not be copied and/or distributed without the
 * express permission of NextSeason. Inc
 ******************************************************************/

import { Application, Pipe, PipeMetadata } from '@ussuri/core';
import { createPipeDecorator } from '@ussuri/core/decorator';
import { chain } from '@ussuri/core/pipe';
import { Context } from '../context';
import { bodyParse } from './body-parse';

async function fn( metadata: PipeMetadata, context: Context, application: Application ): Promise<unknown> {

    await bodyParse( context );

    const files = await context.request.files as any;
    const { property } = metadata.data;

    let value: any;

    if( property ) {
        try {
            value = files[ property ];
        } catch( e: unknown ) { value = undefined };
    } else value = files;

    return chain( metadata.data.pipes, value, context, application, metadata );
}

export function File( property?: string ): ParameterDecorator;
export function File( ...pipes: Pipe[] ): MethodDecorator & ParameterDecorator;

export function File( ...args: [ ( string | Pipe )?, ...Pipe[] ] ): MethodDecorator & ParameterDecorator {
    return createPipeDecorator( { input : fn, parameter : fn }, ...args );
}
