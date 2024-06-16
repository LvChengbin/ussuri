/******************************************************************
 * Copyright (C) 2022 LvChengbin
 *
 * File: interfaces/pipe.interface.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 02/25/2022
 * Description:
 ******************************************************************/

import { Class, Constructor } from 'type-fest';
import { Application } from '../application';

/**
 * @example
 *
 * ```ts
 *
 * function DefaultTitle<T extends string, C>( value: T, context: C, metadata: Metadata ): string {
 *     return value || 'default title';
 * }
 *
 * @Query( 'name', DefaultTitle )
 * ```
 */
export interface PipeFunction<C = any, A extends Application<C> = any, M = any> {
    ( value: any, context?: C, application?: A, metadata?: M ): any;
}

/**
 * @example
 *
 * ```ts
 *
 * class IdValidator {
 *     transform( value: T, context: C, metadata: Metadata ): string {
 *     }
 * }
 *
 * @Query( 'id', IdValidator )
 * ```
 */
export interface PipeTransform<C = any, A extends Application<C> = any, M = any> {
    transform: ( value: any, context?: C, application?: A, metadata?: M ) => any;
}

export type PipeTransformConstructor<C = any, A extends Application<C> = any, M = any> = Class<PipeTransform<C, A, M>>;

export type Pipe<C = any, A extends Application<C> = any, M = any> =
    | PipeFunction<C, A, M>
    | PipeTransform<C, A, M>
    | PipeTransformConstructor<C, A, M>
    | Constructor<any>;
