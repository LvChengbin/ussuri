/******************************************************************
 * Copyright (C) 2022 LvChengbin
 *
 * File: interfaces/metadata.interface.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 03/01/2022
 * Description:
 ******************************************************************/

import { Class } from 'type-fest';

/**
 * the base metadata interface for Interceptor
 */
export interface Metadata<T = any> {
    /**
     * the type of the interceptor method,
     * it should be defined in decorators and used to find out which interceptor method should be used.
     *
     * for example, the type named *auth* may be associated with a method for authorization in `before` intercetpors.
     */
    method: ( ...args: any[] ) => any;

    /**
     * the type of the interceptor
     * such as before, after, parameter and exception, etc.
     */
    interceptorType: string;

    /**
     * the data which will be saved with metadata
     */
    data?: T;
}

/**
 * metadata for class instance methods
 *
 * @example
 *
 * ```ts
 * const metadata: MetadataBefore = {
 *     method: () => {},
 *     interceptorType : 'before',
 *     data : {
 *         property : 'id'
 *     }
 * }
 * ```
 */
export interface MetadataBefore<T = any> extends Metadata<T> {
    interceptorType: 'before';
}

export interface MetadataAfter<T = any> extends Metadata<T> {
    interceptorType: 'after';
}

/**
 * metadata for exception interceptor of classes or class instance methods.
 *
 * @example
 *
 * ```ts
 * const metadata: MatadataException = {
 *     exceptionType: TypeError,
 *     interceptorType : 'exception',
 *     data : {
 *         property : 'id'
 *     }
 * }
 * ```
 */
export interface MetadataException<T = any> extends Metadata<T> {
    interceptorType: 'exception';
    /**
     * the type should be a constructor or undefined.
     * using `undefined` means the interceptor can handle all types of Error object.
     */
    exceptionType?: Class<any>;
}

export interface MetadataFinally<T = any> extends Metadata<T> {
    interceptorType: 'finally';
}

/**
 * method for parameters of class instance methods
 *
 * @remarks
 *
 * the typescript's `emitDecoratorMetadata` option should be set to true if you wanna use this feature.
 * {@link https://www.typescriptlang.org/docs/handbook/decorators.html#metadata}
 *
 * @example
 * ```ts
 * const metadata: MetadataParameter = {
 *     method : () => {},
 *     interceptorType : 'parameter',
 *     metadataType : 'UserDto',
 *     data : {
 *         property : 'id'
 *     }
 * }
 * ```
 */
export interface MetadataParameter<T = any> extends Metadata<T> {
    interceptorType: 'parameter';
    paramtype: any;
}

export interface DesignTypeMetadata {
    paramtype: any;
}

export type MixedMetadataParameter<T = any> =
    | MetadataParameter<T>
    | DesignTypeMetadata;
