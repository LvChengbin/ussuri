/******************************************************************
 * Copyright (C) 2021 LvChengbin
 *
 * File: src/request.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 02/07/2021
 * Description:
 ******************************************************************/

import util from 'node:util';
import qs, { ParsedUrlQuery, ParsedUrlQueryInput } from 'node:querystring';
import { TLSSocket } from 'node:tls';
import { Socket, isIP } from 'node:net';
import { IncomingMessage, IncomingHttpHeaders } from 'node:http';
import { format as stringify, UrlWithStringQuery } from 'node:url';
import { parse as cookieParse } from 'cookie';
import { Files } from 'formidable';
import contentType from 'content-type';
import { is } from 'type-is';
import accepts, { Accepts } from 'accepts';
import { parseurl } from './utils/parseurl';
import { Context } from './context';

export interface RequestOptions<C = Context> {
    context: C;
    url?: string;
    method?: string;
    req?: IncomingMessage;
    ip?: string;
    body?: unknown;
    files?: Files | Promise<Files>;
    headers?: IncomingHttpHeaders;
    trustXRealIp?: boolean;
    proxyIpHeader?: string;
    subdomainOffset?: number;
    proxy?: boolean;
    maxIpsCount?: number;
}

export class Request<C = Context> {

    #ip?: string;
    #accept?: Accepts;
    #headers: IncomingHttpHeaders = {};
    #parsedurl: UrlWithStringQuery | null = null;
    #parsedCookie: Record<string, string> | null = null;
    #rawParsedurl: string | null = null;
    #URL: URL | null = null;
    #querycache: Record<string, ParsedUrlQuery> = {};

    context: C;
    url = '/';
    method = 'GET';
    originalUrl: string;
    body: unknown = undefined;
    files?: Files | Promise<Files>;
    proxyIpHeader = 'X-Forwarded-For';
    trustXRealIp = false;
    subdomainOffset = 2;
    proxy = false;
    maxIpsCount = 0;

    req?: IncomingMessage;

    constructor( options: Readonly<RequestOptions<C>> ) {
        const { req } = options;
        this.context = options.context;

        if( req ) {
            this.req = req;
            req.headers && ( this.headers = req.headers );
            req.method && ( this.method = req.method );
            req.url && ( this.url = req.url );
        } else {
            options.headers && ( this.headers = options.headers );
            options.method && ( this.method = options.method.toUpperCase() );
            options.url && ( this.url = options.url );
        }

        options.maxIpsCount && ( this.maxIpsCount = options.maxIpsCount );
        options.proxy && ( this.proxy = options.proxy );
        options.ip && ( this.#ip = options.ip );
        if( options.body !== undefined && ( [ 'POST', 'PUT', 'PATCH' ].includes( this.method ) ) ) {
            this.body = options.body;
        }
        options.proxyIpHeader && ( this.proxyIpHeader = options.proxyIpHeader );
        options.trustXRealIp === undefined || ( this.trustXRealIp = options.trustXRealIp );
        options.subdomainOffset === undefined || ( this.subdomainOffset = options.subdomainOffset );

        this.originalUrl = this.url;
    }

    #parseurl = (): UrlWithStringQuery => {
        if( !this.#parsedurl || this.url !== this.#rawParsedurl ) {
            this.#rawParsedurl = this.url;
            this.#parsedurl = parseurl( this.url );
        }

        return this.#parsedurl;
    };

    /**
     * Return request headers, the request.header, which is of Koajs, is removed in Ussuri.
     * https://github.com/koajs/koa/blob/f8b49b859363ad6c3d9ea5c11ee62341407ceafd/lib/request.js#L49
     */
    get headers(): IncomingHttpHeaders {
        return this.#headers;
    }

    /**
     * Set request header
     * https://github.com/koajs/koa/blob/f8b49b859363ad6c3d9ea5c11ee62341407ceafd/lib/request.js#L60
     */
    set headers( headers: IncomingHttpHeaders ) {
        this.#headers = {};

        /**
         * keep all names of headers to be lowercase
         */
        Object.keys( headers ).forEach( ( name: string ): void => {
            this.#headers[ name.toLowerCase() ] = headers[ name ];
        } );
    }

    /**
     * Get origin of URL
     * https://github.com/koajs/koa/blob/f8b49b859363ad6c3d9ea5c11ee62341407ceafd/lib/request.js#L91
     */
    get origin(): string {
        return `${this.protocol}://${this.host}`;
    }

    /**
     * Get full request URL
     * https://github.com/koajs/koa/blob/f8b49b859363ad6c3d9ea5c11ee62341407ceafd/lib/request.js#L102
     */
    get href(): string {
        if( /^https?:\/\//i.test( this.originalUrl ) ) return this.originalUrl;
        return this.origin + this.originalUrl;
    }

    /**
     * Get request pathname
     * https://github.com/koajs/koa/blob/f8b49b859363ad6c3d9ea5c11ee62341407ceafd/lib/request.js#L137
     */
    get path(): string {
        return this.#parseurl().pathname ?? '';
    }

    /**
     * Set pathname, retaining the query string when present.
     * https://github.com/koajs/koa/blob/f8b49b859363ad6c3d9ea5c11ee62341407ceafd/lib/request.js#L149
     */
    set path( pathname: string ) {
        const url = this.#parseurl();
        if( url.pathname === pathname ) return;
        url.pathname = pathname;
        this.url = stringify( url );
    }

    /**
     * Get parsed query string.
     * https://github.com/koajs/koa/blob/f8b49b859363ad6c3d9ea5c11ee62341407ceafd/lib/request.js#L165
     */
    get query(): ParsedUrlQuery {
        const str = this.querystring;
        return this.#querycache[ str ] ??= qs.parse( str );
    }

    /**
     * Set query string as an object.
     * https://github.com/koajs/koa/blob/f8b49b859363ad6c3d9ea5c11ee62341407ceafd/lib/request.js#L178
     */
    set query( obj: ParsedUrlQueryInput ) {
        this.querystring = qs.stringify( obj );
    }

    /**
     * Get query string.
     * https://github.com/koajs/koa/blob/f8b49b859363ad6c3d9ea5c11ee62341407ceafd/lib/request.js#L189
     */
    get querystring(): string {
        return this.#parseurl().query ?? '';
    }

    /**
     * Set query string.
     * https://github.com/koajs/koa/blob/f8b49b859363ad6c3d9ea5c11ee62341407ceafd/lib/request.js#L208
     */
    set querystring( str: string ) {
        const url = this.#parseurl();
        if( url.search === `?${str}` ) return;
        url.search = str;
        this.url = stringify( url );
    }

    /**
     * Get the search string. Same as the query string except it includes the leading ?.
     * https://github.com/koajs/koa/blob/f8b49b859363ad6c3d9ea5c11ee62341407ceafd/lib/request.js#L218
     */
    get search(): string {
        const search = this.querystring;
        if( !search ) return '';
        return `?${search}`;
    }

    /**
     * Set the search string. Same as request.querystring= but included for ubiquity.
     * https://github.com/koajs/koa/blob/f8b49b859363ad6c3d9ea5c11ee62341407ceafd/lib/request.js#L231
     */
    set search( str: string ) {
        this.querystring = str;
    }

    /**
     * Parse the "Host" header field host and support X-Forwarded-Host when a proxy is enabled.
     * ":authority" header is used if exists.
     * https://github.com/koajs/koa/blob/f8b49b859363ad6c3d9ea5c11ee62341407ceafd/lib/request.js#L243
     */
    get host(): string {
        let host = this.proxy && this.get( 'X-Forwarded-Host' );

        if( !host ) {
            /**
             * Support ":authority" Psudo-Header defined in HTTP2
             * https://tools.ietf.org/html/rfc7540#section-8.1.2.3
             *
             * In Koa, using :authority if httpVersionMajor >= 2, but In don't want to care to much about the http version
             * cuz ussuri request doesn't handle the native nodejs req object
             */
            host = this.get( ':authority' ) || this.get( 'Host' );
        }

        if( !host ) return '';
        return host.split( /\s*,\s*/, 1 )[ 0 ];
    }

    /**
     * Parse the "Host" header field hostname and support X-Forwarded-Host when a proxy is enabled
     * https://github.com/koajs/koa/blob/f8b49b859363ad6c3d9ea5c11ee62341407ceafd/lib/request.js#L263
     */
    get hostname(): string {
        const { host } = this;
        if( !host ) return '';
        if( host[ 0 ].startsWith( '[' ) ) return this.URL?.hostname ?? ''; // IPv6
        return host.split( ':', 1 )[ 0 ];
    }

    /**
     * Get WHATWG parsed URL. Lazily memoized, return null if failed
     * https://github.com/koajs/koa/blob/f8b49b859363ad6c3d9ea5c11ee62341407ceafd/lib/request.js#L279
     */
    get URL(): URL | null {
        if( !this.#URL ) {
            try {
                this.#URL = new URL( `${this.origin}${this.originalUrl}` );
            } catch( e: unknown ) {
                this.#URL = null;
            }
        }
        return this.#URL;
    }

    /**
     * Check if the request is idempotent
     * https://github.com/koajs/koa/blob/f8b49b859363ad6c3d9ea5c11ee62341407ceafd/lib/request.js#L337
     */
    get idempotent(): boolean {
        return [ 'GET', 'HEAD', 'PUT', 'DELETE', 'OPTIONS', 'TRACE' ].includes( this.method );
    }

    /**
     * Return the request socket, `null` will be returned if the native req is not set
     * https://github.com/koajs/koa/blob/f8b49b859363ad6c3d9ea5c11ee62341407ceafd/lib/request.js#L349
     */
    get socket(): Socket | null {
        return this.req?.socket ?? null;
    }

    /**
     * Get the charset when present or undefined
     * https://github.com/koajs/koa/blob/f8b49b859363ad6c3d9ea5c11ee62341407ceafd/lib/request.js#L360
     */
    get charset(): string {
        try {
            return contentType.parse( this.get( 'Content-Type' ) ).parameters.charset || '';
        } catch( e: unknown ) {
            return '';
        }
    }

    /**
     * Return parsed `Content-Length` as a number when present, or `undefined`.
     * https://github.com/koajs/koa/blob/f8b49b859363ad6c3d9ea5c11ee62341407ceafd/lib/request.js#L376
     */
    get length(): number | void {
        const len = this.get( 'Content-Length' );
        if( len === '' ) return;
        return ~~len;
    }

    /**
     * Return the protocol string "http" or "https" when requested with TLS.
     * When the proxy setting is enabled the "X-Forwarded-Proto" header field will be trusted.
     * If you're running behind a reverse proxy that supplies https for you this may be enabled.
     * https://github.com/koajs/koa/blob/f8b49b859363ad6c3d9ea5c11ee62341407ceafd/lib/request.js#L389
     */
    get protocol(): string {
        if( ( this.socket as TLSSocket )?.encrypted ) return 'https';
        if( !this.proxy ) return 'http';
        return this.get( 'X-Forwarded-Proto' )?.split( /\s*,\s*/, 1 )[ 0 ] ?? 'http';
    }


    /**
     * Shorthand for: this.protocol === 'https'.
     * https://github.com/koajs/koa/blob/f8b49b859363ad6c3d9ea5c11ee62341407ceafd/lib/request.js#L408
     */
    get secure(): boolean {
        return this.protocol === 'https';
    }

    /**
     * When `proxy` is `true`, parse the "X-Forwarded-For" ip address list.o
     *
     * For example if the value was "client, proxy1, proxy2" you would receive the array `["client", "proxy1", "proxy2"]` when "proxy2" is the furthest down-stream.
     * https://github.com/koajs/koa/blob/f8b49b859363ad6c3d9ea5c11ee62341407ceafd/lib/request.js#L421
     */
    get ips(): string[] {
        const val = this.get( this.proxyIpHeader );
        if( !val || !this.proxy ) return [];
        const ips = val.split( /\s*,\s*/ );
        if( this.maxIpsCount && this.maxIpsCount > 0 ) return ips.slice( -this.maxIpsCount );
        return ips;
    }

    /**
     * Return request's remote address.
     * When `proxy` is `true`, parse the "X-Forwarded-For" ip address list and return the first one
     * https://github.com/koajs/koa/blob/f8b49b859363ad6c3d9ea5c11ee62341407ceafd/lib/request.js#L445
     */
    get ip(): string {
        if( this.#ip ) return this.#ip;
        if( this.trustXRealIp && this.get( 'X-Real-IP' ) ) {
            return this.#ip = this.get( 'X-Real-IP' );
        }
        return this.#ip = this.ips[ 0 ] || ( this.socket?.remoteAddress ?? '' ) ;
    }

    /**
     * Set IP address to the request object
     * https://github.com/koajs/koa/blob/f8b49b859363ad6c3d9ea5c11ee62341407ceafd/lib/request.js#L461
     */
    set ip( ip: string ) {
        this.#ip = ip;
    }

    /**
     * Return subdomains as an array
     *
     * Subdomains are the dot-separated parts of the host before the main domain of the app.
     * By default, the domain of the app is assumed to be the last two parts of the host. This can be changed by setting `subdomainOffset`.
     *
     * For example, if the domain is "tobi.ferrets.example.com":
     * If `subdomainOffset` is not set, this.subdomains is `["ferrets", "tobi"]`.
     * If `subdomainOffset` is 3, this.subdomains is `["tobi"]`.
     * https://github.com/koajs/koa/blob/f8b49b859363ad6c3d9ea5c11ee62341407ceafd/lib/request.js#L465
     */
    get subdomains(): string[] {
        const { hostname } = this;
        if( isIP( hostname ) ) return [];
        return hostname.split( '.' ).reverse().slice( this.subdomainOffset );
    }

    /**
     * Get accept object. Lazily memoized.
     * https://github.com/koajs/koa/blob/f8b49b859363ad6c3d9ea5c11ee62341407ceafd/lib/request.js#L491
     */
    get accept(): Accepts {
        /**
         * accepts needs IncomingMessage, but only the headers property is being used.
         * https://github.com/jshttp/accepts#readme
         */
        return this.#accept ||= accepts( { headers : this.headers } as IncomingMessage );
    }

    /**
     * Set accept object.
     * https://github.com/koajs/koa/blob/f8b49b859363ad6c3d9ea5c11ee62341407ceafd/lib/request.js#L503
     */
    set accept( accepts: Accepts ) {
        this.#accept = accepts;
    }

    cookie(): Record<string, string>;
    cookie( name: string ): string | null;
    cookie( name?: string ): Record<string, string> | string | null {
        if( !this.#parsedCookie ) {
            this.#parsedCookie = cookieParse( this.get( 'cookie' ) );
        }

        return name ? ( this.#parsedCookie[ name ] ?? null ) : this.#parsedCookie;
    }

    /**
     * Check if the given `type(s)` is acceptable, returning the best match when true,
     * otherwise `false`, in which case you should respond with 406 "Not Acceptable".
     *
     * https://github.com/koajs/koa/blob/f8b49b859363ad6c3d9ea5c11ee62341407ceafd/lib/request.js#L514
     *
     * The `type` value may be a single mime type string such as "application/json",
     * the extension name such as "json" or an array `["json", "html", "text/plain"]`.
     * When a list or array is given the _best_ match, if any is returned.
     *
     * Examples:
     *
     *     // Accept: text/html
     *     this.accepts( 'html' );
     *     // => "html"
     *
     *     // Accept: text/*, application/json
     *     this.accepts( 'html' );
     *     // => "html"
     *     this.accepts( 'text/html' );
     *     // => "text/html"
     *     this.accepts( 'json', 'text' );
     *     // => "json"
     *     this.accepts( 'application/json' );
     *     // => "application/json"
     *
     *     // Accept: text/*, application/json
     *     this.accepts( 'image/png' );
     *     this.accepts( 'png' );
     *     // => false
     *
     *     // Accept: text/*;q=.5, application/json
     *     this.accepts( [ 'html', 'json' ] );
     *     this.accepts( 'html', 'json' );
     *     // => "json"
     */
    accepts( ...args: [ ...string[] ] | string[] ): string[] | string | false {
        return this.accept.types( ...args );
    }

    /**
     * Return accepted encodings or best fit based on `encodings`.
     *
     * Given `Accept-Encoding: gzip, deflate`
     * an array sorted by quality is returned:
     *
     *     [ 'gzip', 'deflates' ]
     *
     * https://github.com/koajs/koa/blob/f8b49b859363ad6c3d9ea5c11ee62341407ceafd/lib/request.js#L559
     */
    acceptsEncodings( ...args: [ ...string[] ] | string[] ): string | false {
        return this.accept.encodings( ...args );
    }

    /**
     * Return accepted charsets or best fit based on `charsets`.
     *
     * Given `Accept-Charset: utf-8, iso-8859-1;q=0.2, utf-7;q=0.5` an array sorted by quality is returned:
     *
     *     [ 'utf-8', 'utf-7', 'iso-8859-1' ]
     *
     * https://github.com/koajs/koa/blob/f8b49b859363ad6c3d9ea5c11ee62341407ceafd/lib/request.js#L576
     */
    acceptsCharsets( ...args: [ ...string[] ] | string[] ): string | false {
        return this.accept.charsets( ...args );
    }

    /**
     * Return acepted languages or best fit based on `langs`.
     *
     * Given `Accept-Language: en;q=0.8, es, pt` an array sorted by quality is returned:
     *
     *     [ 'es', 'pt', 'en' ]
     *
     * https://github.com/koajs/koa/blob/f8b49b859363ad6c3d9ea5c11ee62341407ceafd/lib/request.js#L593
     */
    acceptsLanguages( ...args: [ ...string[] ] | string[] ): string | false {
        return this.accept.languages( ...args );
    }

    /**
     * Check if the incoming request contains the "Content-Type" header field and if it contains any of the given mime `type`s.
     * If there is no request body, `null` is returned.
     * If there is no content type, `false` is returned.
     * Otherwise, it returns the first `type` that matches.
     *
     * https://github.com/koajs/koa/blob/f8b49b859363ad6c3d9ea5c11ee62341407ceafd/lib/request.js#L610
     *
     * Excmples:
     *
     *     // With Content-Type: text/html; charset=utf-8
     *     this.is( 'html' ); // => 'html'
     *     this.is( 'text/html' ); // => 'text/html'
     *     this.is( 'text/*', 'application/json' ); // => 'text/html'
     *
     */
    is( ...args: [ ...string[] ] | string[] ): string | false | null {
        if( this.get( 'Transfer-Encoding' ) === '' && isNaN( Number( this.get( 'Content-Length' ) ) ) ) return null;
        return is( this.get( 'Content-Type' ), ...args );
    }

    /**
     * Return the request mime type void of parameters such as "charset".
     * https://github.com/koajs/koa/blob/f8b49b859363ad6c3d9ea5c11ee62341407ceafd/lib/request.js#L641
     */
    get type(): string {
        return this.get( 'Content-Type' )?.split( ';' )[ 0 ] ?? '';
    }

    /**
     * Return request header.
     *
     * The `Referrer` header field is special-cased, both `Referrer` and `Referer` are interchangable.
     *
     * https://github.com/koajs/koa/blob/f8b49b859363ad6c3d9ea5c11ee62341407ceafd/lib/request.js#L655
     *
     * Examples:
     *
     *     this.get( 'Content-Type' );
     *     // => "text/plain"
     *
     *     this.get( 'content-type' );
     *     // => "text/plain"
     *
     *     this.get( 'Something' );
     *     // => ''
     */
    get( field: string ): string {
        switch( field = field.toLowerCase() ) {
            case 'referer' :
            case 'referrer' :
                return this.headers.referrer as string ?? this.headers.referer ?? '';
            default :
                return this.headers[ field ] as string ?? '';
        }
    }

    /**
     * Inspect implementation.
     */
    inspect(): Record<string, unknown> {
        return this.toJSON();
    }

    /**
     * Return JSON representation
     */
    toJSON(): Record<string, unknown> {
        return {
            url : this.url,
            method : this.method,
            headers : this.headers
        };
    }

    [ util.inspect.custom ](): Record<string, unknown> {
        return this.inspect();
    }
}
