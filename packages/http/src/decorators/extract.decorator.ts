/******************************************************************
 * Copyright (C) 2022-2024 NextSeason
 *
 * @File: decorators/extract.decorator.ts
 *
 * This file is part of NextSeason projects.
 * Code in this file can not be copied and/or distributed without the
 * express permission of NextSeason. Inc
 ******************************************************************/

import { isPlainObject } from 'is-plain-object';
import { Application, Pipe as CorePipe, PipeMetadata } from '@ussuri/core';
import { createPipeDecorator } from '@ussuri/core/decorator';
import { chain } from '@ussuri/core/pipe';
import { bodyParse } from './body-parse';
import { Context } from '../context';

type Pipe = CorePipe<Context, Application<Context>>;

async function fn( metadata: PipeMetadata, context: Context, application: Application, data: any ): Promise<unknown> {

    await bodyParse( context );

    const body = await context.request.body as any;
    const { property } = metadata.data;

    let value: any;

    if( property ) {
        value = context.params[ property ]
            ?? body?.[ property ]
            ?? context.request.query[ property ];
    } else {
        value = {
            ...context.request.query,
            ...body,
            ...context.params
        };
    }

    const output = await chain(
        metadata.data.pipes,
        value,
        context,
        application,
        metadata
    );

    if( !isPlainObject( output ) || !isPlainObject( data ) ) return output;

    return { ...data, ...output };
}

/**
 * Function for generating a parameter decorator or a method decoraotr.
 * The request stream will be parsed and the entire `body` object will be extracted and be bound to ctx as ctx.body.
 * Populates the decorated parameter with the value of body.
 *
 * @example
 *
 * ```ts
 * @Extract( validationPipe )
 * create() {}
 *
 * async create( @Extract( validationPipe ) account: Account ) {}
 *
 * ```
 *
 * @param `Pipe` for data transformation or validation.
 *
 * @returns the parameter decorator or the method decorator
 */
export function Extract( ...pipes: Pipe[] ): ClassDecorator & MethodDecorator & ParameterDecorator;

/**
 * Function for generating a parameter decorator.
 * The request stream will be parsed and the entire `body` object will be extracted and be bound to ctx as ctx.body.
 * Populates the property of body to the decorated parameter.
 *
 * @example
 *
 * ```ts
 * @Controller()
 * class SampleController {
 *     @Post()
 *     async create( @Extract( 'name' ) ) {}
 * }
 * ```
 *
 * @param property name
 */
export function Extract<T>( property: keyof T ): ParameterDecorator;

/**
 * @example
 *
 * ```ts
 * class SampleController {
 *     @Post()
 *     @Extract( 'id', validationPipe )
 *     async create( @Extract( 'name', toLowerCasePipe ) body: any ) {}
 * }
 * ```
 */
export function Extract<T>( property: keyof T, ...pipes: Pipe[] ): ClassDecorator & MethodDecorator & ParameterDecorator;

/**
 * @example
 *
 * ```ts
 *
 * interface User {
 *     name: string;
 *     age: number;
 *     sex: string;
 * }
 *
 * class UserController {
 *     @Post()
 *     async create(
 *         @Extract<User>( {
 *             name : [ NameValidator ],
 *             age : ParseInt,
 *             sex : [ SexValidator, ParseInt ]
 *        } ) user: User
 *     ): void {}
 * }
 * ```
 */
export function Extract<T>( obj: Record<keyof T, Pipe | Pipe[]>, ...pipes: Pipe[] ): ClassDecorator & MethodDecorator & ParameterDecorator;

export function Extract<T>( ...args: [ ( keyof T | Record<keyof T, Pipe | Pipe[]> | Pipe )?, ...Pipe[] ] ): MethodDecorator & ParameterDecorator {
    return createPipeDecorator<Context, Application<Context>>( { input : fn, parameter : fn }, ...args );
}
