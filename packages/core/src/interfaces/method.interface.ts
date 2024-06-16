/******************************************************************
 * Copyright (C) 2022 LvChengbin
 *
 * File: interfaces/method.interface.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 03/05/2022
 * Description:
 ******************************************************************/

import { SetRequired } from 'type-fest';
import {
    MethodBefore,
    MethodAfter,
    MethodParameter,
    MethodException,
    MethodFinally,
    DesignTypeMetadata
} from '@ussuri/method-interceptor';
import { Application } from '../application';
import {
    Metadata,
    PipeMetadata,
    InputMetadata,
    OutputMetadata,
    ParameterMetadata,
    ExceptionMetadata,
    FinallyMetadata,
    PipeDecoratorData as Data
} from './metadata.interface';

export type InputMethod<
    C = any,
    A extends Application<C> = Application<C>,
    T = any
> = MethodBefore<[ C, A ], T>;

export type OutputMethod<
    C = any,
    A extends Application<C> = Application<C>,
    T = any
> = MethodAfter<[ C, A ], T>;

export type ParameterMethod<
    C = any,
    A extends Application<C> = Application<C>,
    T = any
> = MethodParameter<[ C, A ], T>;

export type ExceptionMethod<
    C = any,
    A extends Application<C> = Application<C>,
    T = any
> = MethodException<[ C, A ], T>;

export type FinallyMethod<
    C = any,
    A extends Application<C> = Application<C>,
    T = any
> = MethodFinally<[ C, A ], T>;

type WithData<T extends Metadata> = SetRequired<T, 'data'>;

export interface InputPipeMethod<
    C = any,
    A extends Application<C> = any,
    M extends PipeMetadata = any
> {
    ( metadata: WithData<InputMetadata<Data<C, A, M>>>, ...args: [ C, A, any? ] ): unknown;
}

export interface OutputPipeMethod<
    C = any,
    A extends Application<C> = any,
    M extends PipeMetadata = any
> {
    ( metadata: WithData<OutputMetadata<Data<C, A, M>>>, value: unknown, ...args: [ C, A, any? ] ): unknown;
}

export interface ParameterPipeMethod<
    C = any,
    A extends Application<C> = any,
    M extends PipeMetadata = any
> {
    ( metadata: WithData<ParameterMetadata<Data<C, A, M>>> & DesignTypeMetadata, ...args: [ C, A, any? ] ): unknown;
}

export interface ExceptionPipeMethod<
    C = any,
    A extends Application<C> = any,
    M extends PipeMetadata = any
> {
    ( metadata: WithData<ExceptionMetadata<Data<C, A, M>>>, e: unknown, ...args: [ C, A, any? ] ): unknown;
}

export interface FinallyPipeMethod<
    C = any,
    A extends Application<C> = any,
    M extends PipeMetadata = any
> {
    ( metadata: WithData<FinallyMetadata<Data<C, A, M>>>, ...args: [ C, A, any? ] ): unknown;
}
