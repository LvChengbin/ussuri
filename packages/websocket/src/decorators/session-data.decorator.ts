/******************************************************************
 * Copyright (C) 2022-2024 NextSeason
 *
 * @File: decorators/session-data.decorator.ts
 *
 * This file is part of NextSeason projects.
 * Code in this file can not be copied and/or distributed without the
 * express permission of NextSeason. Inc
 ******************************************************************/

import { Application, Pipe, PipeMetadata } from '@ussuri/core';
import { createPipeDecorator } from '@ussuri/core/decorator';
import { chain } from '@ussuri/core/pipe';
import { Context } from '../context';

async function fn( metadata: PipeMetadata, context: Context, application: Application ): Promise<unknown> {
    return chain(
        metadata.data.pipes,
        context.getSessionData(),
        context,
        application,
        metadata
    );
}

export function SessionData( ...pipes: Pipe[] ): ParameterDecorator & MethodDecorator {
    return createPipeDecorator( { input : fn, parameter : fn }, ...pipes );
}
