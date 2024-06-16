/******************************************************************
 * Copyright (C) 2020 LvChengbin
 *
 * File: interceptor/create-interceptor-exception.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 12/28/2020
 * Description:
 ******************************************************************/

import { Broker } from '../broker';
import { getMetadataException } from '../metadata';

export interface InterceptorException<T extends unknown[] = unknown[]> {
    ( e: unknown, ...args: T ): Promise<unknown>;
}

export function createInterceptorException<T extends unknown[] = unknown[], D = unknown>( target: PropertyDescriptor | Function ): InterceptorException<T> {

    const metadata = getMetadataException<D>( target );

    return async ( e, ...args ): Promise<unknown> => {

        if( !metadata ) throw e;

        for( const item of metadata ) {
            /**
             * Don't catch Broker if not specify Broker as exceptionType
             */
            if( !item.exceptionType && e instanceof Broker ) throw e;

            if( !item.exceptionType || e instanceof ( item.exceptionType as Function ) ) {
                return item.method( item, e, ...args );
            }
        }
        throw e;
    };
}
