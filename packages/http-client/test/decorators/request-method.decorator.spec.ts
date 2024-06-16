/******************************************************************
 * Copyright (C) 2022 LvChengbin
 *
 * File: decorators/request-method.decorator.spec.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 05/11/2022
 * Description:
 ******************************************************************/

import { callMethodBeforeInterceptor } from '@ussuri/testing';
import { Method, Context, Get, Post, Head, Put, Delete, Patch, Options, Purge, Link, Unlink } from '../../src';
import { application } from '../fixtures/application';

const methods = {
    GET : Get,
    POST : Post,
    HEAD : Head,
    PUT : Put,
    DELETE : Delete,
    PATCH : Patch,
    OPTIONS : Options,
    PURGE : Purge,
    LINK : Link,
    UNLINK : Unlink
};

describe( 'Method decorators', () => {
    it( 'no specific path', async () => {
        const context = new Context( { service : application } );
        await callMethodBeforeInterceptor( Method( { method : 'get' } ), context );
        const { options } = context;
        expect( options.path ).toEqual( '/' );
        expect( options.method ).toEqual( 'GET' );
    } );

    it( 'with specific path', async () => {
        const path = '/path';
        const context = new Context( { service : application } );
        await callMethodBeforeInterceptor( Method( { method : 'post', path } ), context );
        const { options } = context;
        expect( options.path ).toEqual( path );
        expect( options.method ).toEqual( 'POST' );
    } );

    it( 'no duplicate slashed', async () => {
        const path = '/path';
        const context = new Context( { service : application, path : '/' } );
        await callMethodBeforeInterceptor( Method( { method : 'put', path } ), context );
        const { options } = context;
        expect( options.path ).toEqual( path );
        expect( options.method ).toEqual( 'PUT' );
    } );

    it( 'append into existing path', async () => {
        const path = '/path';
        const context = new Context( { service : application, path : '/prefix' } );
        await callMethodBeforeInterceptor( Method( { method : 'delete', path } ), context );
        const { options } = context;
        expect( options.path ).toEqual( '/prefix/path' );
        expect( options.method ).toEqual( 'DELETE' );
    } );

    Object.keys( methods ).forEach( method => {

        const decorator = methods[ method ];

        describe( `@${method.replace( /(?<=\w)[A-Z]/g, m => m.toLowerCase() )}()`, () => {

            it( 'no specific path', async () => {
                const context = new Context( { service : application } );
                await callMethodBeforeInterceptor( decorator(), context );
                const { options } = context;
                expect( options.path ).toEqual( '/' );
                expect( options.method ).toEqual( method );
            } );

            it( 'with specific path', async () => {
                const path = '/path';
                const context = new Context( { service : application } );
                await callMethodBeforeInterceptor( decorator( path ), context );
                const { options } = context;
                expect( options.path ).toEqual( path );
                expect( options.method ).toEqual( method );
            } );

            it( 'no duplicate slashed', async () => {
                const path = '/path';
                const context = new Context( { service : application, path : '/' } );
                await callMethodBeforeInterceptor( decorator( path ), context );
                const { options } = context;
                expect( options.path ).toEqual( path );
                expect( options.method ).toEqual( method );
            } );

            it( 'append into existing path', async () => {
                const path = '/path';
                const context = new Context( { service : application, path : '/prefix' } );
                await callMethodBeforeInterceptor( decorator( path ), context );
                const { options } = context;
                expect( options.path ).toEqual( '/prefix/path' );
                expect( options.method ).toEqual( method );
            } );
        } );
    } );
} );
