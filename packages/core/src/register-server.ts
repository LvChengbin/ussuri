/******************************************************************
 * Copyright (C) 2022-2023 NextSeason
 *
 * @File: src/register-server.ts
 *
 * This file is part of NextSeason projects.
 * Code in this file can not be copied and/or distributed without the
 * express permission of NextSeason. Inc
 ******************************************************************/

import { Application } from './application';
import { REGISTERED_SERVER_METADATA_KEY } from './constants';

export interface RegisteredServerInitFunction {
    ( this: Application ): any;
}

export interface RegisteredServerStartFunction {
    ( this: Application ): any;
}

export interface RegisteredServerHandleFunction {
    ( this: Application, ...args: any[] ): any;
}

export interface RegisteredServerCloseFunction {
    ( this: Application ): any;
}

export interface RegisteredServerMetadataItem {
    init?: RegisteredServerInitFunction;
    start?: RegisteredServerStartFunction;
    close?: RegisteredServerCloseFunction;
    handle?: RegisteredServerHandleFunction;
}

export interface RegisteredServerMetadata {
    [ key: string | symbol ]: RegisteredServerMetadataItem;
}

export function getRegisteredServerMetadata( target: object ): RegisteredServerMetadata {
    return Reflect.getMetadata( REGISTERED_SERVER_METADATA_KEY, target );
}

export function defineRegisteredServerMetadata(
    target: object,
    metadata: RegisteredServerMetadata
): void {
    Reflect.defineMetadata( REGISTERED_SERVER_METADATA_KEY, metadata, target );
}

export function registerServer(
    target: object,
    name: string | symbol,
    options: RegisteredServerMetadataItem
): void {
    const metadata: RegisteredServerMetadata = getRegisteredServerMetadata( target ) ?? {};

    if( metadata[ name ] ) {
        throw new Error( `Server ${String( name )} has already been registered, delete it manually if you want to register it again.` );
    }

    metadata[ name ] = options;

    defineRegisteredServerMetadata( target, metadata );
}
