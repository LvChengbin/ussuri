/******************************************************************
 * Copyright (C) 2022-2023 NextSeason
 *
 * @File: decorators/finally.decorator.ts
 *
 * This file is part of NextSeason projects.
 * Code in this file can not be copied and/or distributed without the
 * express permission of NextSeason. Inc
 ******************************************************************/

import { Pipe, FinallyPipeMetadata } from '../interfaces';
import { createPipeDecorator } from '../decorator';
import { chain } from '../pipe';
import { Application } from '../application';

/**
 * In finally interceptor, the whole context object will be passed to pipes.
 */
async function fn( metadata: FinallyPipeMetadata, context: any, application: Application ): Promise<unknown> {
    const { data } = metadata;
    return chain( data.pipes, context, context, application, metadata );
}

/**
 * @example
 * ```ts
 * @Finally( PipeFunction )
 * class {
 *     @Finally( PipeFunction )
 *     fn() {}
 * }
 * ```
 */
export function Finally( ...pipes: Pipe[] ): MethodDecorator & ClassDecorator {
    return createPipeDecorator( { finally : fn }, ...pipes );
}
