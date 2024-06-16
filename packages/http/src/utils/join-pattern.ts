/******************************************************************
 * Copyright (C) 2022 LvChengbin
 *
 * File: utils/join-pattern.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 03/14/2022
 * Description:
 ******************************************************************/

import { pathToRegexp, Key } from 'path-to-regexp';
import { escapeRegexp as escape } from './escape-regexp';

interface JoinPatternResult {
    pattern: RegExp;
    keys: ( string | number )[];
}

interface JoinPatternFunction {
    ( ...args: ( string | RegExp )[] ): JoinPatternResult;
}

export interface JoinPatternOptions {
    start?: string;
    end?: string;
    delimiter?: string;
    separator?: string;
}

export function joinPattern( options: JoinPatternOptions = {} ): JoinPatternFunction {

    const { start = '/', delimiter = '/#?', separator = '/' } = options;

    const trimStartRe = new RegExp( `^${escape( escape( start ) )}` );

    /**
     * create regexp segment like `[\/#?]`.
     */
    const delimiterReSeg = '[' + escape( delimiter ?? '/#?' ) + ']';
    const separatorReSeg = escape( separator );

    const trimPathPatternRe = new RegExp( `(^${separatorReSeg}+)|(${separatorReSeg}+$)`, 'g' );

    /**
     * Remove characters in delimiter of path pattern
     *
     * `/account/:id` -> `account/:id`
     */
    const trimPathPattern = ( str: string ): string => str.replace( trimPathPatternRe, '' );

    const trimReSourceRe = new RegExp( `(^\\^)|((?:${escape( delimiterReSeg )}\\?)\\$?$)`, 'g' );

    const trimReSource = ( s: string ): string => s.replace( trimReSourceRe, '' );

    return ( ...patterns: ( string | RegExp )[] ): JoinPatternResult => {

        const flags: string[] = [];
        const sources: string[] = [];
        const keys: Key[] = [];

        patterns.forEach( ( pattern: string | RegExp ) => {

            const k: Key[] = [];

            if( typeof pattern === 'string' ) {
                pattern = pathToRegexp( trimPathPattern( pattern ), k, { delimiter } );
            } else {
                /**
                 * path-to-regex can collect named group in regexp
                 */
                pattern = pathToRegexp( pattern, k, { delimiter } );
            }

            keys.push( ...k );

            const trimedSource = trimReSource( ( pattern as RegExp ).source );

            if( trimedSource.length ) {
                sources.push( trimedSource );
                flags.push( ...( pattern as RegExp ).flags ?? '' );
            }

        } );

        const source = sources.join( separator ).replace( trimStartRe, '' );

        return {
            pattern : new RegExp(
                `^${start}${source}${ source ? delimiterReSeg : '' }?$`,
                [ ...new Set( flags ) ].join( '' )
            ),
            keys : keys.map( ( key: Key ) => key.name )
        };
    };
}
