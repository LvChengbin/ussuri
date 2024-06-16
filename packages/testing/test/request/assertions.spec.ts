/******************************************************************
 * Copyright (C) 2022 LvChengbin
 *
 * File: request/assertions.spec.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 04/15/2022
 * Description:
 ******************************************************************/

import { BodyAssertion, ResponseAssertion, HeadersAssertion, StatusAssertion } from '../../src/request/assertions';

describe( 'BodyAssertion', () => {
    it( 'testing with regular body', () => {
        const body = { id : 1 };
        const response = { body };
        const assertion = new BodyAssertion( body );
        assertion.assert( response );
    } );

    it( 'should throw error', () => {
        const body = { id : 1 };
        const assertion = new BodyAssertion( body );
        expect( () => {
            assertion.assert( {
                body : { id : 2 }
            } );
        } ).toThrow();
    } );

    it( 'testing with Jest AaymmetricMatcher', () => {
        const body = { id : 1, name : 'body' };
        const response = { body };
        const assertion = new BodyAssertion( expect.objectContaining( {
            name : 'body'
        } ) );
        assertion.assert( response );
    } );
} );


describe( 'ResponseAssertion', () => {
    it( 'should pass the full response as argument', () => {
        const response = {
            body : 'body'
        };
        const fn = jest.fn();
        const assertion = new ResponseAssertion( fn );
        assertion.assert( response );
        expect( fn ).toHaveBeenCalledWith( response );
    } );
} );

describe( 'HeadersAssertion', () => {
    const response = {
        headers : {
            'Content-Type' : 'application/json',
            'X-Custom-Id' : '123'
        }
    };

    it( 'should check object containing instead of strict equal', () => {
        const assertion = new HeadersAssertion( {
            'X-Custom-Id' : '123'
        } );
        expect( () => { assertion.assert( response ) } ).not.toThrow();
    } );

    it( 'check specific item', () => {
        const assertion = new HeadersAssertion( 'X-Custom-Id', '123' );
        expect( () => { assertion.assert( response ) } ).not.toThrow();
    } );

    it( 'header assertion should be case-insensitive', () => {
        {
            const assertion = new HeadersAssertion( {
                'X-CUSTOM-ID' : '123'
            } );
            expect( () => { assertion.assert( response ) } ).not.toThrow();
        }
        {
            const assertion = new HeadersAssertion( 'X-Custom-Id', '123' );
            expect( () => { assertion.assert( response ) } ).not.toThrow();
        }
    } );
} );

describe( 'StatusAssertion', () => {

    const response = {
        status : 200,
        statusText : 'Great'
    };

    it( 'check status', () => {
        const assertion = new StatusAssertion( 200 );
        expect( () => { assertion.assert( response ) } ).not.toThrow();
    } );

    it( 'check message', () => {
        const assertion = new StatusAssertion( 200, 'Great' );
        expect( () => { assertion.assert( response ) } ).not.toThrow();
    } );
} );
