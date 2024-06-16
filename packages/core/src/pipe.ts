/******************************************************************
 * Copyright (C) 2022 LvChengbin
 *
 * File: src/pipe.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 02/23/2022
 * Description:
 ******************************************************************/

import { Constructor } from 'type-fest';
import { Pipe, PipeFunction, PipeTransform, PipeTransformConstructor } from './interfaces';
import { INJECTABLE_PIPE_METADATA_KEY } from './constants';
import { Application } from './application';
import { Dataclass } from './dataclass';

export function defineInjectablePipeMetadata( target: Object, pipes: PipeTransformConstructor[] ): void {
    const exists = Reflect.getMetadata( INJECTABLE_PIPE_METADATA_KEY, target ) ?? [];
    Reflect.defineMetadata( INJECTABLE_PIPE_METADATA_KEY, [ ...exists, ...pipes ], target );
}

export function getInjectablePipeMetadata( target: Object, deduplicate = true ): PipeTransformConstructor[] {
    const pipes = Reflect.getMetadata( INJECTABLE_PIPE_METADATA_KEY, target );
    return deduplicate ? [ ...new Set( pipes ) ] : pipes;
}

export function isPipeTransformConstructor( pipe: any ): pipe is PipeTransformConstructor {
    return typeof pipe === 'function'
        && !Dataclass.isDataclass( pipe )
        && pipe.toString().startsWith( 'class' );
}

export async function call<C, A extends Application<C> = any, M = any>(
    pipe: Pipe | Constructor<any>,
    value: unknown,
    ...args: [ C?, A?, M? ]
): Promise<unknown> {
    if( typeof pipe === 'function' ) {

        if( isPipeTransformConstructor( pipe ) ) {
            if( args[ 1 ] === undefined ) {
                throw new Error( 'Cannot use PipeTransformConstructor if application is not provided.' );
            }
            /**
             * PipeTransform implementation
             */
            value = await args[ 1 ].injection.instantiate<PipeTransform<C, A, M>>( pipe ).transform( value, ...args );
        } else if( Dataclass.isDataclass( pipe ) ) {
            /**
             * Support using Dataclass in pipe list.
             */
            value = await Dataclass.create( pipe as Constructor<any>, value, ...args );
        } else {
            /**
             * PipeFunction
             */
            value = await ( pipe as PipeFunction<C, A, M> )( value, ...args );
        }
    } else if( 'transform' in pipe ) {
        value = await pipe.transform( value, ...args );
    }

    return value;
}

export async function chain<C, A extends Application<C> = any, M = any>( pipes: ( Pipe | Constructor<any> )[], value: unknown, ...args: [ C?, A?, M? ] ): Promise<any> {

    if( !pipes.length ) return value;

    let promise = Promise.resolve( value );

    for( const pipe of pipes ) {
        promise = promise.then( async ( val: unknown ) => call( pipe, val, ...args ) );
    }

    return promise;
}
