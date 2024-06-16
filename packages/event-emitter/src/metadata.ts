/******************************************************************
 * Copyright (C) 2022-2023 NextSeason
 *
 * @File: src/metadata.ts
 *
 * This file is part of NextSeason projects.
 * Code in this file can not be copied and/or distributed without the
 * express permission of NextSeason. Inc
 ******************************************************************/

import 'reflect-metadata';
import { OnOptions } from 'eventemitter2';
import { LISTENER_METADATA_KEY } from './constants';

export interface EventData {
    event: string | symbol;
    options?: OnOptions;
}

export function getListenerMetadata( target: object, key: string | symbol ): EventData[] {
    return Reflect.getMetadata( LISTENER_METADATA_KEY, target, key );
}

export function setListenerMetadata(
    data: EventData | EventData[],
    target: object,
    key: string | symbol
): void {
    const metadata = getListenerMetadata( target, key ) ?? [];
    const datas = Array.isArray( data ) ? data : [ data ];
    metadata.push( ...datas );
    Reflect.defineMetadata( LISTENER_METADATA_KEY, metadata, target, key );
}
