/******************************************************************
 * Copyright (C) 2022-2023 NextSeason
 *
 * @File: utils/create-constructor-interceptors.ts
 *
 * This file is part of NextSeason projects.
 * Code in this file can not be copied and/or distributed without the
 * express permission of NextSeason. Inc
 ******************************************************************/

import { Constructor } from 'type-fest';
import {
    createInterceptorBefore,
    createInterceptorAfter,
    createInterceptorException,
    createInterceptorFinally,
    InterceptorBefore,
    InterceptorAfter,
    InterceptorException,
    InterceptorFinally
} from '@ussuri/method-interceptor';

const constructorInterceptorsCache = new Map<Constructor<unknown>, Interceptors>();

interface Interceptors {
    before: InterceptorBefore;
    after: InterceptorAfter;
    exception: InterceptorException;
    finally: InterceptorFinally;
}

/**
 * Create `before`, `after` and `exception` interceptors for the given constructor.
 * Get interceptors from cache if exists.
 */
export function createConstructorInterceptors( constructor: Constructor<unknown> ): Interceptors {

    const cache = constructorInterceptorsCache.get( constructor );

    if( cache ) return cache;

    const interceptors = {
        before : createInterceptorBefore( constructor ),
        after : createInterceptorAfter( constructor ),
        exception : createInterceptorException( constructor ),
        finally : createInterceptorFinally( constructor )
    };

    constructorInterceptorsCache.set( constructor, interceptors );

    return interceptors;
}

