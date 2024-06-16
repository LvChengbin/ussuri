/******************************************************************
 * Copyright (C) 2022-2023 NextSeason
 *
 * @File: src/context.ts
 *
 * This file is part of NextSeason projects.
 * Code in this file can not be copied and/or distributed without the
 * express permission of NextSeason. Inc
 ******************************************************************/

import { IncomingMessage } from 'node:http';
import { WebSocket, WebSocketServer } from 'ws';
import { Request, RequestOptions } from '@ussuri/http/request';
import { Sessions } from './sessions';

export type WebSocketEventType =
    | 'connection'
    | 'upgrade'
    | 'message'
    | 'ping'
    | 'pong';

export interface WebSocketData {
    path: string;
    [ key: string ]: any;
}

export interface ContextOptions {
    websocket: WebSocket;
    server: WebSocketServer;
    event: WebSocketEventType;
    data?: WebSocketData;
    path?: string;
    request?: Omit<RequestOptions<Context>, 'context'>;
    sessions: Sessions;
}

export class Context {

    req?: IncomingMessage;

    server: WebSocketServer;

    event: WebSocketEventType;

    path: string;

    data?: WebSocketData;

    websocket: WebSocket;

    request?: Request<Context>;

    sessions: Sessions;

    basket = new Map<string | symbol | number, unknown>();

    params: Record<string, string> = {};

    matches: [ string | undefined ][] = [];

    constructor( options: ContextOptions | Context ) {
        this.websocket = options.websocket;
        this.server = options.server;
        this.event = options.event;
        this.sessions = options.sessions;
        options.data && ( this.data = options.data );

        if( options.request ) {
            this.request = new Request<Context>( {
                ...options.request,
                context : this
            } );
        }

        this.path = options.path
            ?? this.request?.url
            ?? this.data?.path
            ?? '/';
    }

    send( message: string | any ): void {
        const msg = typeof message === 'string'
            ? message
            : JSON.stringify( message );

        this.websocket.send( msg );
    }

    setSessionData( data?: any ): void {
        this.sessions.setData( this.websocket, data );
    }

    getSessionData<T = any>(): T {
        return this.sessions.data( this.websocket );
    }

    setClientId( id: string | number ): void {
        this.sessions.setClient( id, this.websocket );
    }

    getClient( id: string | number ): Set<WebSocket> | undefined {
        return this.sessions.client( id );
    }

    message( message: string | object, ids?: ( string | number )[] ): void {

        const msg = typeof message === 'string'
            ? message
            : JSON.stringify( message );

        if( ids === undefined ) {
            this.websocket.send( msg );
            return;
        }

        ids.forEach( ( id ) => {
            this.getClient( id )?.forEach( client => {
                if( client.readyState === WebSocket.OPEN ) {
                    client.send( msg );
                }
            } );
        } );
    }

    clientIds(): ( string | number )[] {
        return [ ...this.sessions.clients.keys() ];
    }
}
