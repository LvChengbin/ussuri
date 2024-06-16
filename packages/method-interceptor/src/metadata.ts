/******************************************************************
 * Copyright (C) 2021 LvChengbin
 *
 * File: metadata/metadata.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 10/02/2021
 * Description:
 ******************************************************************/

import { KEY_BEFORE, KEY_AFTER, KEY_EXCEPTION, KEY_PARAMETER, KEY_FINALLY } from './constants';
import {
    Metadata,
    MetadataBefore,
    MetadataAfter,
    MetadataException,
    MetadataParameter,
    MetadataFinally,
    MethodBefore,
    MethodAfter,
    MethodException,
    MethodParameter,
    MethodFinally
} from './interfaces';

type Target = PropertyDescriptor | Function;

function saveMethodMetadata( key: symbol | string, target: Target, metadata: Metadata ): void {
    const t = typeof target === 'function' ? target : target.value;
    const metadatas: Metadata[] = Reflect.getMetadata( key, t ) || [];
    metadatas.push( metadata );
    Reflect.defineMetadata( key, metadatas, t );
}

function getMethodMetadata<T extends Metadata = Metadata>( key: string | symbol, target: Target ): T[] {
    return Reflect.getMetadata( key, typeof target === 'function' ? target : target.value ) ?? [];
}

/**
 * save metadata for interceptor before.
 *
 * @param descriptor
 * @param method
 * @param options
 */
export function saveMetadataBefore<T extends any[], D>(
    target: Target,
    method: MethodBefore<T, D>,
    options: Pick<Metadata<D>, 'data'> = {}
): void {
    saveMethodMetadata( KEY_BEFORE, target, {
        ...options,
        method,
        interceptorType : 'before'
    } );
}

export function getMetadataBefore<D = any>( target: Target ): MetadataBefore<D>[] {
    return getMethodMetadata<MetadataBefore<D>>( KEY_BEFORE, target );
}

/**
 * save metadata for interceptor after
 *
 * @param descriptor
 * @param method
 * @param options
 */
export function saveMetadataAfter<T extends any[], D>(
    target: Target,
    method: MethodAfter<T, D>,
    options: Pick<Metadata<D>, 'data'> = {}
): void {
    saveMethodMetadata( KEY_AFTER, target, {
        ...options,
        method,
        interceptorType : 'after'
    } );
}

export function getMetadataAfter<D = any>( target: Target ): MetadataAfter<D>[] {
    return getMethodMetadata<MetadataAfter<D>>( KEY_AFTER, target );
}

/**
 * save metadata for interceptor exception
 *
 * @param descriptor
 * @param method
 * @param options
 */
export function saveMetadataException<T extends any[], D>(
    target: Target,
    method: MethodException<T, D>,
    options: Pick<MetadataException<D>, 'exceptionType' | 'data'> = {}
): void {
    saveMethodMetadata( KEY_EXCEPTION, target, {
        ...options,
        method,
        interceptorType : 'exception'
    } );
}

export function getMetadataException<D = any>( target: Target ): MetadataException<D>[] {
    return getMethodMetadata<MetadataException<D>>( KEY_EXCEPTION, target );
}

/**
 * save metadata for interceptor finally
 *
 * @param descriptorOrConstructor
 */
export function saveMetadataFinally<T extends any[], D>(
    target: Target,
    method: MethodFinally<T, D>,
    options: Pick<MetadataFinally<D>, 'data'> = {}
): void {
    saveMethodMetadata( KEY_FINALLY, target, {
        ...options,
        method,
        interceptorType : 'finally'
    } );
}

export function getMetadataFinally<D = any>( target: Target ): MetadataFinally<D>[] {
    return getMethodMetadata<MetadataFinally<D>>( KEY_FINALLY, target );
}

/**
 * Save metadata for the **i**th parameter of a method, all metadatas for a target method will be stored into a two-dementional array
 *
 * |---------------------------------------------------------------------|
 * | 0 | MetadataParameter | MetadataParameter | ...                     |
 * |---------------------------------------------------------------------|
 * | 1 | MetadataParameter | ...                                         |
 * |---------------------------------------------------------------------|
 * | 2 | MetadataParameter | MetadataParameter | MetadataParameter | ... |
 * |---------------------------------------------------------------------|
 * | ...                                                                 |
 * |---------------------------------------------------------------------|
 *
 * @param target
 * @param key
 * @param i
 * @param method
 * @param options
 */
export function saveMetadataParameter<T extends any[], D>(
    target: object,
    /**
     * I started to use any instead of using `string | symbol | undefined` which is
     * defined in type `ParameterDecorator`, because the `reflect-metadata` doesn't support
     * using `undefined` as the `propertyKey` but the latest version of decorator spec
     * add `undefined` supported.
     *
     * `reflect-metadata` library may upgrade it type declaration later or not.
     */
    key: any, // string | symbol | undefined,
    i: number,
    method: MethodParameter<T, D>,
    options: Pick<MetadataParameter<D>, 'data'> = {}
): void {

    const paramtypes = Reflect.getMetadata( 'design:paramtypes', target, key );

    const metadata: MetadataParameter<D> = {
        ...options,
        method,
        interceptorType : 'parameter',
        paramtype : paramtypes?.[ i ] ?? Object
    };

    const metadatas: MetadataParameter<D>[][] = Reflect.getMetadata( KEY_PARAMETER, target, key ) || [];

    if( !metadatas[ i ] ) metadatas[ i ] = [ metadata ];
    else metadatas[ i ].push( metadata );

    Reflect.defineMetadata( KEY_PARAMETER, metadatas, target, key );
}

export function getMetadataParameter<D = any>( ...args: [ object, ( string | symbol )? ] ): ( MetadataParameter<D>[] | undefined )[] {

    const output: ( MetadataParameter[] | undefined )[] = [];
    const metadatas = Reflect.getMetadata( KEY_PARAMETER, ...args as [ object ] );

    const paramtypes = Reflect.getMetadata( 'design:paramtypes', ...args as [ object ] );

    paramtypes?.forEach( ( paramtype: any, i: number ) => {

        /**
         * undefined value has to be set, cuz `Array.prototype.forEach` ignores uninitizlized values.
         * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach#no_operation_for_uninitialized_values_sparse_arrays
         */
        if( !metadatas?.[ i ] ) {
            output[ i ] = undefined;
            return;
        };
        output[ i ] = metadatas[ i ].map( ( item: MetadataParameter ) => {
            return { ...item, paramtype };
        } );
    } );

    return output;
}
