/******************************************************************
 * Copyright (C) 2021 LvChengbin
 *
 * File: interceptor/create-interceptor-finally.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 04/05/2021
 * Description:
 ******************************************************************/

import { getMetadataFinally } from '../metadata';

export interface InterceptorFinally<T extends unknown[] = unknown[]> {
    ( ...args: T ): Promise<unknown>;
}

/**
 * @typeparam T
 *
 * @param descriptorOrConstructor
 */
export function createInterceptorFinally<T extends unknown[] = unknown[], D = unknown>(
    target: PropertyDescriptor | Function
): InterceptorFinally<T> {

    const metadata = getMetadataFinally<D>( target );

    return async ( ...args: T ): Promise<void> => {
        if( !metadata ) return;

        for( const item of metadata ) {
            // eslint-disable-next-line no-await-in-loop
            await item.method( item, ...args );
        }
    };
}
