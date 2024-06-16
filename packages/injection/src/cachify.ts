/******************************************************************
 * Copyright (C) 2022 LvChengbin
 *
 * File: injection/cachify.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 02/10/2022
 * Description:
 ******************************************************************/

interface Executor {
    ( ...args: any[] ): any;
}

export interface CachifyOptions<T extends Executor, K = Parameters<T>[ 0 ]> {
    executor: T;
    keyGenerator?: ( ...args: Parameters<T> ) => K;
}

/**
 * @example
 *
 * ```ts
 * new Cachify<[ Key ]>( {
 *     executer( [ key ]: [ Key ] ) {
 *     },
 *     keyGenerator( [ key ]: [ Key ] ) {
 *     }
 * } )
 * ```
 */
export class Cachify<T extends Executor, K = Parameters<T>[ 0 ]> {

    executor: T;

    cache = new Map<K, ReturnType<T>>();

    constructor( options: CachifyOptions<T> ) {
        this.executor = options.executor;
        options.keyGenerator && ( this.keyGenerator = options.keyGenerator );
    }

    keyGenerator = ( ...args: Parameters<T> ): Parameters<T>[ 0 ] => args[ 0 ];

    get( ...args: Parameters<T> ): ReturnType<T> | null {
        const key = this.keyGenerator( ...args );
        const cached = this.cache.get( key );
        if( cached ) return cached;
        const value = this.executor( ...args );
        this.cache.set( key, value );
        return value;
    }
}
