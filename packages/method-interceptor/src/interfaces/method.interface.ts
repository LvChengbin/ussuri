/******************************************************************
 * Copyright (C) 2022 LvChengbin
 *
 * File: interfaces/method.interface.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 03/01/2022
 * Description:
 ******************************************************************/

import { MetadataBefore, MetadataAfter, MetadataException, MixedMetadataParameter, MetadataFinally } from './metadata.interface';

/**
 * The interface of methods that will be called by `InterceptorBefore`.
 */
export interface MethodBefore<T extends any[] = any[], D = any> {
    /**
     * @param metadata - {@link MetadataBefore}
     * @param ...args - other arguments for the method
     */
    ( metadata: MetadataBefore<D>, ...args: T ): any;
}

/**
 * The interface of methods the will be called by `InterceptorAfter`.
 *
 */
export interface MethodAfter<T extends any[] = any[], D = any> {
    /**
     * @param metadata - {@link MetadataAfter}
     * @param value - the return value of the target method or the intercetpor method before the current one
     * @param ...args - other arguments
     */
    ( metadata: MetadataAfter<D>, value: any, ...args: T ): any;
}

/**
 * the interface of methods for catch exceptions for interceptors.
 */
export interface MethodException<T extends any[] = any[], D = any> {
    /**
     * @param e - the thrown error object
     * @param metadata - {@link MethodException}
     * @param ...args - other arguments
     */
    ( metadata: MetadataException<D>, e: any, ...args: T ): any;
}

export interface MethodFinally<T extends any[] = any[], D = any> {
    /**
     * @param metadata - {@link MetadataFinally}
     * @param ...args - rest arguments
     */
    ( metadata: MetadataFinally<D>, ...args: T ): any;
}

export interface MethodParameter<T extends any[] = any[], D = any> {
    /**
     * @param metadata - {@link MethodParameter}
     * @param ...args - other arguments
     */
    ( metadata: MixedMetadataParameter<D>, ...args: [ ...T, any? ] ): any;
}

export type Method<T extends any[] = any[], D = any> =
    | MethodAfter<T, D>
    | MethodBefore<T, D>
    | MethodParameter<T, D>
    | MethodException<T, D>
    | MethodFinally<T, D>;
