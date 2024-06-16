/******************************************************************
 * Copyright (C) 2020 LvChengbin
 *
 * File: interceptor/create-interceptor-before.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 12/26/2020
 * Description:
 ******************************************************************/

import { getMetadataBefore } from '../metadata';

export interface InterceptorBefore<T extends unknown[] = unknown[]> {
    ( ...args: T ): Promise<unknown>;
}

/**
 * create an empty interceptor method with methods is undefined.
 *
 * @typeparam T - the type of the arguments that will passed to the generated interceptor methods.
 *
 * @param descriptorOrConstructor - the descriptor of class method or the constructor of the class
 *
 * @returns a `Promise` object that resolves nothing.
 */
export function createInterceptorBefore<T extends unknown[] = unknown[], D = unknown>( target: PropertyDescriptor | Function ): InterceptorBefore<T> {

    const metadata = getMetadataBefore<D>( target );

    return async ( ...args: T ): Promise<void> => {
        if( !metadata ) return;

        for( const item of metadata ) {
            // eslint-disable-next-line no-await-in-loop
            await item.method( item, ...args );
        }
    };
}
