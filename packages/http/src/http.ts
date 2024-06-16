/******************************************************************
 * Copyright (C) 2022-2023 NextSeason
 *
 * @File: src/http.ts
 *
 * This file is part of NextSeason projects.
 * Code in this file can not be copied and/or distributed without the
 * express permission of NextSeason. Inc
 ******************************************************************/

import http, { IncomingMessage, ServerResponse, RequestListener, Server, ServerOptions } from 'node:http';
import Stream from 'node:stream';
import statuses from 'statuses';
import { Broker } from '@ussuri/method-interceptor';
import { Application, registerServer, InternalRouteMap, RouteMatches, RouteError } from '@ussuri/core';
import { Context, ContextOptions } from './context';
import { HttpStatus } from './enums';
import { ForwardBroker } from './brokers';
import { HttpException } from './exceptions';
import { setResponse } from './utils/set-response';

const portMap = new Map<number, Server>();

export const HTTP_REGISTERED_SERVER_NAME = Symbol.for( 'http#registered#server#name' );
export const HTTP_ROUTING_GROUP = Symbol( 'http#routing#group' );

export interface HttpOptions<
    Request extends typeof IncomingMessage = typeof IncomingMessage,
    Response extends typeof ServerResponse = typeof ServerResponse
> {
    port?: number;
    server?: Server;
    serverOptions?: ServerOptions<Request, Response>;
    requestListener?: RequestListener<Request, Response>;
}

export function Http<
    Request extends typeof IncomingMessage = typeof IncomingMessage,
    Response extends typeof ServerResponse = typeof ServerResponse
>( options: number | Server | HttpOptions<Request, Response> = {} ): ClassDecorator {

    const opts: HttpOptions<Request, Response> = typeof options === 'number'
        ? { port : options }
        : options instanceof Server
            ? { server : options }
            : options;

    let server: Server | undefined;

    return ( target: object ): void => {

        registerServer( target, HTTP_REGISTERED_SERVER_NAME, {
            init() {
                server = opts.server ?? http.createServer(
                    opts.serverOptions ?? {},
                    ( ...args: Parameters<RequestListener<Request, Response>> ) => {
                        ( opts.requestListener ?? listener ).call( this, ...args );
                    }
                );
                opts.port && portMap.set( opts.port, server );
            },
            start() {
                server?.listen( opts.port );
            },
            close() {
                server?.close();
            },
            async handle( options: ContextOptions ): Promise<Context> {
                return handle.call( this, options );
            }
        } );
    };
}

export async function handle( this: Application, options: ContextOptions | Context ): Promise<Context> {

    const context = new Context( options );

    const interceptors = {
        output : ( res: unknown, context: Context ) => {
            setResponse( res, context );
        },
        exception : async ( e: unknown, context: Context ) => {
            if( e instanceof RouteError ) {
                // // eslint-disable-next-line no-console
                // console.error( 'routing error: ', e );
                context.status = HttpStatus.NOT_FOUND;
            } else if( e instanceof ForwardBroker ) {
                if( typeof e.value.handler === 'function' ) {
                    context = e.value.handler( context, this );
                }
                context.path = e.value.path;
                return handle.call( this, context );
            } else if( e instanceof Broker ) {
                const value = e.value;

                if( typeof value === 'function' ) {
                    context = setResponse( await value( context, this ), context );
                } else {
                    context = setResponse( value, context );
                }
            } else if( typeof e === 'number' ) {
                context.status = e;
            } else if( typeof e === 'string' ) {
                context.status = HttpStatus.INTERNAL_SERVER_ERROR;
            } else if( e instanceof HttpException ) {
                context.status = e.status;
                if( e.response ) {
                    context.body = e.response;
                }
            } else if( e instanceof Error ) {
                // eslint-disable-next-line no-console
                console.error( 'application error: ', e );
                context.status = HttpStatus.INTERNAL_SERVER_ERROR;
            }
        }
    };

    /**
     * Still using `try...catch` the execution here
     * in case of there are some unexpected uncaught errors.
     * The exceptions here can't be passed to `exception interceptors`
     */
    try {
        await this.visit( {
            group : HTTP_ROUTING_GROUP,
            namespace : context.method,
            path : context.path
        }, context, { interceptors } );
    } catch( e: unknown ) {
        // eslint-disable-next-line no-console
        console.error( 'application error: ', e );
        context.status = HttpStatus.INTERNAL_SERVER_ERROR;
    }

    return context;
}

export async function routingHandler(
    application: Application,
    context: Context,
    route: InternalRouteMap,
    match: RouteMatches<Context>
): Promise<any> {
    Object.assign( context, { params : match.params, matches : match.matches } );
    return application.run( context, route, match );
}

export function getServerByPort( port: number ): Server | undefined {
    return portMap.get( port );
}

export async function listener(
    this: Application,
    req: IncomingMessage,
    res: ServerResponse
): Promise<void> {
    const context = await handle.call( this, {
        request : { req },
        response : { res }
    } );

    const { request, response } = context;
    const { status, headers } = response;

    res.statusCode = status;

    req.httpVersionMajor < 2 && ( res.statusMessage = response.statusText );

    Object.keys( headers ).forEach( ( field: string ) => {
        if( headers[ field ] !== undefined ) {
            res.setHeader( field, headers[ field ] as string );
        }
    } );

    const { body } = response;

    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    if( statuses.empty[ status ] || request.method === 'HEAD' || body === null || body === undefined ) {
        res.end();
        return;
    }

    if( body instanceof Stream ) {
        body.pipe( res );
        return;
    }

    if( Buffer.isBuffer( body ) || typeof body === 'string' || typeof body === 'number' ) {
        res.end( body );
        return;
    }

    res.end( JSON.stringify( body ) );
};
