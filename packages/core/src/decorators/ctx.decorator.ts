/******************************************************************
 * Copyright (C) 2022 LvChengbin
 *
 * File: decorators/ctx.decorator.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 02/25/2022
 * Description:
 ******************************************************************/

import { Pipe, PipeMetadata } from '../interfaces';
import { createPipeDecorator } from '../decorator';
import { chain } from '../pipe';
import { Application } from '../application';

async function fn<C>( metadata: PipeMetadata, ctx: C, application: Application ): Promise<unknown> {

    const { data } = metadata;

    return chain(
        data.pipes,
        data.property ? ctx[ data.property as keyof C ] : ctx,
        ctx,
        application,
        metadata
    );
}

/**
 * @example
 *
 * ```ts
 * action( @Ctx( ...pipes ) ctx: any ) {
 *     // ctx
 * }
 * ```
 */
export function Ctx( ...pipes: Pipe[] ): MethodDecorator & ParameterDecorator & ClassDecorator;

/**
 * @example
 *
 * ```ts
 * action( @Ctx( 'body' ) body: RequestBody ) {
 *     // body
 * }
 * ```
 */
export function Ctx<C>( property: keyof C ): MethodDecorator & ParameterDecorator & ClassDecorator;

/**
 * @example
 *
 * ```ts
 * action( @Ctx( 'body', ...pipes ) body: RequestBody ) {
 *     // transformed body
 * }
 * ```
 */
export function Ctx<C>( property: keyof C, ...pipe: Pipe[] ): MethodDecorator & ParameterDecorator & ClassDecorator;

export function Ctx<C>( ...args: [ ( keyof C | Pipe )?, ...Pipe[] ] ): MethodDecorator & ParameterDecorator & ClassDecorator {
    return createPipeDecorator( { input : fn, parameter : fn }, ...args );
}
