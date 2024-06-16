/******************************************************************
 * Copyright (C) 2022 LvChengbin
 *
 * File: src/utils.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 05/10/2022
 * Description:
 ******************************************************************/

import { RequestOptions } from './interfaces';

export function joinPath( ...pieces: string[] ): string {
    const path = pieces.map( x => x.replace( /^\/+|\/+$/g, '' ) ).join( '/' );
    if( !path.startsWith( '/' ) ) return '/' + path;
    return path;
}

const REQUET_METHODS_WITH_PAYLOAD = [ 'POST', 'PUT', 'PATCH' ];

export function isRequestWithPayload( method: string ): boolean {
    return REQUET_METHODS_WITH_PAYLOAD.includes( method.toUpperCase() );
}

export function isAbsoluteURL( url: string ): boolean {
    return /^([a-z][a-z\d+\-.]*:)?\/\//i.test( url );
}

export function buildURL( base: string | undefined, url: string ): string {
    if( !base && !url ) return '';
    if( !base || isAbsoluteURL( url ) ) return url;
    return base.replace( /\/+$/, '' ) + '/' + url.replace( /^\/+/, '' );
}

export function interpolateURL( url: string, data: Record<string, any> ): string {
    return url.replace( /:([a-zA-Z_][a-zA-Z0-9_]*)/g, ( m: string, n: string ) => {
        const value = data[ n ];
        if( typeof value === 'string' || typeof value === 'number' ) return String( value );
        // eslint-disable-next-line no-console
        console.warn( `Invalid url param ${value} for ${url}` );
        return '';
    } );
}

export function spreadFormData<T extends Record<string, any>>( formdata: T ): Record<string, any> {
    if( !( formdata instanceof FormData ) ) return formdata;
    const output: Record<string, any> = {};
    for( const [ key, value ] of formdata.entries() ) {
        output[ key ] = value;
    }
    return output;
}

export function mergeData( a: FormData, b: FormData | Record<string, any> ): FormData;
export function mergeData( a: FormData | Record<string, any>, b: FormData ): FormData;
export function mergeData<T1 extends Record<string, any>, T2 extends Record<string, any>>( a: T1, b: T2 ): T1 & T2;
export function mergeData( a: FormData | Record<string, any>, b: FormData | Record<string, any> ): FormData | Record<string, any> {

    const data = {
        ...spreadFormData( a ),
        ...spreadFormData( b )
    } as Record<string, any>;

    if( a instanceof FormData || b instanceof FormData ) {
        const formdata = new FormData();
        Object.keys( data ).forEach( ( key: string ) => {
            formdata.append( key, data[ key ] );
        } );
        return formdata;
    }

    return data;
}

export function mergeOptions( request: RequestOptions, base: RequestOptions ): RequestOptions {
    const headers = { ...base.headers, ...request.headers };
    const params = { ...base.params, ...request.params };
    const query = { ...base.query, ...request.query };
    const payload = mergeData( base.payload, request.payload );
    const data = mergeData( base.data, request.data );

    const url = buildURL(
        typeof base.service === 'string'
            ? buildURL( base.service, base.url ?? '' )
            : base.url,
        request.url ?? ''
    );

    return {
        ...base, ...request,
        headers, params, payload, data, query, url
    };
}

export function lowerCaseFirstLetter( str: string ): string {
    return str.charAt( 0 ).toLowerCase() + str.slice( 1 );
}
