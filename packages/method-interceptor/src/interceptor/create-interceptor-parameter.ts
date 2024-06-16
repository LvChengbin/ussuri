/******************************************************************
 * Copyright (C) 2021 LvChengbin
 *
 * File: interceptor/create-interceptor-parameter.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 01/05/2021
 * Description:
 ******************************************************************/

import { getMetadataParameter } from '../metadata';

export interface InterceptorParameter<T extends unknown[] = unknown[]> {
    ( ...args: T ): Promise<unknown[]>;
}

export interface InterceptorParameterSync<T extends unknown[] = unknown[]> {
    ( ...args: T ): unknown[];
}

type Args = [ obj: Object, methodName?: string | symbol ];

/**
 * Create an interceptor function with MetadataParameter and return a function used to generate real parameter list for the target method.
 *
 * @example
 *
 * ```ts
 *
 * class Example {
 *     // IDDecorator and NameDecorator can be generated with createMethodDecorator method.
 *     foo( @IDDecorator id: number, @NameDecorator name: string ) {}
 * }
 *
 * const parameters = createInterceptorParameter( Example.prototype, 'foo' )();
 *
 * ( new Example() ).foo( ...parameters );
 * ```
 */
export function createInterceptorParameter<T extends unknown[] = unknown[], D = unknown>( ...args: Args ): InterceptorParameter<T> {

    const bundle = getMetadataParameter<D>( ...args );

    return async ( ...args: T ): Promise<unknown[]> => {
        const promises: Promise<unknown>[] = [];

        bundle.forEach( ( metadata ) => {

            if( !metadata?.length ) {
                promises.push( Promise.resolve( undefined ) );
                return;
            }

            /**
             * Using undefined as the initial value.
             */
            let promise: Promise<unknown> = Promise.resolve( undefined );

            for( let i = 0, l = metadata.length; i < l; i += 1 ) {
                const item = metadata[ i ];
                promise = promise.then( val => {
                    return ( item as any ).method?.( item, ...[ ...args, val ] ) ?? undefined;
                } );
            }

            promises.push( promise );
        } );

        return Promise.all( promises );
    };
}

export function createInterceptorParameterSync<T extends unknown[] = unknown[], D = unknown>( ...args: Args ): InterceptorParameterSync<T> {

    const bundle = getMetadataParameter<D>( ...args );

    return ( ...args: T ): unknown[] => {

        const parameters: unknown[] = [];

        bundle.forEach( ( metadata ) => {

            if( !metadata?.length ) {
                parameters.push( undefined );
                return;
            }

            let val = undefined;

            for( let i = 0, l = metadata.length; i < l; i += 1 ) {
                const item = metadata[ i ];
                val = ( item as any ).method?.( item, ...[ ...args, val ] ) ?? undefined;
            }

            parameters.push( val );
        } );

        return parameters;
    };
}
