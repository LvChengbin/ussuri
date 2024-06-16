/******************************************************************
 * Copyright (C) 2022-2023 NextSeason
 *
 * @File: node/index.ts
 *
 * This file is part of NextSeason projects.
 * Code in this file can not be copied and/or distributed without the
 * express permission of NextSeason. Inc
 ******************************************************************/

import { NPS, ServiceType } from '@ussuri/nps';
import { Application } from '@ussuri/core';
import { Application as HttpApplication, ContextOptions, RequestMethod, HTTP_REGISTERED_SERVER_NAME } from '@ussuri/http';
import { isRequestWithPayload } from '../../utils';
import { RequestOptions } from '../../interfaces';
import { ResponseData } from '../../response';
import { request as httpRequest } from '../browser';

const BASE_URL = 'http://127.0.0.1';

async function send( application: Application, options: RequestOptions ): Promise<ResponseData> {
    const url = options.url ? new URL( options.url, BASE_URL ) : new URL( BASE_URL );
    const { query } = options;

    query && Object.keys( query ).forEach( name => {
        url.searchParams.set( name, query[ name ] );
    } );

    const config: ContextOptions[ 'request' ] = {
        url : url.href,
        method : options.method ?? 'GET',
        headers : options.headers
    };

    if( 'data' in options && isRequestWithPayload( config.method as RequestMethod ) ) {
        config.body = options.data;
    }

    const { response } = application instanceof HttpApplication
        ? await application.http( { request : config } )
        : await application.handle( HTTP_REGISTERED_SERVER_NAME, {
            request : config
        } );

    return {
        body : response.body,
        status : response.status,
        statusText : response.statusText,
        headers : response.headers
    };
}

export async function request( options: RequestOptions ): Promise<ResponseData> {
    const { service } = options;

    if( typeof service === 'string' ) {
        const url = new URL( service );
        const hostname = url.hostname;
        const nps = NPS.service( hostname );

        if( nps ) {
            switch( nps.serviceType ) {
                case ServiceType.NPS : {
                    return send( nps.application, options );
                }
                case ServiceType.HTTP : {
                    url.hostname = nps.address;
                    nps.port && ( url.port = String( nps.port ) );
                    return httpRequest( options );
                }
            }
        }
        return httpRequest( options );
    } else if( service instanceof Application ) {
        return send( service, options );
    }

    return httpRequest( options );
}
