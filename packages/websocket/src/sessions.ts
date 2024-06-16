/******************************************************************
 * Copyright (C) 2022-2024 NextSeason
 *
 * @File: src/session.ts
 *
 * This file is part of NextSeason projects.
 * Code in this file can not be copied and/or distributed without the
 * express permission of NextSeason. Inc
 ******************************************************************/

import { WebSocket, WebSocketServer } from 'ws';

type Id =
    | string
    | number;

export class Sessions<T = any> {

    clients = new Map<string | number, Set<WebSocket>>();

    sessions = new Map<WebSocket, T>();

    server: WebSocketServer;

    constructor( server: WebSocketServer ) {
        this.server = server;
    }

    setData( client: WebSocket, data: T ): void {
        this.sessions.set( client, data );
    }

    data( client: WebSocket ): T | undefined {
        return this.sessions.get( client );
    }

    setClient( id: Id, client: WebSocket ): void {
        const exists = this.clients.get( id );
        if( exists ) {
            exists.add( client );
        } else {
            this.clients.set( id, new Set( [ client ] ) );
        }
    }

    client( id: Id ): Set<WebSocket> | undefined {
        return this.clients.get( id );
    }

    clear(): void {
        this.clients.clear();
        this.sessions.clear();
    }

    destory(): void {
        this.clear();
        this.server.clients.forEach( client => {
            client.terminate();
        } );
    }
}
