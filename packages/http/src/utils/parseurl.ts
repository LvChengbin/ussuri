/******************************************************************
 * Copyright (C) 2021 LvChengbin
 *
 * File: util/parseurl.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 02/09/2021
 * Description:
 ******************************************************************/

import { parse, UrlWithStringQuery } from 'node:url';
import { LRUCache } from 'lru-cache';

const cache = new LRUCache<string, UrlWithStringQuery>( { max : 10000 } );

/**
 * fastparse function being used in Koa
 * https://github.com/pillarjs/parseurl/blob/master/index.js
 */
function fastparse( str: string ): UrlWithStringQuery {
    /**
     * if the given url doesn't start with a slash (/)
     */
    if( str.charCodeAt( 0 ) !== 0x2f ) return parse( str );

    let pathname = str;
    let query: string | null = null;
    let search: string | null = null;

    // This takes the regexp from https://github.com/joyent/node/pull/7878
    // Which is /^(\/[^?#\s]*)(\?[^#\s]*)?$/
    // And unrolls it into a for loop
    for( let i = 1; i < str.length; i++ ) {
        switch( str.charCodeAt( i ) ) {
            case 0x3f : /* ?  */
                if( search === null ) {
                    pathname = str.substring( 0, i );
                    query = str.substring( i + 1 );
                    search = str.substring( i );
                }
                break;
            case 0x09 : /* \t */
            case 0x0a : /* \n */
            case 0x0c : /* \f */
            case 0x0d : /* \r */
            case 0x20 : /*    */
            case 0x23 : /* #  */
            /**
             * Nodejs fixed an issue of url.parse() method
             * https://github.com/nodejs/node/issues/42231
             */
            case 0x40 : /* @  */ // eslint-disable-line no-fallthrough
            case 0xa0 :
            case 0xfeff :
                return parse( str );
        }
    }

    const url = parse( '' );

    url.path = str;
    url.href = str;
    url.pathname = pathname;

    if( search !== null ) {
        url.query = query;
        url.search = search;
    }

    return url;
}

export function parseurl( url: string ): UrlWithStringQuery {
    let parsed = cache.get( url );

    if( !parsed ) {
        parsed = fastparse( url );
        cache.set( url, parsed );
    }
    return { ...parsed };
}
