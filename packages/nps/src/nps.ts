/******************************************************************
 * Copyright (C) 2022 LvChengbin
 *
 * File: src/nps.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 05/18/2022
 * Description:
 ******************************************************************/

import { Class } from 'type-fest';
import { Application, ApplicationOptions } from '@ussuri/core';
import { ServiceType } from './service-type.enum';

export type Domain = string;

export interface RegistryItem {
    application: Class<Application>;
}

export interface NPSServiceOptions {
    serviceType: ServiceType.NPS;
    serviceName: string;
    registeredName?: string | symbol;
    providers?: ApplicationOptions[ 'providers' ];
    start?: boolean;
}

export interface HTTPServiceOptions {
    serviceType: ServiceType.HTTP;
    address: string;
    port?: number;
}

export type ServiceOptions =
    | NPSServiceOptions
    | HTTPServiceOptions;

export type NPSServiceItem =
    & NPSServiceOptions
    & {
        application: Application;
    };

export type HTTPServiceItem = HTTPServiceOptions;

export type ServiceItem =
    | NPSServiceItem
    | HTTPServiceItem;


export class NPS {

    static #config?: Record<Domain, ServiceOptions> | null = null;

    static injected = false;

    static services: Record<Domain, ServiceItem> = {};

    static registry: Record<string, RegistryItem> = {};

    static inject(): void {
        NPS.injected = true;
    }

    static uninject(): void {
        NPS.injected = false;
    }

    static register( name: string, options: Class<Application> | RegistryItem ): void {
        if( typeof options === 'function' ) {
            options = { application : options };
        }
        NPS.registry[ name ] = options as RegistryItem;
    }

    static set config( config: Record<Domain, ServiceOptions> | null ) {

        /**
         * While new config is adding, all old services should be destroyed.
         */
        NPS.services = {};
        const { registry } = NPS;

        config && Object.keys( config ).forEach( ( domain: Domain ) => {

            const configItem = config[ domain ];

            switch( configItem.serviceType ) {
                case ServiceType.NPS : {
                    const { serviceName, providers } = configItem;

                    const service = registry[ serviceName ];

                    if( !service ) {
                        throw new Error( `Service "${serviceName}" is not registered.` );
                    }

                    const application = new service.application( { providers } );

                    NPS.services[ domain ] = { ...configItem, application };

                    if( configItem.start ) {
                        application.start();
                    }
                    break;
                }
                case ServiceType.HTTP : {
                    NPS.services[ domain ] = { ...configItem };
                }
            }
        } );

        NPS.#config = config;
    }

    static get config(): Record<Domain, ServiceOptions> | null {
        return this.#config ?? null;
    }

    static service( domain: Domain ): ServiceItem | null {
        if( !NPS.injected ) return null;
        return NPS.services[ domain ] ?? null;
    }
}
