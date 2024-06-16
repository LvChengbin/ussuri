/******************************************************************
 * Copyright (C) 2021 LvChengbin
 *
 * File: src/default.pipe.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 04/26/2021
 * Description:
 ******************************************************************/

import { PipeMetadata } from '@ussuri/core';
import { Context } from '../context';
import { Application } from '../application';

type Empty =
    | ''
    | null
    | undefined;

export type DefaultCallback<T, C extends Context, A extends Application<C>> =
    T extends Function
    ? ( value: Empty, context: C, application: A, metadata: PipeMetadata ) => T | Promise<T>
    : T;

/**
 * @example
 *
 * ```ts
 * @Action()
 * fn( @Query( 'id', Default( 'defaultid' ) ) id: string ) {}
 * ```
 */
export function Default<D, C extends Context, A extends Application<C>>( defaultValue: DefaultCallback<D, C, A> ) {

    return async <T>( value: T, context: C, application: A, metadata: PipeMetadata ): Promise<T | D> => {

        if( value as unknown === '' || value === undefined || value === null ) {

            if( typeof defaultValue === 'function' ) {
                return defaultValue( value, context, application, metadata );
            }
            return defaultValue as D;
        }
        return value;
    };
}
