/******************************************************************
 * Copyright (C) 2021 LvChengbin
 *
 * File: src/router.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 01/31/2021
 * Description:
 ******************************************************************/

import { LRUCache } from 'lru-cache';
import { ControllerClass } from '@ussuri/core';
import { Context } from './context';
import { joinPattern } from './utils/join-pattern';
import { patternCombinations } from './utils/pattern-combinations';

const join = joinPattern();

type Shift<T extends unknown[]> = T extends [ _: unknown, ...args: infer U ] ? U : [];

export type Pattern = string | RegExp | ( string | RegExp )[];

export interface InternalRouteMap {
    controller: ControllerClass;
    action: string | symbol;
}

export interface ForwardRouteMap {
    module: string;
    path?: string;
}

export type RouteMap =
    | InternalRouteMap
    | ForwardRouteMap;

export interface RouterHandler<T extends Context = Context> {
    ( ctx: T, params: Record<string, string>, matches: string[] ): RouteMap | string | T | Promise<RouteMap | string | T> | void;
}

/**
 * Descript routing rules.
 *
 * @example
 *
 * ```ts
 * [ 'GET', '/user/account/:id', { controller : UserController, action : 'account' } ]
 * [ 'GET', [ '/user/account/:id' ], 'user.profile' ]
 * [ 'GET', [ [ '/user', 'account/:id' ] ], 'user.profile' ]
 * ```
 */
export type RouterRule<T extends Context = Context> = [
    methods: string | string[],
    pattern: Pattern | ( string | RegExp | Pattern )[],
    dest: RouterHandler<T> | RouteMap | string
];

export interface MatchResult {
    params: Record<string | number, string>;
    matches: string[];
}

export interface Matches<T extends Context = Context> extends MatchResult {
    rule: RouterRule<T>;
}

export class Router<T extends Context = Context> {

    static match(
        pattern: RegExp,
        path: string,
        keys: ( string | number )[]
    ): false | MatchResult {

        const matches = pattern.exec( path );

        if( !matches ) return false;

        const params: Record<string, string> = {};

        keys.forEach( ( key, i ): void => {
            matches[ i + 1 ] && ( params[ key ] = matches[ i + 1 ] );
        } );

        /**
         * path-to-regexp can resolve named groups in regexp, so we don't need to add them again.
         */
        // if( matches.groups ) {
        //     const { groups } = matches;

        //     for( const key of Object.keys( groups ) ) {
        //         groups[ key ] && ( params[ key ] = groups[ key ] );
        //     }
        // }

        return { params, matches };
    }

    static interpolate( uri: string, data: Record<string, any> ): string {
        if( !uri ) return uri;
        return uri.replace( /:([a-zA-Z_][a-zA-Z0-9_]*)/g, ( m: string, n: string ) => {
            const value = data[ n ];
            return value === null || value === undefined ? n : String( value );
        } );
    }

    rules: {
        rule: RouterRule<T>;
        keys: ( string | number )[];
        pattern: RegExp;
    }[] = [];

    #cache = new LRUCache<string, Matches<T> | false>( { max : 500 } );

    #push( rule: RouterRule<T> ): void {

        const [ , patterns ] = rule;

        if( !Array.isArray( patterns ) ) {
            const { pattern, keys } = join( patterns );
            this.rules.push( { rule, keys, pattern } );
            return;
        }

        /**
         * If patterns is an array, generate all combinations with patternCombinations function and push them into rules one by one.
         */
        const combinations = patternCombinations( ...patterns );

        for( const item of combinations ) {
            const { pattern, keys } = join( ...item );
            this.rules.push( { rule, keys, pattern } );
        }
    }

    get( ...args: Shift<RouterRule<T>> ): void {
        this.#push( [ 'GET', ...args ] );
    }

    post( ...args: Shift<RouterRule<T>> ): void {
        this.#push( [ 'POST', ...args ] );
    }

    put( ...args: Shift<RouterRule<T>> ): void {
        this.#push( [ 'PUT', ...args ] );
    }

    head( ...args: Shift<RouterRule<T>> ): void {
        this.#push( [ 'HEAD', ...args ] );
    }

    patch( ...args: Shift<RouterRule<T>> ): void {
        this.#push( [ 'PATCH', ...args ] );
    }

    delete( ...args: Shift<RouterRule<T>> ): void {
        this.#push( [ 'DELETE', ...args ] );
    }

    options( ...args: Shift<RouterRule<T>> ): void {
        this.#push( [ 'OPTIONS', ...args ] );
    }

    any( ...args: RouterRule<T> ): void {
        const [ methods, ...rest ] = args;

        /**
         * Uppercase the method(s) before appending in to the rules list, in order to avoid uppercasing the strings everytime in every request.
         */
        if( typeof methods === 'string' ) {
            this.#push( [ methods.toUpperCase(), ...rest ] );
            return;
        }

        this.#push( [ methods.map( m => m.toUpperCase() ), ...rest ] );
    }

    match( context: T ): Matches<T> | false {

        const { path, method } = context.request;
        const cacheKey = path + '\x0B' + method;

        const exists = this.#cache.get( cacheKey );
        if( exists !== undefined ) return exists;

        for( const item of this.rules ) {

            const { keys, pattern, rule } = item;
            const [ methods ] = rule;

            if( methods !== '*' ) {
                if( typeof methods === 'string' && methods !== method ) continue;
                if( Array.isArray( methods ) && !methods.includes( method ) ) continue;
            }

            const res = Router.match( pattern, path, keys );

            if( res === false ) continue;

            const args = res.matches.slice( 1 ); // .map( v => decodeURIComponent( v ) );

            const matches = {
                params : res.params,
                matches : args,
                rule
            };

            this.#cache.set( cacheKey, matches );

            return matches;
        }

        this.#cache.set( cacheKey, false );

        return false;
    }
}
