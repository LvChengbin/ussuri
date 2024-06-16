/******************************************************************
 * Copyright (C) 2022 LvChengbin
 *
 * File: decorators/output.decorator.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 03/05/2022
 * Description:
 ******************************************************************/

import { Pipe, OutputPipeMetadata } from '../interfaces';
import { createPipeDecorator } from '../decorator';
import { chain } from '../pipe';
import { Application } from '../application';

async function fn( metadata: OutputPipeMetadata, value: unknown, context: any, application: Application ): Promise<unknown> {
    const { data } = metadata;
    return chain( data.pipes, value, context, application, metadata );
}

/**
 * Output interceptor for transforming or validating output data with `Pipe`s.
 *
 * @example
 *
 * ```ts
 * class {
 *     @Output( PipeFunction )
 *     fn() {
 *         return {
 *             // output data
 *         };
 *     }
 * }
 * ```
 */
export function Output( ...pipes: Pipe[] ): MethodDecorator & ClassDecorator {
    return createPipeDecorator( { output : fn }, ...pipes );
}
