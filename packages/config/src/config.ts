/******************************************************************
 * Copyright (C) 2021 LvChengbin
 *
 * File: src/config.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 10/14/2021
 * Description:
 ******************************************************************/

import { Path, Value } from './types';

const { hasOwn } = Object;

type URI =
    | `http://${string}`
    | `https://${string}`
    | `/${string}`
    | `./${string}`
    | `../${string}`;

export type ConfigOptions<T = any> =
    | URI
    | T ;

/**
 * @example
 *
 * new Ussuri( {
 *     configs : [
 *         '*.yaml',
 *         new Config( )
 *     ]
 * } );
 */
export class Config<T = any> {

    #config: T;


    constructor( options: T ) {
        this.#config = options;
        // if( typeof options !== 'string' ) {
        //     this.#config = options;
        // } else {
        //     // @todo
        // }
    }

    get(): T;
    get<R = any>( path: Path<T> ): R;
    get<K extends Path<T>, R = Value<T, K>>( path: K, defaultValue: R ): R;
    get<R = any>( path?: Path<T>, defaultValue?: R ): T | R | undefined {

        if( path === undefined ) return this.#config;

        let tmp: any = this.#config;
        let key: string = path;
        let end = false;

        while( key ) {
            if( hasOwn( tmp, key ) ) {
                tmp = tmp[ key ];
                end = true;
            } else {
                const dot = key.indexOf( '.' );
                const end = dot === -1;
                const name = end ? key : key.slice( 0, dot );
                tmp = hasOwn( tmp, name ) ? tmp[ name ] : undefined;
                key = key.slice( dot + 1 );
            }

            if( tmp === undefined || end ) break;
            if( tmp === null || typeof tmp !== 'object' ) return tmp;
        }

        return tmp === undefined ? defaultValue ?? undefined : tmp;
    }
}
