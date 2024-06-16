/******************************************************************
 * Copyright (C) 2021 LvChengbin
 *
 * File: src/response.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 02/09/2021
 * Description:
 ******************************************************************/

import util from 'node:util';
import assert from 'node:assert';
import Stream from 'node:stream';
import { Socket } from 'node:net';
import { extname } from 'node:path';
import { ServerResponse, OutgoingHttpHeaders } from 'node:http';
import { serialize as cookieSerialize, CookieSerializeOptions } from 'cookie';
import { is } from 'type-is';
import statuses from 'statuses';
import encodeurl from 'encodeurl';
import escapehtml from 'escape-html';
import { append as appendVaryHeader } from 'vary';
import contentDisposition, { Options as ContentDispositionOptions } from 'content-disposition';
import { ValueOf } from 'type-fest';
import { Context } from './context';
import getType from './utils/cache-content-type';

export interface ResponseOptions {
    context: Context;
    res?: ServerResponse;
    headers?: OutgoingHttpHeaders;
    statusCode?: number;
    statusText?: string;
}

export class Response {

    #headers: Map<string, ValueOf<OutgoingHttpHeaders>> = new Map();
    #body: unknown = null;

    explicit_status = false;

    context: Context;
    statusCode!: number;
    statusText!: string;

    res?: ServerResponse;

    constructor( options: Readonly<ResponseOptions> ) {
        const { res } = options;
        this.context = options.context;

        if( res ) {
            this.res = options.res;
            this.headers = res.getHeaders();
            this.status = res.statusCode;
            res.statusMessage && ( this.statusText = res.statusMessage );
        } else {
            options.headers && Object.keys( options.headers ).forEach( ( name: string ) => {
                this.set( name, ( options.headers as OutgoingHttpHeaders )[ name ] );
            } );

            options.statusCode && ( this.status = options.statusCode );

            this.statusText = options.statusText === undefined ? ( statuses.message[ this.status ] ?? '' ) : options.statusText;
        }

        /**
         * reset the explicit status to false
         */
        this.explicit_status = false;

    }

    /**
     * Return the request socket, return null if the native res object is not existing.
     * https://github.com/koajs/koa/blob/f8b49b859363ad6c3d9ea5c11ee62341407ceafd/lib/response.js#L29
     */
    get socket(): Socket | null {
        return this.res?.socket ?? null;
    }

    /**
     * Return response header
     * https://github.com/koajs/koa/blob/f8b49b859363ad6c3d9ea5c11ee62341407ceafd/lib/response.js#L54
     */
    get headers(): OutgoingHttpHeaders {
        return Object.fromEntries( this.#headers );
    }

    /**
     * Overwrite all response headers, all `field`s will be converted to lowercase.
     */
    set headers( headers: OutgoingHttpHeaders ) {
        this.#headers.clear();
        Object.keys( headers ).forEach( ( name: string ) => {
            this.set( name, headers[ name ] );
        } );
    }

    /**
     * Get response status code
     * https://github.com/koajs/koa/blob/f8b49b859363ad6c3d9ea5c11ee62341407ceafd/lib/response.js#L65
     */
    get status(): number {
        return this.statusCode;
    }

    /**
     * Set response status code
     * https://github.com/koajs/koa/blob/f8b49b859363ad6c3d9ea5c11ee62341407ceafd/lib/response.js#L76
     */
    set status( code: number ) {
        if( this.headerSent ) return;
        assert( Number.isInteger( code ), 'status code must be an integer' );
        assert( code >= 100 && code < 999, `incalid status code: ${code}` );
        this.explicit_status = true;
        this.statusCode = code;
        /**
         * statusText is not supported in HTTP/2
         * https://nodejs.org/api/http2.html#http2_response_statusmessage
         */
        this.statusText = statuses.message[ code ] ?? '';
        if( this.body && statuses.empty[ code ] ) this.body = null;
    }

    /**
     * Get response status message
     * https://github.com/koajs/koa/blob/f8b49b859363ad6c3d9ea5c11ee62341407ceafd/lib/response.js#L94
     */
    get message(): string {
        return this.statusText;
    }

    /**
     * Set response status message
     * https://github.com/koajs/koa/blob/f8b49b859363ad6c3d9ea5c11ee62341407ceafd/lib/response.js#L105
     */
    set message( msg: string ) {
        this.statusText = msg;
    }

    /**
     * Get response body
     * https://github.com/koajs/koa/blob/f8b49b859363ad6c3d9ea5c11ee62341407ceafd/lib/response.js#L116
     */
    get body(): unknown {
        return this.#body;
    }

    /**
     * Set response body
     * https://github.com/koajs/koa/blob/698ce0afbfac6480400625729a4b8fc4b4203fdc/lib/response.js#L127
     */
    set body( val: unknown ) {
        /**
         * If the request method is HEAD, just set headers without
         * adding body content.
         */
        if( this.context.request.method !== 'HEAD' ) {
            this.#body = val;
        }

        const setType = !this.has( 'Content-Type' );

        // no content
        if( val === null || val === undefined ) {
            if( !statuses.empty[ this.status ] ) this.status = 204;
            // this.explicit_null_body = true;
            setType && this.remove( 'Content-Type' );
            this.remove( 'Transfer-Encoding' );
            this.length = 0;
            return;
        }

        if( !this.explicit_status ) this.status = 200;

        if( typeof val === 'string' ) {
            if( setType ) this.type = /^\s*</.test( val ) ? 'html' : 'text';
            this.length = Buffer.byteLength( val );
            return;
        }

        if( Buffer.isBuffer( val ) ) {
            if( setType ) this.type = 'bin';
            this.length = val.length;
            return;
        }

        if( val instanceof Stream ) {
            // if( original != val ) {
            //     // val.once( 'error', err => this.context.onerror( err ) );
            //     if( original !== null ) this.remove( 'Content-Length' );
            // }

            if( setType ) this.type = 'bin';
            return;
        }

        // this.remove( 'Content-Length' );
        setType && ( this.type = 'json' );
        /**
         * I prefer to remove calculating the Content-Length here,
         * cus most of time while calling this application as NPS,
         * we don't need to stingify the respond body and Content-Length
         * will not be used.
         * I will try to redesign this later, maybe with adding a NPS mode.
         */
        this.length = Buffer.byteLength( JSON.stringify( val ) );
    }

    /**
     * Set Content-Length field to n
     * https://github.com/koajs/koa/blob/698ce0afbfac6480400625729a4b8fc4b4203fdc/lib/response.js#L186
     */
    set length( n: number | undefined ) {
        this.set( 'Content-Length', n );
    }

    /**
     * Return parsed response Content-Length when present.
     * https://github.com/koajs/koa/blob/698ce0afbfac6480400625729a4b8fc4b4203fdc/lib/response.js#L197
     */
    get length(): number | undefined {
        if( this.has( 'Content-Length' ) ) {
            return parseInt( this.get( 'Content-Length' ) as string, 10 ) || 0;
        }
        const { body } = this;
        if( !body || body instanceof Stream ) return undefined;
        if( typeof body === 'string' ) return Buffer.byteLength( body );
        if( Buffer.isBuffer( body ) ) return body.length;
        return Buffer.byteLength( JSON.stringify( body ) );
    }

    /**
     * Check if a header has been written to the socket, return false is the native res object not exists.
     * https://github.com/koajs/koa/blob/698ce0afbfac6480400625729a4b8fc4b4203fdc/lib/response.js#L216
     */
    get headerSent(): boolean {
        return this.res?.headersSent ?? false;
    }

    /**
     * set cookie with `Set-Cookie` header in response
     *
     * @example
     *
     * ```ts
     * setCookie( name, value, options );
     * ```
     */
    setCookie( name: string, value: string, options?: CookieSerializeOptions ): void {
    // setCookie( ...args: Parameters<typeof cookieSerialize> ): void {
        const headers = this.get( 'Set-Cookie' ) || [];
        const cookies = Array.isArray( headers ) ? headers : [ headers ];

        for( let i = cookies.length - 1; i >= 0; i -= 1 ) {
            if( cookies[ i ].startsWith( name + '=' ) ) {
                cookies.splice( i, 1 );
            }
        }

        cookies.push( cookieSerialize( name, value, options ) );

        this.set( 'Set-Cookie', cookies );
    }

    /**
     * Vary on `field`
     * https://github.com/koajs/koa/blob/698ce0afbfac6480400625729a4b8fc4b4203fdc/lib/response.js#L234
     */
    vary( val: string | string[] ): void {
        if( this.headerSent ) return;
        const oldval = this.get( 'Vary' );
        const header = Array.isArray( val ) ? val.join( ', ' ) : String( val );

        if( !oldval ) {
            this.set( 'Vary', header );
            return;
        }
        this.set( 'Vary', appendVaryHeader( header, oldval ) );
    }

    /**
     * Perform a 302 redirect to `url`.
     *
     * The string "back" is special-cased to provide Referrer support, when Referrer is not present `alt` or "/" is used.
     * https://github.com/koajs/koa/blob/698ce0afbfac6480400625729a4b8fc4b4203fdc/lib/response.js#L240
     *
     * Examples:
     *
     *     this.redirect( 'back' );
     *     this.redierct( 'back, '/index.html' );
     *     this.redirect( '/login' );
     *     this.redirect( 'http://google.com' );
     */
    redirect( url: string, alt?: string ): void {
        if( url === 'back' ) url = this.context.get( 'Referrer' ) || ( alt ?? '/' );
        this.set( 'Location', encodeurl( url ) );

        if( !statuses.redirect[ this.status ] ) this.status = 302;

        if( this.context.accepts( 'html' ) ) {
            url = escapehtml( url );
            this.type = 'text/html; charset=utf-8';
            this.body = `Redirecting to <a href="${url}">${url}</a>`;
            return;
        }

        this.type = 'text/plain; charset=utf-8';
        this.body = `Redirecting to ${url}.`;
    }

    /**
     * Set Content-Disposition header to "attachment" with optional `filename`;
     * https://github.com/koajs/koa/blob/698ce0afbfac6480400625729a4b8fc4b4203fdc/lib/response.js#L280
     */
    attachment( filename?: string, options?: ContentDispositionOptions ): void {
        if( filename ) this.type = extname( filename );
        this.set( 'Content-Disposition', contentDisposition( filename, options ) );
    }

    /**
     * Set Content-Type response header with `type` through `mime.lookup()`.
     * when it does not contain a charset.
     * https://github.com/koajs/koa/blob/698ce0afbfac6480400625729a4b8fc4b4203fdc/lib/response.js#L292
     *
     * Examples:
     *
     *     this.type = '.html';
     *     this.type = 'html';
     *     this.type = 'json';
     *     this.type = 'application/json';
     *     this.type = 'png';
     */
    set type( type: string ) {
        const mimetype = getType( type );
        mimetype ? this.set( 'Content-Type', mimetype ) : this.remove( 'Content-Type' );
    }

    /**
     * Return the response mime type void of parameters such as "charset".
     * https://github.com/koajs/koa/blob/698ce0afbfac6480400625729a4b8fc4b4203fdc/lib/response.js#L372
     */
    get type(): string {
        return ( this.get( 'Content-Type' ) as string )?.split( ';', 1 )[ 0 ] || '';
    }

    /**
     * Set the Last-Modified date using a string or a Date.
     *
     *     this.lastModified = new Date();
     *     this.lastModified = '2013-09-13'
     *
     * https://github.com/koajs/koa/blob/698ce0afbfac6480400625729a4b8fc4b4203fdc/lib/response.js#L317
     */
    set lastModified( val: Date | string ) {
        if( typeof val === 'string' ) val = new Date( val );
        this.set( 'Last-Modified', ( val as Date ).toUTCString() );
    }

    /**
     * Get the Last-Modified date in Date form, if it exists
     * https://github.com/koajs/koa/blob/698ce0afbfac6480400625729a4b8fc4b4203fdc/lib/response.js#L332
     */
    get lastModified(): Date | '' {
        const date = this.get( 'Last-Modified' );
        if( date ) return new Date( date as string );
        return date as '';
    }

    /**
     * Set the ETag of a response. This will normalize the quotes if necessary.
     *
     *     this.etag = 'md5hashsum';
     *     this.etag = '"md5hashsum"';
     *     this.etag = 'W/"123456789"';
     *
     * https://github.com/koajs/koa/blob/698ce0afbfac6480400625729a4b8fc4b4203fdc/lib/response.js#L344
     */
    set etag( val: string ) {
        if( !/^(W\/)?"/.test( val ) ) val = `"${val}"`;
        this.set( 'ETag', val );
    }

    /**
     * Get the ETag of a response
     * https://github.com/koajs/koa/blob/698ce0afbfac6480400625729a4b8fc4b4203fdc/lib/response.js#L361
     */
    get etag(): string {
        return this.get( 'ETag' ) as string || '';
    }

    /**
     * Check whether the response is one of the listed types.
     * Pretty much the same as `this.request.is()`.
     * https://github.com/koajs/koa/blob/698ce0afbfac6480400625729a4b8fc4b4203fdc/lib/response.js#L386
     */
    is( ...args: [ ...string[] ] | string[] ): string | false | null {
        return is( this.type, ...args );
    }

    /**
     * Return response header and convert the value to string.
     *
     * Examples:
     *
     *     this.get( 'Content-Type' );
     *     // => "text/plain"
     *
     *     this.get( 'content-type' );
     *     // => "text/plain"
     *
     * https://github.com/koajs/koa/blob/698ce0afbfac6480400625729a4b8fc4b4203fdc/lib/response.js#L400
     */
    get( field: string ): string | string[] {
        return this.#headers.get( field.toLowerCase() )?.toString() ?? '';
    }

    /**
     * Returns true if the header identified by name is currently set in the outgoing headers.
     * The header name matching is case-insensitive.
     * https://github.com/koajs/koa/blob/698ce0afbfac6480400625729a4b8fc4b4203fdc/lib/response.js#L420
     */
    has( field: string ): boolean {
        return this.#headers.has( field.toLowerCase() );
    }

    /**
     * Set header `field` to `val` or pass an object of header fields
     *
     * Examples:
     *
     * ```ts
     * this.set( 'Foo', [ 'bar', 'baz' ] );
     * this.set( 'Accept', 'application/json' );
     * this.set( { Accept : 'text/plain', 'X-API-Key' : 'tobi' } );
     * ```
     *
     * https://github.com/koajs/koa/blob/698ce0afbfac6480400625729a4b8fc4b4203fdc/lib/response.js#L444
     */
    set( field: string | OutgoingHttpHeaders, val?: ValueOf<OutgoingHttpHeaders> ): void {
        if( this.headerSent ) return;

        if( arguments.length === 2 ) {
            this.#headers.set( ( field as string ).toLowerCase(), val );
        } else {
            for( const key in field as OutgoingHttpHeaders ) {
                this.set( key, ( field as OutgoingHttpHeaders )[ key ] );
            }
        }
    }

    /**
     * Append additional header `field` with value `val`.
     *
     * Examples:
     *
     * ```ts
     * this.append( 'Link', [ '<http://localhost/>', '<http://localhost:3000/>' ] );
     * this.append( 'Set-Cookie', 'foo=bar; Path=/; HttpOnly' );
     * this.append( 'Warning', '199 Miscellaneous warning' );
     * ```
     *
     * https://github.com/koajs/koa/blob/698ce0afbfac6480400625729a4b8fc4b4203fdc/lib/response.js#L473
     */
    append( field: string, val: NonNullable<ValueOf<OutgoingHttpHeaders>> ): void {
        const prev = this.get( field );
        if( prev !== '' ) {
            if( Array.isArray( prev ) ) {
                val = prev.concat( String( val ) );
            } else if( typeof prev === 'number' ) {
                val = [ String( prev ) ].concat( String( val ) );
            } else {
                val = [ prev ].concat( String( val ) );
            }
        }
        this.set( field, val );
    }

    /**
     * Remove header `field`
     * https://github.com/koajs/koa/blob/698ce0afbfac6480400625729a4b8fc4b4203fdc/lib/response.js#L501
     */
    remove( field: string ): void {
        if( this.headerSent ) return;
        this.#headers.delete( field.toLowerCase() );
    }

    /**
     * Get all field names of response header
     */
    getHeaderNames(): string[] {
        return Array.from( this.#headers.keys() );
    }

    /**
     * Checks if the request if writable.
     * Tests for the existence of the socket as node sometimes does not set it.
     * https://github.com/koajs/koa/blob/698ce0afbfac6480400625729a4b8fc4b4203fdc/lib/response.js#L514
     */
    get writable(): boolean {
        /**
         * if the native res object is not set, return true directly
         */
        if( !this.res ) return true;

        /**
         * can't write any more after response finished
         */
        if( this.res.writableEnded || this.res.finished ) return false;

        const socket = this.res.socket;
        if( !socket ) return true;
        return socket.writable;
    }

    /**
     * Inspect implementation
     */
    inspect(): Record<string, unknown> {
        return { ...this.toJSON(), body : this.body };
    }

    /**
     * Return JSON representation
     */
    toJSON(): Record<string, unknown> {
        return {
            status : this.status,
            statusText : this.statusText,
            headers : this.headers
        };
    }

    /**
     * Flush any set headers and begin the body
     */
    flushHeaders(): void {
        this.res?.flushHeaders();
    }

    [ util.inspect.custom ](): Record<string, unknown> {
        return this.inspect();
    }
}
