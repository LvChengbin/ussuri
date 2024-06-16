/******************************************************************
 * Copyright (C) 2022-2023 NextSeason
 *
 * @File: src/router.ts
 *
 * This file is part of NextSeason projects.
 * Code in this file can not be copied and/or distributed without the
 * express permission of NextSeason. Inc
 ******************************************************************/

import { SetOptional } from 'type-fest';
import { LRUCache } from 'lru-cache';
import { Application } from './application';
import { ControllerClass } from './interfaces';
import { joinPattern, patternCombinations } from './utils';
import { DEFAULT_ROUTING_GROUP_NAME, MODULE_ROUTING_GROUP_NAME } from './constants';

const join = joinPattern();

export type RouterPatternItem = string | RegExp | ( string | RegExp )[];

export type RouterPattern =
    | RouterPatternItem
    | ( string | RegExp | RouterPatternItem )[];

export interface InternalRouteMap {
    controller: ControllerClass;
    action: string | symbol;
}

export interface RouteRule {
    group: string | symbol;
    namespace?: string;
    path: string;
}

export interface ForwardRouteMap {
    module: string;
    path?: string;
}

export type RouteMap =
    | InternalRouteMap
    | ForwardRouteMap;

export type RouteMapWithRule =
    & RouteMap
    & {
        routeRule: RouteRule;
    };

export interface RouterHandler<T = any> {
    ( ctx: T, params: Record<string, string>, matches: string[] ): RouteMap | string | T | Promise<RouteMap | string | T> | void;
}

export interface RouterRule<T = any> {
    group: string | symbol;
    namespace?: string | string[] | ( ( ns: string ) => boolean );
    pattern: RouterPattern;
    dest?: RouterHandler<T> | RouteMap | string;
    handle?<T>( application: Application, context: T, route: RouteMap, matches: RouteMatches<T> ): any;
}

export interface MatchResult {
    params: Record<string | number, string>;
    matches: string[];
}

export interface RouteMatches<T = any> extends MatchResult {
    rule: RouterRule<T>;
}

export class Router<T = any> {

    static match( pattern: RegExp,
        path: string,
        keys: ( string | number )[]
    ): false | MatchResult {
        const matches = pattern.exec( path );
        if( !matches ) return false;

        const params: Record<string, string> = {};

        keys.forEach( ( key, i ): void => {
            matches[ i + 1 ] && ( params[ key ] = matches[ i + 1 ] );
        } );

        return { params, matches };
    }

    static interpolate( uri: string, data: Record<string, any> ): string {
        if( !uri ) return uri;
        return uri.replace( /:([a-zA-Z_][a-zA-Z0-9_]*)/g, ( m: string, n: string ) => {
            const value = data[ n ];
            return value === null || value === undefined ? n : String( value );
        } );
    }

    rules: Record<string | symbol, {
        rule: RouterRule<T>;
        keys: ( string | number )[];
        pattern: RegExp;
    }[]> = {};

    #cache = new LRUCache<string, RouteMatches<T> | false>( { max : 500 } );

    constructor( rules?: SetOptional<RouterRule<T>, 'group'>[] ) {
        if( rules?.length ) {
            this.add( ...rules );
        }
    }

    add( ...rules: SetOptional<RouterRule<T>, 'group'>[] ): this {
        rules.forEach( rule => {
            const { group = DEFAULT_ROUTING_GROUP_NAME, pattern : patterns } = rule;

            const list = this.rules[ group ] ?? [];

            if( !Array.isArray( patterns ) ) {
                const { pattern, keys } = join( patterns );
                list.push( {
                    rule : { group, ...rule },
                    keys, pattern
                } );
            } else {

                /**
                 * If `patterns` is an array, generate all combination with array items and push them into rules in order.
                 */
                const combinations = patternCombinations( ...patterns );

                for( const item of combinations ) {
                    const { pattern, keys } = join( ...item );
                    list.push( {
                        rule : { group, ...rule },
                        keys, pattern
                    } );
                }
            }

            this.rules[ group ] = list;
        } );
        return this;
    }

    match( rule: SetOptional<RouteRule, 'group'> ): RouteMatches<T> | false {

        const {
            namespace, path,
            group = DEFAULT_ROUTING_GROUP_NAME
        } = rule;
        const cacheKey = [ String( group ), namespace ?? '', path ].join( '\x0B' );

        const exists = this.#cache.get( cacheKey );
        if( exists !== undefined ) return exists;

        const rules = [
            ...this.rules[ group ] ?? [],
            /**
             * Try matching router rules added by sub module
             */
            ...this.rules[ MODULE_ROUTING_GROUP_NAME ] ?? []
        ];

        for( const item of rules ) {
            const { keys, pattern, rule } = item;
            const { namespace : ns } = rule;

            if( ns !== '*' && namespace ) {
                if( Array.isArray( ns ) && !ns.includes( namespace ) ) continue;
                if( ns !== namespace ) continue;
            }

            const res = Router.match( pattern, path, keys );

            if( res === false ) continue;

            const args = res.matches.slice( 1 );
            const matches = {
                params : res.params,
                matches : args,
                rule
            };

            this.#cache.set( cacheKey, matches );

            return matches;
        }

        return false;
    }
}
