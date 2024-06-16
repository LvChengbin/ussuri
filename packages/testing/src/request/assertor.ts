/******************************************************************
 * Copyright (C) 2022 LvChengbin
 *
 * File: request/assertion.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 05/11/2022
 * Description:
 ******************************************************************/

import {
    Assertion,
    ResponseAssertion, ResponseAssertionHandler,
    StatusAssertion, Status, Message,
    HeadersAssertion, HeadersAssertionValue,
    BodyAssertion, Body
} from './assertions';

export class Assertor implements PromiseLike<any> {

    #assertions: Assertion[] = [];
    protected context: any;

    constructor( context?: any ) {
        if( context !== undefined ) {
            this.context = context;
        }
    }

    async end(): Promise<any> {
        const data = await Promise.resolve( this.context );

        this.#assertions.forEach( assertion => {
            assertion.assert( data );
        } );

        return data;
    }

    inspect( options?: { depth?: number } ): this {
        return this.expectResponse( response => {
            // eslint-disable-next-line no-console
            console.dir( response, { depth : null, colors : true, ...options ?? {} } );
        } );
    }

    expect( status: Status, text?: Message ): this;
    /**
     * Verify JSON format body
     *
     * @example
     *
     * ```ts
     * expect( { status : 0, data : {} } )
     * ```
     */
    expect( body: Body ): this;
    /**
     * Verify request header
     *
     * @example
     *
     * ```ts
     * expect( 'content-type', 'application/json' );
     * expect( 'content-type', /application\/json/ );
     * expect( 'content-type', expect.stringMatching( 'application/json' ) );
     * expect( 'content-length', 12345 );
     * expect( 'vary', [ 'Accept-Encoding', 'Origin' ] )
     * ```
     */
    expect( field: string, value: HeadersAssertionValue ): this;
    expect( fn: ResponseAssertionHandler ): this;
    expect( ...args: [ Status | Body | ResponseAssertionHandler, ( Message | HeadersAssertionValue )? ] ): this {

        const [ a, b ] = args;

        if( typeof a === 'function' ) {
            return this.expectResponse( a as ResponseAssertionHandler );
        }

        if( typeof a === 'number' ) {
            return this.expectStatus( ...args as [ Status, Message? ] );
        }

        if( typeof a === 'string' && b !== undefined ) {
            return this.expectHeaders( ...args as [ string, HeadersAssertionValue ] );
        }

        return this.expectBody( a );
    }

    expectResponse( fn: ResponseAssertionHandler ): this {
        this.#assertions.push( new ResponseAssertion( fn ) );
        return this;
    }

    expectStatus( status: number, text?: Message ): this {
        this.#assertions.push( new StatusAssertion( status, text ) );
        return this;
    }

    expectHeaders( headers: Record<string, unknown> ): this;
    expectHeaders( field: string, value: HeadersAssertionValue ): this;
    expectHeaders( field: string | Record<string, unknown>, value?: HeadersAssertionValue ): this {
        if( typeof field === 'string' ) {
            this.#assertions.push( new HeadersAssertion( field, value ?? '' ) );
        } else {
            this.#assertions.push( new HeadersAssertion( field ) );
        }
        return this;
    }

    expectBody( body: Body ): this {
        this.#assertions.push( new BodyAssertion( body ) );
        return this;
    }

    async then(
        onfulfilled?: ( context: any ) => any,
        onrejected?: ( e: Error ) => any
    ): Promise<any> {
        return this.end().then( onfulfilled, onrejected );
    }

    async catch( onrejected?: ( e: Error ) => any ): Promise<any> {
        return this.end().catch( onrejected );
    }
}
