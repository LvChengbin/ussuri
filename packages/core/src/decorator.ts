/******************************************************************
 * Copyright (C) 2022 LvChengbin
 *
 * File: src/decorator.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 02/24/2022
 * Description:
 ******************************************************************/

import {
    saveMetadataAfter,
    saveMetadataBefore,
    saveMetadataParameter,
    saveMetadataException,
    saveMetadataFinally
} from '@ussuri/method-interceptor';
import {
    Pipe, PipeDecoratorData,
    ExceptionMetadata, PipeMetadata,
    InputMethod, OutputMethod, ParameterMethod, ExceptionMethod, FinallyMethod,
    InputPipeMethod, OutputPipeMethod, ParameterPipeMethod, ExceptionPipeMethod, FinallyPipeMethod
} from './interfaces';
import { isPipeTransformConstructor, defineInjectablePipeMetadata } from './pipe';
import { Application } from './application';

export interface CreateDecoratorOptions<
    C = any,
    A extends Application<C> = Application<C>,
    T = any
> {
    input?: [ InputMethod<C, A, T>, Record<'data', T>? ];
    output?: [ OutputMethod<C, A, T>, Record<'data', T>? ];
    parameter?: [ ParameterMethod<C, A, T>, Record<'data', T>? ];
    exception?: [ ExceptionMethod<C, A, T>, Pick<ExceptionMetadata<T>, 'data' | 'exceptionType'>? ];
    finally?: [ FinallyMethod<C, A, T>, Record<'data', T>? ];
}

/**
 * Typescript should inference the generic type C, A, and T, but it throws some error if the given function is a generic function, so add default value of each type.
 *
 * https://stackoverflow.com/questions/71813397/how-to-resolve-the-question-of-typescript-generic-function
 */
export function createDecorator<
    C = any,
    A extends Application<C> = Application<C>,
    T = any
>( options: CreateDecoratorOptions<C, A, T> ): ClassDecorator & MethodDecorator & ParameterDecorator {
    return ( target: Object, key?: string | symbol, indexOrDescriptor?: PropertyDescriptor | number ): void => {

        if( typeof indexOrDescriptor === 'number' ) {
            if( options.parameter ) {
                saveMetadataParameter<[ C, A ], T>( target, key as string, indexOrDescriptor, ...options.parameter );
            }
            return;
        }

        if( options.input ) {
            saveMetadataBefore<[ C, A ], T>( indexOrDescriptor ?? target, ...options.input );
        }

        if( options.output ) {
            saveMetadataAfter<[ C, A ], T>( indexOrDescriptor ?? target, ...options.output );
        }

        if( options.exception ) {
            saveMetadataException<[ C, A ], T>( indexOrDescriptor ?? target, ...options.exception );
        }

        if( options.finally ) {
            saveMetadataFinally<[ C, A ], T>( indexOrDescriptor ?? target, ...options.finally );
        }
    };
}

export function createInputDecorator<
    C = any,
    A extends Application<C> = Application<C>,
    T = any
>( ...args: NonNullable<CreateDecoratorOptions<C, A, T>[ 'input' ]> ): ClassDecorator & MethodDecorator {
    return createDecorator<C, A, T>( { input : args } );
}

export function createOutputDecorator<
    C = any,
    A extends Application<C> = Application<C>,
    T = any
>( ...args: [ OutputMethod<C, A, T>, Record<'data', T>? ] ): ClassDecorator & MethodDecorator {
    return createDecorator<C, A, T>( { output : args } );
}

export function createParameterDecorator<
    C = any,
    A extends Application<C> = Application<C>,
    T = any
>( ...args: NonNullable<CreateDecoratorOptions<C, A, T>[ 'parameter' ]> ): ParameterDecorator {
    return createDecorator<C, A, T>( { parameter : args } );
}

export function createExceptionDecorator<
    C = any,
    A extends Application<C> = Application<C>,
    T = any
>( ...args: NonNullable<CreateDecoratorOptions<C, A, T>[ 'exception' ]> ): ClassDecorator & MethodDecorator {
    return createDecorator<C, A, T>( { exception : args } );
}

export function createFinallyDecorator<
    C = any,
    A extends Application<C> = Application<C>,
    T = any
>( ...args: NonNullable<CreateDecoratorOptions<C, A, T>[ 'finally' ]> ): ClassDecorator & MethodDecorator {
    return createDecorator<C, A, T>( { finally : args } );
}

export interface CreatePipeDecoratorOptions<
    C = any,
    A extends Application<C> = any,
    M extends PipeMetadata = any
>{
    input?: InputPipeMethod<C, A, M>;
    output?: OutputPipeMethod<C, A, M>;
    parameter?: ParameterPipeMethod<C, A, M>;
    exception?: ExceptionPipeMethod<C, A, M>;
    exceptionOptions?: Pick<ExceptionMetadata, 'exceptionType'>;
    finally?: FinallyPipeMethod<C, A, M>;
    decoratorCallback?: ClassDecorator & MethodDecorator & ParameterDecorator;
}

/**
 * @example
 *
 * ```ts
 * const Decorator = createPipeDecorator( {
 *     // ...
 * }, 'propertyName', PipeOne, PipeTwo );
 * ```
 */
export function createPipeDecorator<
    C = any,
    A extends Application<C> = any,
    M extends PipeMetadata = any
>(
    options: CreatePipeDecoratorOptions<C, A, M>,
    propertyOrPipe?: PipeDecoratorData[ 'property' ] | Pipe<C, A>,
    ...pipes: Pipe<C, A, M>[]
): ClassDecorator & MethodDecorator & ParameterDecorator {

    const t = typeof propertyOrPipe;

    let property: PipeDecoratorData[ 'property' ];

    // if( t === 'string' || t === 'symbol' ) property = propertyOrPipe as PipeDecoratorData[ 'property' ];
    if( t && t !== 'function' ) property = propertyOrPipe as PipeDecoratorData[ 'property' ];
    else if( t === 'function' ) pipes = [ propertyOrPipe as Pipe<C, A, M>, ...pipes ];

    const data: PipeDecoratorData<C, A, M> = { property, pipes };

    return ( target: any, key?: string | symbol, indexOrDescriptor?: PropertyDescriptor | number ): void => {
        /**
         * Save injectable pipe metadata with constructor instead of prototype
         */
        defineInjectablePipeMetadata(
            key ? target.constructor : target,
            pipes.filter( isPipeTransformConstructor )
        );

        if( typeof indexOrDescriptor === 'number' ) {

            options.parameter && saveMetadataParameter(
                target,
                key as string,
                indexOrDescriptor,
                options.parameter as ParameterMethod,
                { data }
            );

        } else {

            options.input && saveMetadataBefore(
                indexOrDescriptor ?? target,
                options.input as InputMethod,
                { data }
            );

            options.output && saveMetadataAfter(
                indexOrDescriptor ?? target,
                options.output as OutputMethod,
                { data }
            );

            options.exception && saveMetadataException(
                indexOrDescriptor ?? target,
                options.exception as ExceptionMethod,
                { ...options.exceptionOptions, data }
            );

            options.finally && saveMetadataFinally(
                indexOrDescriptor ?? target,
                options.finally as FinallyMethod,
                { data }
            );
        }

        if( options.decoratorCallback ) {
            const args: any[] = [ target ];
            key && args.push( key );
            indexOrDescriptor !== undefined && args.push( indexOrDescriptor );
            options.decoratorCallback( ...args as [ any ] );
        }
    };
}
