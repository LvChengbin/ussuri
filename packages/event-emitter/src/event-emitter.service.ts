/******************************************************************
 * Copyright (C) 2022 LvChengbin
 *
 * File: src/event-emitter.service.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 10/13/2022
 * Description:
 ******************************************************************/

import 'reflect-metadata';
import { EventEmitter2 } from 'eventemitter2';
import { Application } from '@ussuri/core';
import { Injectable } from '@ussuri/injection';
import { getListenerMetadata } from './metadata';

@Injectable()
export class EventEmitterService {

    constructor( private eventemitter: EventEmitter2 ) {}

    onApplicationBootstrap( application: Application ): void {
        const providers = application.injection.getClassProviders();

        providers.forEach( provider => {

            const proto = provider.useClass.prototype;
            const methods = Object.getOwnPropertyNames( proto );

            methods.forEach( ( method ) => {
                if( typeof proto[ method ] !== 'function' ) return;
                const metadata = getListenerMetadata( proto, method );

                metadata?.forEach( ( data ) => {
                    const { event, options = {} } = data;
                    this.eventemitter.on( event, async ( ...args: any[] ) => {
                        try {
                            const instance = application.service( provider.provide );
                            await instance[ method ]( ...args );
                        } catch( e: unknown ) {
                            // eslint-disable-next-line no-console
                            console.error( `Error on ${String( event )} event:`, e );
                        }
                    }, options );
                } );
            } );
        } );
    }

    onApplicationShutdown(): void {
        this.eventemitter.removeAllListeners();
    }
}
