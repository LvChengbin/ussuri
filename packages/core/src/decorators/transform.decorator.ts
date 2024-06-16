/******************************************************************
 * Copyright (C) 2022 LvChengbin
 *
 * File: decorators/transform.decorator.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 06/08/2022
 * Description:
 ******************************************************************/

import { Constructor } from 'type-fest';
import { createPipeDecorator } from '../decorator';
import { Pipe, OutputPipeMetadata } from '../interfaces';
import { chain } from '../pipe';
import { Application } from '../application';

function escapeRegexp( s: string ): string {
    return s.replace( /[/|\\{}()[\]^$+*?.]/g, '\\$&' ).replace( /-/g, '\\x2d' );
}

function isPromise( x: unknown ): x is Promise<any> {
    return typeof x === 'object' && typeof ( x as Promise<any> ).then === 'function';
}

function matchPath( path: string, match: string ): boolean {
    if( !match.includes( '[]' ) ) return path === match;
    const reg = new RegExp( escapeRegexp( match ).replace( /\\\[\\\]/g, '\\[[^\\]]+\\]' ) );
    return reg.test( path );
}

function isIntStr( x: string ): boolean {
    return /^[\d]+$/.test( x );
}

interface TransformOptions<T> {
    prefix?: string;
    transformer: ( value: any ) => Promise<T>;
}

const toString = ( {} ).toString;

const isArray = Array.isArray;
const isObject = ( data: unknown ): data is object => {
    return toString.call( data ) === '[object Object]';
};

async function transform<R = any, T = any>( data: T, path: string, options: TransformOptions<R> ): Promise<T | R> {

    const promises: Promise<any>[] = [];
    const { transformer } = options;

    if( !data || typeof data !== 'object' ) return data;

    let child: any;

    if( isArray( data ) ) {
        child = [];
    } else if( isObject( data ) ) {
        const prototype = Object.getPrototypeOf( data );
        child = Object.create( prototype );
    } else {
        child = data;
    }

    for( const prop in data ) {

        const attrs = Object.getOwnPropertyDescriptor( data, prop );

        if( attrs ) {
            const isIndex = isIntStr( prop );
            const prefix = options.prefix
                ? isIndex ? `${options.prefix}[${prop}]` : `${options.prefix}.${prop}`
                : isIndex ? `[${prop}]` : prop;

            if( matchPath( prefix, path ?? '' ) ) {
                const res = transformer( data[ prop ] );

                if( isPromise( res ) ) {
                    const promise = res.then( v => { child[ prop ] = v } );
                    promises.push( promise );
                } else {
                    child[ prop ] = res;
                }
            } else {
                const promise = transform( data[ prop ], path, { ...options, prefix } );
                promise.then( v => { child[ prop ] = v } );
                promises.push( promise );
            }
        }
    }

    await Promise.all( promises );

    return child;
}


type PipeOrDataclass = Pipe | Constructor<any>;

async function fn( metadata: OutputPipeMetadata, value: any, context: any, application: Application ): Promise<unknown> {
    const { data } = metadata;
    const { property } = data;

    if( !property ) {
        return chain( data.pipes, value, context, application, metadata );
    }

    return transform( value, property.replace( /\[\s*([^\]\s]*)\s*\]/g, '[$1]' ), {
        async transformer( val: any ): Promise<any> {
            return chain( data.pipes, val, context, application, metadata );
        }
    } );
}

/**
 * Transform specified property response data with pipes or dataclasses.
 *
 * @example
 *
 * ```ts
 * @Transform( 'data.name', EncryptPipe )
 * @Transform( 'data', SomeDataclass, Pipe )
 * ```
 */
export function Transform(
    path: string, ...pipes: PipeOrDataclass[]
): MethodDecorator & ClassDecorator;

export function Transform(
    ...pipes: PipeOrDataclass[]
): MethodDecorator & ClassDecorator;

export function Transform(
    ...args: [ string | PipeOrDataclass, ...PipeOrDataclass[] ]
): MethodDecorator & ClassDecorator {
    return createPipeDecorator( { output : fn }, ...args );
}
