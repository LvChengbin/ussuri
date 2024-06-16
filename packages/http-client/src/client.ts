/******************************************************************
 * Copyright (C) 2022 LvChengbin
 *
 * File: src/client.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 05/08/2022
 * Description:
 ******************************************************************/

import { createInterceptorBefore, createInterceptorAfter, createInterceptorException, createInterceptorParameter } from '@ussuri/method-interceptor';
import { Application, ApplicationOptions, ControllerClass } from '@ussuri/core';
import { getControllerMetadata } from '@ussuri/core/controller';
import { getActionMetadatas } from '@ussuri/core/action';
import { Context } from './context';
import { ControllerItem, ControllerMetadata, RequestOptions } from './interfaces';
import { request } from './request';
import { Response } from './response';
import { mergeOptions, lowerCaseFirstLetter } from './utils';

export interface ClientOptions extends ApplicationOptions<Context> {
    requestOptions: RequestOptions;
}

export interface RequestHandler<T = any, K = object> {
    ( data?: K, options?: RequestOptions ): Promise<Response<T>>;
}

export type API<T extends Record<string, Record<string, any>>> =
    & {
        [ P in keyof T ]: {
            [ K in keyof T[ P ] ]:
                T[ P ][ K ] extends ( ...args: any[] ) => any
                    ? T[ P ][ K ]
                    : T[ P ][ K ] extends [ any, any ]
                        ? RequestHandler<T[ P ][ K ][ 0 ], T[ P ][ K ][ 1 ]>
                        : RequestHandler<T[ P ][ K ]>;
        };
     }
    & Record<string, Record<string, RequestHandler>>;

/**
 * @example
 *
 * ```ts
 * new Client( 'http://192.168.0.1:8080' )
 * new Client( 'https://api.example.com' )
 * new Client( 'http://sample.service', options );
 * new Client( options );
 * ```
 */
export class Client<T extends Record<string, Record<string, any>> = any> extends Application {

    static request = request;

    requestOptions: RequestOptions;

    api = {} as API<T>;

    protected $: Record<string, Record<string, RequestHandler>> = {};

    constructor( options: string | URL | Application | ClientOptions ) {
        const opts: ClientOptions = typeof options === 'string' || options instanceof Application
            ? { requestOptions : { service : options } }
            : options instanceof URL
                ? { requestOptions : { service : options.toString() } }
                : { ...options };

        super( opts );

        this.requestOptions = opts.requestOptions ?? {};
        this.setupApis();
    }

    protected setupHandlers(): void {
        const { injection, handlers } = this;
        this.controllers.forEach( ( controller: ControllerClass | ControllerItem ) => {
            const controllerClass = typeof controller === 'function' ? controller : controller.useClass;
            const controllerInterceptorBefore = createInterceptorBefore( controllerClass );
            const controllerInterceptorAfter = createInterceptorAfter( controllerClass );
            const controllerInterceptorException = createInterceptorException( controllerClass );
            const proto = controllerClass.prototype;
            const actionMetadatas = getActionMetadatas( proto );
            const actions: Record<string, ( context: Context ) => unknown> = {};

            actionMetadatas && Object.keys( actionMetadatas ).forEach( ( name: string ) => {
                const descriptor = Object.getOwnPropertyDescriptor( proto, name ) as PropertyDescriptor;

                const before = createInterceptorBefore( descriptor );
                const after = createInterceptorAfter( descriptor );
                const exception = createInterceptorException( descriptor );
                const parameter = createInterceptorParameter<[ Context, Application<Context> ]>( proto, name );

                actions[ name ] = async ( context: Context ): Promise<unknown> => {
                    try {
                        const instance = injection.instantiate( controllerClass );
                        await controllerInterceptorBefore( context, this );

                        let output;

                        try {
                            await before( context, this );
                            const params = await parameter( context, this );
                            output = await instance[ name ]( ...params );

                            switch( true ) {
                                case output === undefined :
                                    /**
                                     * Send the request automatically
                                     */
                                    output = await Client.request( context.options );
                                    break;
                                default :
                                    /**
                                     * Regard the output as response
                                     */
                                    break;
                            }
                            output = await after( output, context, this );
                        } catch( e: unknown ) {
                            return await exception( e, context, this );
                        }

                        return await controllerInterceptorAfter( output, context, this );

                    } catch( e: unknown ) {
                        return controllerInterceptorException( e, context, this );
                    }
                };
            } );

            handlers.set( controllerClass, actions );
        } );
    }

    protected setupApis(): void {

        const { $, api } = this;

        this.controllers.forEach( ( controller: ControllerClass | ControllerItem ) => {
            const controllerClass = typeof controller === 'function' ? controller : controller.useClass;
            const controllerMetadata = getControllerMetadata( controllerClass ) as ControllerMetadata;
            const controllerName = lowerCaseFirstLetter( controllerMetadata.name ?? controllerClass.name.replace( /Controller.*$/, '' ) );
            const proto = controllerClass.prototype;
            const actionMetadatas = getActionMetadatas( proto );

            $[ controllerName ] = {};
            ( api as any )[ controllerName ] ??= {};

            actionMetadatas && Object.keys( actionMetadatas ).forEach( ( name: string ) => {

                const fn = async ( payload?: any, options: RequestOptions = {} ): Promise<any> => {
                    const context = new Context( mergeOptions( { ...options, payload }, this.requestOptions ) );
                    return this.call( controllerClass, name, context );
                };

                $[ controllerName ][ name ] = fn;
                ( api as any )[ controllerName ][ name ] ??= fn;
            } );
        } );
    }
}
