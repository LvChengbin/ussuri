/******************************************************************
 * Copyright (C) 2022-2023 NextSeason
 *
 * @File: src/websocket.ts
 *
 * This file is part of NextSeason projects.
 * Code in this file can not be copied and/or distributed without the
 * express permission of NextSeason. Inc
 ******************************************************************/

import 'reflect-metadata';
import { SetOptional } from 'type-fest';
import { Server as HTTPServer, IncomingMessage } from 'node:http';
import { Server as HTTPSServer } from 'node:https';
import { WebSocket as WS, WebSocketServer, ServerOptions } from 'ws';
import { Application, registerServer, InternalRouteMap, RouteMatches } from '@ussuri/core';
import { getServerByPort } from '@ussuri/http';
import { WEBSOCKET_APPLICATION_METADATA_KEY } from './constants';
import { Context, ContextOptions } from './context';
import { Sessions } from './sessions';

export const WEBSOCKET_REGISTERED_SERVER_NAME = Symbol( 'websocket#registered#server#name' );
export const WEBSOCKET_ROUTING_GROUP = Symbol( 'websocket#routing#group' );

export type WebSocketOptions = ServerOptions;

export function WebSocket( options: number | HTTPServer | HTTPSServer | WebSocketOptions = {} ): ClassDecorator {

    const opts: WebSocketOptions = typeof options === 'number'
        ? { port : options }
        : options instanceof HTTPServer || options instanceof HTTPSServer
            ? { server : options }
            : options;

    return ( target: any ): void => {

        let webSocketServer: WebSocketServer | undefined;

        registerServer( target, WEBSOCKET_REGISTERED_SERVER_NAME, {
            start() {

                const conf = { ...opts };

                if( conf.port && !conf.server ) {
                    const httpServer = getServerByPort( conf.port );
                    if( httpServer ) {
                        conf.server = httpServer;
                        delete conf.port;
                    }
                }

                webSocketServer = new WebSocketServer( conf );

                const metadata = {
                    sessions : new Sessions( webSocketServer )
                };

                Reflect.defineMetadata( WEBSOCKET_APPLICATION_METADATA_KEY, metadata, target );


                // if( port && !server ) {
                //     const httpServer = getServerByPort( port );
                //     if( httpServer ) {
                //         webSocketServer = new WebSocketServer( {
                //             server : httpServer,
                //             ...rest
                //         } );
                //     } else {
                //         webSocketServer = new WebSocketServer( opts );
                //     }
                // } else {
                //     webSocketServer = new WebSocketServer( opts );
                // }

                webSocketServer.on( 'connection', ( ws: WS, request: IncomingMessage ) => {
                    console.log( 'connected' );

                    handle.call( this, {
                        websocket : ws,
                        server : webSocketServer as WebSocketServer,
                        event : 'connection',
                        request : { req : request }
                    } );

                    // ws.close();

                    ws.on( 'error', function() {
                        console.log( 'error' );
                    } );

                    ws.on( 'message', async ( message: Buffer ) => {
                        try {
                            const data = JSON.parse( message.toString() );
                            await handle.call( this, {
                                websocket : ws,
                                server : webSocketServer as WebSocketServer,
                                event : 'message',
                                data
                            } );

                        } catch( e: unknown ) {
                            // eslint-disable-next-line no-console
                            console.error( 'received: ', message.toString() );
                        }
                    } );

                    ws.on( 'ping', function message( data ) {
                        console.log( 'ping', data );
                    } );

                    ws.on( 'pong', function message( data ) {
                        console.log( 'pong', data );
                    } );

                } );

                conf.server?.on( 'upgrade', async ( request: IncomingMessage ) => {
                    console.log( 'protocol upgrade', request.url );

                    // try {
                    //     await handle.call( this, {
                    //         // websocket : ws,
                    //         // server : webSocketServer as WebSocketServer,
                    //         event : 'upgrade',
                    //         data : {
                    //             path : '/'
                    //         }
                    //     } as any );

                    // } catch( e: unknown ) {
                    //     // eslint-disable-next-line no-console
                    //     console.error( 'received: ', message.toString() );
                    // }
                } );
            },
            close() {
                webSocketServer?.close();
            },
            async handle( options: ContextOptions ): Promise<Context> {
                return handle.call( this, options );
            }
        } );
    };
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

export async function handle(
    this: Application,
    options: SetOptional<ContextOptions, 'sessions'> | Context
): Promise<Context> {

    const metadata = Reflect.getMetadata( WEBSOCKET_APPLICATION_METADATA_KEY, this.constructor );

    const context = new Context( {
        sessions : metadata.sessions,
        ...options
    } );

    const interceptors = {};

    try {
        await this.visit( {
            group : WEBSOCKET_ROUTING_GROUP,
            namespace : context.event,
            path : context.path
        }, context, { interceptors } );
    } catch( e: unknown ) {
        // eslint-disable-next-line no-console
        console.error( e );
    }
    return context;
}
