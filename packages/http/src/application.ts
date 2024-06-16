/******************************************************************
 * Copyright (C) 2022-2023 NextSeason
 *
 * @File: src/application.ts
 *
 * This file is part of NextSeason projects.
 * Code in this file can not be copied and/or distributed without the
 * express permission of NextSeason. Inc
 ******************************************************************/

import http, { Server, IncomingMessage, ServerResponse } from 'node:http';
import Stream from 'node:stream';
import minimist from 'minimist';
import statuses from 'statuses';
import { Broker } from '@ussuri/method-interceptor';
import { Application as Base, ApplicationOptions as Options, ControllerClass } from '@ussuri/core';
import { compose } from '@ussuri/core/utils';
import { getControllerMetadata } from '@ussuri/core/controller';
import { getActionMetadatas } from '@ussuri/core/action';
import { ControllerItem, ControllerMetadata, ActionMetadata } from './interfaces';
import { Context, ContextOptions } from './context';
import { Router, RouterRule, RouteMap, InternalRouteMap, ForwardRouteMap } from './router';
import { HttpException, NotFoundException } from './exceptions';
import { HttpStatus } from './enums';
import { ForwardBroker } from './brokers';
import { setResponse } from './utils/set-response';
import { escapeRegexp } from './utils/escape-regexp';

export interface ApplicationOptions<T extends Context = Context> extends Options<T> {

    /**
     * Use redefined ControllerItem to allow providing `path` for routing rules on the fly.
     */
    controllers?: ( ControllerClass | ControllerItem )[];

    /**
     * Customized router rules or callback function for adding customized router rules
     *
     * ```ts
     * {
     *    routers : [
     *        [ 'GET', '/user/:id/profile', 'user.profile' ]
     *        [ 'GET', '/user/:id/essays', {
     *            controller : UserController,
     *            action : 'essays'
     *        } ],
     *        [ 'POST', /^\/account\/.+/, ( context: Context ) => {
     *            context.path.repalce( /^\/account/, '' );
     *            return { module : 'user' };
     *        } ]
     *    ]
     * }
     * ```
     */
    routers?:
        | RouterRule<T>[]
        | ( ( this: Application<T>, router: Router<T>, app: Application<T> ) => RouterRule<T>[] | void );
}

export class Application<T extends Context = Context> extends Base<T> {

    static Application = Application;

    static get argv(): minimist.ParsedArgs {
        return minimist( process.argv );
    }

    httpRouter = new Router<T>();
    server?: Server;

    constructor( options: ApplicationOptions<T> = {} ) {
        super( options );
        this.#setupRoutings( options );
    }

    #setupRoutings( options: ApplicationOptions<T> ): void {

        const { httpRouter : router, controllers } = this;

        if( options?.routers ) {
            let routers: RouterRule<T>[];

            if( typeof options.routers === 'function' ) {
                routers = options.routers.call( this, router, this ) ?? [];
            } else routers = options.routers;

            routers.forEach( ( rule: RouterRule<T> ) => {
                router.any( ...rule );
            } );
        }

        controllers.forEach( ( controller: ControllerClass | ControllerItem ) => {
            const controllerClass = typeof controller === 'function' ? controller : controller.useClass;
            const controllerMetadata = getControllerMetadata( controllerClass );
            const proto = controllerClass.prototype;
            const actionMetadatas = getActionMetadatas( proto );

            actionMetadatas && Object.keys( actionMetadatas ).forEach( ( name: string | symbol ) => {
                const metadata = actionMetadatas[ name ] as ActionMetadata;
                const { method, path = '' } = metadata;
                const { path : prefix = '' } = controllerMetadata as ControllerMetadata;
                router.any( method, [ prefix, path ], {
                    controller : controllerClass,
                    action : name
                } );
            } );
        } );

        Object.keys( this.modules ).forEach( ( name: string ) => {
            const prefix = ( name.startsWith( '/' ) ? name : `/${name}` ).replace( /\/+$/, '' );

            router.any( '*', new RegExp( `${escapeRegexp( prefix )}(?:/.*)?` ), ( context: Context ) => {
                context.request.path = context.request.path.slice( prefix.length );
                return { module : name };
            } );
        } );
    }

    async http( options: T | ContextOptions ): Promise<T> {

        const context = new Context( options ) as T;
        const match = this.httpRouter.match( context );

        if( match === false ) {
            return this.#handle( context, async ( ctx ) => {
                if( !ctx.response.explicit_status ) {
                    throw new NotFoundException( `${context.path ?? ''} is not found.` );
                }
            } );
        }

        const { rule : [ , , dest ], params, matches } = match;

        let result: RouteMap;

        if( typeof dest === 'function' ) {
            const res = await dest( context, params, matches );
            if( !res ) return context;
            if( res instanceof Context ) return res as T;
            result = res as RouteMap;
        } else {
            result = dest as RouteMap;
        }

        if( 'module' in result ) {
            if( !this.modules[ result.module ] ) {
                return this.#handle( context, async ( ctx ) => {
                    if( !ctx.response.explicit_status ) {
                        throw new NotFoundException( `Module ${( result as ForwardRouteMap ).module} is not found.` );
                    }
                } );
            }
            return ( this.modules[ result.module ] as Application<T> ).http( context );
        }

        /**
         * Bind params and matches to context.
         */
        Object.assign( context, { params, matches } );

        const { controller, action } = result as InternalRouteMap;

        return this.#handle( context, async ( ctx: T ) => {
            return this.callHandler( controller, action, ctx );
        } );
    }

    async #handle( context: T, fn: ( context: T ) => Promise<unknown> ): Promise<T> {
        try {
            const response = await compose( this, context, fn );
            context = setResponse( response, context );
        } catch( e: unknown ) {
            if( e instanceof ForwardBroker ) {
                if( typeof e.value.handler === 'function' ) {
                    context = e.value.handler( context, this );
                }
                context.path = e.value.path;
                return this.http( context );
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
                console.error( 'application exception: ', e );
                context.status = HttpStatus.INTERNAL_SERVER_ERROR;
            }
        }
        return context;
    }

    listen( ...args: Parameters<Server[ 'listen' ]> ): Server {
        const server = http.createServer( this.callback.bind( this ) );
        server.listen( ...args );
        // const address = server.address();
        return ( this.server = server );
    }

    async callback( req: IncomingMessage, res: ServerResponse ): Promise<void> {
        const context = await this.http( {
            request : { req },
            response : { res }
        } as T );

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

        if( statuses.empty[ status ] || request.method === 'HEAD' || body === null ) {
            res.end();
            return;
        }

        if( body instanceof Stream ) {
            body.pipe( res );
            return;
        }

        if( body === undefined || body === null ) {
            res.end();
            return;
        }

        if( Buffer.isBuffer( body ) || typeof body === 'string' || typeof body === 'number' ) {
            res.end( body );
            return;
        }

        res.end( JSON.stringify( body ) );
    }
}
