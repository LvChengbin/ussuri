/******************************************************************
 * Copyright (C) 2022 LvChengbin
 *
 * File: test/controller.spec.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 05/10/2022
 * Description:
 ******************************************************************/

import { callClassBeforeInterceptor } from '@ussuri/testing';
import { Controller, Context } from '../src';
import { application } from './fixtures/application';

describe( '@Controller decorator', () => {
    it( 'no specific path', async () => {
        const context = new Context( { service : application } );
        await callClassBeforeInterceptor( Controller(), context );
        expect( context.options.path ).toEqual( '/' );
    } );

    it( 'with specific path', async () => {
        const path = '/path';
        const context = new Context( { service : application } );
        await callClassBeforeInterceptor( Controller( path ), context );
        expect( context.options.path ).toEqual( path );
    } );

    it( 'no duplicate slashed', async () => {
        const path = '/path';
        const context = new Context( { service : application, path : '/' } );
        await callClassBeforeInterceptor( Controller( path ), context );
        expect( context.options.path ).toEqual( path );
    } );

    it( 'append into existing path', async () => {
        const path = '/path';
        const context = new Context( { service : application, path : '/prefix' } );
        await callClassBeforeInterceptor( Controller( path ), context );
        expect( context.options.path ).toEqual( '/prefix/path' );
    } );

} );
