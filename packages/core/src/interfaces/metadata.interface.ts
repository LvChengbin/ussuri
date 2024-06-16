/******************************************************************
 * Copyright (C) 2022 LvChengbin
 *
 * File: interfaces/metadata.interface.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 03/05/2022
 * Description:
 ******************************************************************/

import { SetRequired } from 'type-fest';
import { MetadataBefore, MetadataAfter, MetadataParameter, MetadataException, MetadataFinally, DesignTypeMetadata } from '@ussuri/method-interceptor';
import { Application } from '../application';
import { Pipe } from './pipe.interface';

export type InputMetadata<T = any> = MetadataBefore<T>;

export type OutputMetadata<T = any> = MetadataAfter<T>;

export type ParameterMetadata<T = any> = MetadataParameter<T>;

export type ExceptionMetadata<T = any> = MetadataException<T>;

export type FinallyMetadata<T = any> = MetadataFinally<T>;

export type Metadata<T = any> =
    | InputMetadata<T>
    | OutputMetadata<T>
    | ParameterMetadata<T>
    | ExceptionMetadata<T>
    | FinallyMetadata<T>;

export interface PipeDecoratorData<
    C = any,
    A extends Application<C> = any,
    M extends Metadata = any
> {
    property?: any;
    pipes: Pipe<C, A, M>[];
}

export type InputPipeMetadata<
    C = any,
    A extends Application<C> = any,
    M extends Metadata = any
> = SetRequired<InputMetadata<PipeDecoratorData<C, A, M>>, 'data'>;

export type OutputPipeMetadata<
    C = any,
    A extends Application<C> = any,
    M extends Metadata = any
> = SetRequired<OutputMetadata<PipeDecoratorData<C, A, M>>, 'data'>;

export type ParameterPipeMetadata<
    C = any,
    A extends Application<C> = any,
    M extends Metadata = any
> =
    & SetRequired<ParameterMetadata<PipeDecoratorData<C, A, M>>, 'data'>
    & DesignTypeMetadata;

export type ExceptionPipeMetadata<
    C = any,
    A extends Application<C> = any,
    M extends Metadata = any
> = SetRequired<ExceptionMetadata<PipeDecoratorData<C, A, M>>, 'data'>;

export type FinallyPipeMetadata<
    C = any,
    A extends Application<C> = any,
    M extends Metadata = any
> = SetRequired<FinallyMetadata<PipeDecoratorData<C, A, M>>, 'data'>;

/**
 * While using `PipeMetadata` means the `MixedMetadataParameter` has both `MetadataParameter` and `DesignTypeMetadata`
 */
export type PipeMetadata<
    C = any,
    A extends Application<C> = any,
    M extends Metadata = any
> =
    | InputPipeMetadata<C, A, M>
    | OutputPipeMetadata<C, A, M>
    | ParameterPipeMetadata<C, A, M>
    | ExceptionPipeMetadata<C, A, M>
    | FinallyPipeMetadata<C, A, M>;
