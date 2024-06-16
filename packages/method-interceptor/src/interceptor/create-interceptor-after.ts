/******************************************************************
 * Copyright (C) 2020 LvChengbin
 *
 * File: interceptor/create-interceptor-after.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 12/27/2020
 * Description:
 ******************************************************************/

import { getMetadataAfter } from '../metadata';

export interface InterceptorAfter<T extends unknown[] = unknown[]> {
    ( value: unknown, ...args: T ): Promise<unknown>;
}

/**
 * @typeparam T - arguments for interceptor method.
 *
 * @returns
 */
export function createInterceptorAfter<T extends unknown[] = unknown[], D = unknown>( target: PropertyDescriptor | Function ): InterceptorAfter<T> {

    const metadata = getMetadataAfter<D>( target );

    return async ( value, ...args ): Promise<unknown> => {
        let res: unknown = await Promise.resolve( value );

        if( !metadata ) return res;

        /**
         * the methods shoule be called in sequence
         */
        for( const item of metadata ) {
            // eslint-disable-next-line no-await-in-loop
            res = await item.method( item, res, ...args );
        }

        return res;
    };
}
