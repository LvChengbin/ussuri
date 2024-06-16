/******************************************************************
 * Copyright (C) 2022 LvChengbin
 *
 * File: interceptor/before.spec.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 05/11/2022
 * Description:
 ******************************************************************/

import { createDecoratorBefore } from '@ussuri/method-interceptor';
import { callClassBeforeInterceptor, callMethodBeforeInterceptor } from '../../src/interceptor';

describe( 'interceptor before', () => {
    it( 'interceptor of class decorator', async () => {
        const fn = jest.fn( () => 'abc' );
        const data = { property : 'x' };
        const decorator = createDecoratorBefore( fn, { data } );
        const context = {};
        const res = await callClassBeforeInterceptor( decorator, context );
        expect( fn ).toHaveBeenCalledTimes( 1 );
        expect( res ).toEqual( [ 'abc' ] );
    } );

    it( 'interceptor of method decorator', async () => {
        const fn = jest.fn( () => 'abc' );
        const data = { property : 'x' };
        const decorator = createDecoratorBefore( fn, { data } );
        const context = {};
        const res = await callMethodBeforeInterceptor( decorator, context );
        expect( fn ).toHaveBeenCalledTimes( 1 );
        expect( res ).toEqual( [ 'abc' ] );
    } );
} );
