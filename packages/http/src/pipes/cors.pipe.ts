/******************************************************************
 * Copyright (C) 2022 LvChengbin
 *
 * File: pipes/cors.pipe.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 06/13/2022
 * Description:
 ******************************************************************/

import url from 'node:url';
import { Injectable, Inject, Optional } from '@ussuri/injection';
import { PipeTransformConstructor } from '@ussuri/core';
import { Context } from '../context';

type OriginPattern =
    | string
    | RegExp;

export interface CorsWhitelistItem {
    pattern: OriginPattern;
    origin?: string;
    credentials?: boolean;
    maxAge?: number;
    allowMethods?: string | string[];
    allowHeaders?: string | string[];
    exposeHeaders?: string | string[];
    secureContext?: boolean;
}

export type CorsWhitelist = ( OriginPattern | CorsWhitelistItem )[];

export interface CorsOptions {
    whitelist?: CorsWhitelist;
    credentials?: boolean;
    pna?: boolean;
    maxAge?: number;
    allowMethods?: string | string[];
    allowHeaders?: string | string[];
    exposeHeaders?: string | string[];
    secureContext?: boolean;
    addPrivateNetworkIntoWhitelist?: boolean;
}

const defaultOptions: CorsOptions = {
    allowMethods : 'GET,HEAD,PUT,POST,DELETE,PATCH',
    credentials : false,
    pna : true,
    secureContext : false,
    addPrivateNetworkIntoWhitelist : true
};

export function Cors( opts: CorsOptions | CorsWhitelist = {} ): PipeTransformConstructor {

    let options: CorsOptions;

    if( Array.isArray( opts ) || typeof opts === 'string' || opts instanceof RegExp ) {
        options = { whitelist : opts as CorsWhitelist };
    } else {
        options = { ...opts };
    }

    @Injectable()
    class Cors {

        allowMethods?: string;
        allowHeaders?: string;
        exposeHeaders?: string;
        whitelist: CorsWhitelistItem[];
        credentials: boolean;
        pna: boolean;
        secureContext: boolean;
        addPrivateNetworkIntoWhitelist: boolean;

        constructor( @Optional() @Inject( '$CORS_CONFIG' ) private injectedConfig?: CorsOptions ) {

            const config = {
                ...defaultOptions,
                ...injectedConfig ?? options
            } as Required<CorsOptions>;

            this.credentials = config.credentials;
            this.pna = config.pna;
            this.secureContext = config.secureContext;
            this.addPrivateNetworkIntoWhitelist = config.addPrivateNetworkIntoWhitelist;

            if( config.allowMethods ) {
                if( Array.isArray( config.allowMethods ) ) {
                    this.allowMethods = config.allowMethods.join( ',' );
                } else {
                    this.allowMethods = config.allowMethods;
                }
            }

            if( config.allowHeaders ) {
                if( Array.isArray( config.allowHeaders ) ) {
                    this.allowHeaders = config.allowHeaders.join( ',' );
                } else {
                    this.allowHeaders = config.allowHeaders;
                }
            }

            if( config.exposeHeaders ) {
                if( Array.isArray( config.exposeHeaders ) ) {
                    this.exposeHeaders = config.exposeHeaders.join( ',' );
                } else {
                    this.exposeHeaders = config.exposeHeaders;
                }
            }

            this.whitelist = options.whitelist?.map( item => {

                const o = {
                    credentials : this.credentials,
                    secureContext : this.secureContext,
                    addPrivateNetworkIntoWhitelist : this.addPrivateNetworkIntoWhitelist,
                    allowMethods : this.allowMethods,
                    allowHeaders : this.allowHeaders,
                    exposeHeaders : this.exposeHeaders
                };

                if( typeof item === 'string' || item instanceof RegExp ) {
                    return { pattern : item, ...o };
                }

                item = { ...item };
                const { allowMethods, allowHeaders, exposeHeaders } = item;

                if( Array.isArray( allowMethods ) ) {
                    item.allowMethods = allowMethods.join( ',' );
                }

                if( Array.isArray( allowHeaders ) ) {
                    item.allowHeaders = allowHeaders.join( ',' );
                }

                if( Array.isArray( exposeHeaders ) ) {
                    item.exposeHeaders = exposeHeaders.join( ',' );
                }

                return { ...o, ...item };
            } ) ?? [];

        }

        transform<T = any>( value: T, context: Context ): T {
            context.vary?.( 'Origin' );
            const requestOrigin = context.get?.( 'Origin' );
            if( !requestOrigin ) return value;

            const parsed = url.parse( requestOrigin );

            const haystack = [
                parsed.hostname,
                parsed.host,
                `${parsed.protocol}//${parsed.host}`,
                `${parsed.protocol}//${parsed.hostname}`
            ];

            let matched: CorsWhitelistItem | null = null;

            for( const item of this.whitelist ) {
                const { pattern } = item;

                if( typeof pattern === 'string' ) {
                    if( haystack.includes( pattern ) ) {
                        matched = item;
                        break;
                    }
                    continue;
                }

                if( pattern.test( requestOrigin ) ) matched = item;
            }

            if( !matched ) return value;

            context.set( 'Access-Control-Allow-Origin', matched.origin ?? requestOrigin );

            if( matched.credentials ) {
                context.set( 'Access-Control-Allow-Credentials', 'true' );
            }

            if( matched.secureContext ) {
                context.set( 'Cross-Origin-Opener-Policy', 'same-origin' );
                context.set( 'Cross-Origin-Enbedder-Policy', 'request-corp' );
            }

            if( context.method === 'OPTIONS' ) {
                if( !context.get( 'Access-Control-Request-Method' ) ) {
                    return value;
                }

                if( matched.allowMethods ) {
                    context.set( 'Access-Control-Allow-Methods', matched.allowMethods );
                }

                const allowHeaders = matched.allowHeaders ?? context.get( 'Access-Control-Request-Headers' );

                if( allowHeaders ) {
                    context.set( 'Access-Control-Allow-Headers', allowHeaders );
                }

                if( matched.maxAge ) {
                    context.set( 'Access-Control-Max-Age', matched.maxAge );
                }

                if( options.pna && context.get( 'Access-Control-Request-Private-Network' ) ) {
                    context.set( 'Access-Control-Allow-Private-Network', 'true' );
                }

                context.status = 204;
            } else {
                if( matched.exposeHeaders ) {
                    context.set( 'Access-Control-Expose-Headers', matched.exposeHeaders );
                }
            }

            return value;
        }
    }

    return Cors;
}
