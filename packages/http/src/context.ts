/******************************************************************
 * Copyright (C) 2021 LvChengbin
 *
 * File: src/context.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 02/05/2021
 * Description:
 ******************************************************************/

import { IncomingMessage, ServerResponse } from 'http';
import fresh from 'fresh';
import { Delegates } from '@ussuri/delegates';
import { Request, RequestOptions } from './request';
import { Response, ResponseOptions } from './response';

export interface ContextOptions {
    request: Omit<RequestOptions, 'context'>;
    response?: Omit<ResponseOptions, 'context'>;
}

export class Context {

    req?: IncomingMessage;
    res?: ServerResponse;

    request!: Request;
    response!: Response;

    params: Record<string, string> = {};
    matches: [ string | undefined ][] = [];
    basket = new Map<string | symbol, unknown>();

    startTime = process.hrtime.bigint();

    time = new Date();

    @Delegates.Method<Context, 'response'>( 'response' )
    declare attachment: Response[ 'attachment' ];

    @Delegates.Method<Context, 'response'>( 'response' )
    declare redirect: Response[ 'redirect' ];

    @Delegates.Method<Context, 'response'>( 'response' )
    declare remove: Response[ 'remove' ];

    @Delegates.Method<Context, 'response'>( 'response' )
    declare vary: Response[ 'vary' ];

    @Delegates.Method<Context, 'response'>( 'response' )
    declare has: Response[ 'has' ];

    @Delegates.Method<Context, 'response'>( 'response' )
    declare set: Response[ 'set' ];

    @Delegates.Method<Context, 'response'>( 'response' )
    declare append: Response[ 'append' ];

    @Delegates.Method<Context, 'response'>( 'response' )
    declare setCookie: Response[ 'setCookie' ];

    @Delegates.Method<Context, 'response'>( 'response' )
    declare flushHeaders: Response[ 'flushHeaders' ];

    @Delegates.Access<Context, 'response'>( 'response' )
    declare status: Response[ 'status' ];

    @Delegates.Access<Context, 'response'>( 'response' )
    declare message: Response[ 'message' ];

    @Delegates.Access<Context, 'response'>( 'response' )
    declare body: Response[ 'body' ];

    @Delegates.Access<Context, 'response'>( 'response' )
    declare length: Response[ 'length' ];

    @Delegates.Access<Context, 'response'>( 'response' )
    declare type: Response[ 'type' ];

    @Delegates.Access<Context, 'response'>( 'response' )
    declare lastModified: Response[ 'lastModified' ];

    @Delegates.Access<Context, 'response'>( 'response' )
    declare etag: Response[ 'etag' ];

    @Delegates.Getter<Context, 'response'>( 'response' )
    declare headerSent: Response[ 'headerSent' ];

    @Delegates.Getter<Context, 'response'>( 'response' )
    declare writable: Response[ 'writable' ];

    @Delegates.Method<Context, 'request'>( 'request' )
    declare acceptsLanguages: Request[ 'acceptsLanguages' ];

    @Delegates.Method<Context, 'request'>( 'request' )
    declare acceptsEncodings: Request[ 'acceptsEncodings' ];

    @Delegates.Method<Context, 'request'>( 'request' )
    declare acceptsCharsets: Request[ 'acceptsCharsets' ];

    @Delegates.Method<Context, 'request'>( 'request' )
    declare accepts: Request[ 'accepts' ];

    @Delegates.Method<Context, 'request'>( 'request' )
    declare get: Request[ 'get' ];

    @Delegates.Method<Context, 'request'>( 'request' )
    declare cookie: Request[ 'cookie' ];

    @Delegates.Method<Context, 'request'>( 'request' )
    declare is: Request[ 'is' ];

    @Delegates.Access<Context, 'request'>( 'request' )
    declare querystring: Request[ 'querystring' ];

    @Delegates.Access<Context, 'request'>( 'request' )
    declare idempotent: Request[ 'idempotent' ];

    @Delegates.Access<Context, 'request'>( 'request' )
    declare socket: Request[ 'socket' ];

    @Delegates.Access<Context, 'request'>( 'request' )
    declare search: Request[ 'search' ];

    @Delegates.Access<Context, 'request'>( 'request' )
    declare method: Request[ 'method' ];

    @Delegates.Access<Context, 'request'>( 'request' )
    declare query: Request[ 'query' ];

    @Delegates.Access<Context, 'request'>( 'request' )
    declare path: Request[ 'path' ];

    @Delegates.Access<Context, 'request'>( 'request' )
    declare url: Request[ 'url' ];

    @Delegates.Access<Context, 'request'>( 'request' )
    declare accept: Request[ 'accept' ];

    @Delegates.Getter<Context, 'request'>( 'request' )
    declare origin: Request[ 'origin' ];

    @Delegates.Getter<Context, 'request'>( 'request' )
    declare href: Request[ 'href' ];

    @Delegates.Getter<Context, 'request'>( 'request' )
    declare subdomains: Request[ 'subdomains' ];

    @Delegates.Getter<Context, 'request'>( 'request' )
    declare protocol: Request[ 'protocol' ];

    @Delegates.Getter<Context, 'request'>( 'request' )
    declare host: Request[ 'host' ];

    @Delegates.Getter<Context, 'request'>( 'request' )
    declare hostname: Request[ 'hostname' ];

    @Delegates.Getter<Context, 'request'>( 'request' )
    declare URL: Request[ 'URL' ];

    @Delegates.Getter<Context, 'request'>( 'request' )
    declare headers: Request[ 'headers' ];

    @Delegates.Getter<Context, 'request'>( 'request' )
    declare secure: Request[ 'secure' ];

    @Delegates.Getter<Context, 'request'>( 'request' )
    declare ips: Request[ 'ips' ];

    @Delegates.Getter<Context, 'request'>( 'request' )
    declare ip: Request[ 'ip' ];

    constructor( options: ContextOptions | Context ) {

        if( options instanceof Context ) return options;

        // this.app = options.app;
        this.request = new Request( { ...options.request, context : this } );
        this.response = new Response( { ...options.response ?? {}, context : this } );
        this.request.req && ( this.req = this.request.req );
        this.response.res && ( this.res = this.response.res );
    }

    /**
     * Check if the request is fresh, aka Last-Modified and/or the ETag still match
     * https://github.com/koajs/koa/blob/f8b49b859363ad6c3d9ea5c11ee62341407ceafd/lib/request.js#L300
     */
    get fresh(): boolean {
        const { method, status } = this;

        // GET or HEAD for weak freshness validation only
        if( method !== 'GET' && method !== 'HEAD' ) return false;

        // GET or HEAD for weak freshness validation only
        if( ( status >= 200 && status < 300 ) || status === 304 ) {
            return fresh( this.headers, this.response.headers );
        }

        return false;
    }

    /**
     * Check if the request is stale, aka "Last-Modified" and/or the "ETag" for the resourse has changed.
     * https://github.com/koajs/koa/blob/f8b49b859363ad6c3d9ea5c11ee62341407ceafd/lib/request.js#L324
     */
    get stale(): boolean {
        return !this.fresh;
    }

    get age(): string {
        const age = process.hrtime.bigint() - this.startTime;
        return Number( age / 1000000n ).toFixed( 2 ) + 'ms';
    }

    inspect(): Record<string, unknown> {
        return this.toJSON();
    }

    toJSON(): Record<string, unknown> {
        return {
            request : this.request.toJSON(),
            resposne : this.response.toJSON()
        };
    }
}
