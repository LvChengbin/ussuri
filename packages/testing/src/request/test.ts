/******************************************************************
 * Copyright (C) 2022 LvChengbin
 *
 * File: request/test.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 04/14/2022
 * Description:
 ******************************************************************/

import qs from 'qs';
import { ApplicationLike } from './interfaces';
import { Assertor } from './assertor';

type QueryValue =
    | string
    | number
    | ( string | number )[];

export interface TestOptions<T extends ApplicationLike> {
    application: T;
    baseUrl?: string | URL;
}

/**
 * @example
 *
 * ```ts
 * return request( application )
 *     .get( '/path' )
 *     .query( 'id', 1 )
 *     .set( 'content-type', 'application/json' )
 *     .send( {} )
 *     .expect( 200 )
 *     .expect( 'content-type', 'application/json' )
 *     .expect( 'ok' )
 * ```
 */

export class Test<T extends ApplicationLike = ApplicationLike> extends Assertor {

    application: T;
    baseUrl = new URL( 'http://127.0.0.1' );

    #method = 'GET';
    #path = '/';
    #type: string | null = null;
    #query: Record<string, QueryValue> = {};
    #headers: Record<string, string | string[]> = {};
    #payload: Record<string, string | number> = {};
    #response: Promise<any> | null = null;

    constructor( options: T | TestOptions<T> ) {
        super();
        if( 'http' in options || 'handle' in options ) {
            this.application = options;
        } else {
            this.application = options.application;
            options.baseUrl && ( this.baseUrl = new URL( options.baseUrl ) );
        }
    }

    async #request(): Promise<any> {

        if( this.#response ) return this.#response;

        const url = new URL( this.#path, this.baseUrl );

        Object.keys( this.#query ).forEach( key => {
            const value = this.#query[ key ];

            if( Array.isArray( value ) ) {
                value.forEach( item => {
                    url.searchParams.set( key, String( item ) );
                } );
            } else {
                url.searchParams.set( key, String( value ) );
            }
        } );

        const context: any = {
            request : {
                url : url.href,
                method : this.#method,
                headers : this.#headers
            }
        };

        if( ![ 'GET', 'HEAD' ].includes( this.#method ) ) {
            context.request.body = this.#payload;
        }

        const response = typeof this.application.http === 'function'
            ? this.application.http( context )
            : this.application.handle!( Symbol.for( 'http#registered#server#name' ), context );

        this.#response = response;
        return response;
    }

    async end(): Promise<any> {
        const { response } = await this.#request();
        this.context = response;
        return super.end();
    }

    type( value: string ): this {
        this.#type = value;
        return this;
    }

    set( field: Object ): this;
    set( field: string, value: string ): this;
    set( field: Object | string, value?: string ): this {
        if( typeof field === 'string' ) {
            this.#headers[ field ] = value ?? '';
        } else {
            Object.assign( this.#headers, field );
        }
        return this;
    }

    query( field: string, value: QueryValue ): this;
    query( query: string ): this;
    query( query: Record<string, QueryValue> ): this;
    query( field: string | Record<string, QueryValue>, value?: QueryValue ): this {
        if( typeof field === 'string' ) {
            if( value !== undefined ) {
                this.#query[ field ] = value;
            } else {
                Object.assign( this.#query, qs.parse( field ) );
            }
        } else {
            Object.assign( this.#query, field );
        }
        return this;
    }

    /**
     * @example
     *
     * ```ts
     * send( 'x=1&y=2' );
     *
     * send( {
     *    x : 1,
     *    y : 2
     * } );
     *
     * send( 'x', 1 );
     * ```
     */
    send( data: string ): this;
    send( field: string, value: string | number ): this;
    send( data: Object ): this;
    send( data: string | Object, value?: string | number ): this {
        if( typeof data === 'string' ) {
            if( value !== undefined ) {
                this.#payload[ data ] = value;
            } else {
                Object.assign( this.#payload, qs.parse( data ) );
            }
        } else {
            Object.assign( this.#payload, data );
        }
        return this;
    }

    get( path: string, query?: Record<string, string | string[]> ): this {
        this.#method = 'GET';
        this.#path = path;
        if( query ) this.query( query );

        return this;
    }

    post( path: string, payload?: string | Object ): this {
        this.#method = 'POST';
        this.#path = path;
        if( payload ) this.send( payload );
        return this;
    }

    delete( path: string ): this {
        this.#method = 'DELETE';
        this.#path = path;
        return this;
    }

    patch( path: string, payload?: string | Object ): this {
        this.#method = 'PATCH';
        this.#path = path;
        if( payload ) this.send( payload );
        return this;
    }

    put( path: string, payload?: string | Object ): this {
        this.#method = 'PUT';
        this.#path = path;
        if( payload ) this.send( payload );
        return this;
    }
}
