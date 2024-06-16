/******************************************************************
 * Copyright (C) 2022 LvChengbin
 *
 * File: decorators/param.decorator.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 10/17/2022
 * Description:
 ******************************************************************/

// import { createPipeDecorator } from '@ussuri/core';
// import { Pipe, PipeMetadata } from '@ussuri/core';
// import { Context } from '../context';
// import { Application } from '../application';

// function fn( metadata: PipeMetadata, context: Context, application: Application ): Promise<unknown> {
//     const
// }

// export function Param(
//     ...pipes: Pipe[]
// ): ClassDecorator & MethodDecorator & ParameterDecorator;

// export function Param(
//     key: string,
//     ...pipes: Pipe[]
// ): ClassDecorator & MethodDecorator & ParameterDecorator;

// export function Param(
//     key: string,
//     value: string | number
// ): ClassDecorator & MethodDecorator & ParameterDecorator;

// export function Param(
//     params: Record<string, string | number>
// ): ClassDecorator & MethodDecorator & ParameterDecorator;

// export function Param(
//     ...args: [
//         ( string | Record<string, string | number> | Pipe ),
//         ( string | number | Pipe ),
//         ...Pipe[]
//     ]
// ): ClassDecorator & MethodDecorator & ParameterDecorator {

//     const t1 = typeof args[ 0 ];
//     const t2 = typeof args[ 1 ];

//     if( args.length > 1 && t1 === 'string' && t2 !== 'function' ) {

//     }

//     return createPipeDecorator( { input : fn, parameter : fn, ...args } );
// }
