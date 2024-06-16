/******************************************************************
 * Copyright (C) 2022 LvChengbin
 *
 * File: interceptor/parameter.spec.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 05/16/2022
 * Description:
 ******************************************************************/

import { createDecoratorParameter } from '@ussuri/method-interceptor';
import { callParameterInterceptor } from '../../src/interceptor';

describe( 'interceptor parameter', () => {
    it( 'interceptor of method decorator', async () => {
        const fn = jest.fn( () => 'abc' );
        const data = { property : 'x' };
        const decorator = createDecoratorParameter( fn, { data } );
        const context = {};
        const res = await callParameterInterceptor( decorator, context );
        expect( fn ).toHaveBeenCalledTimes( 1 );
        expect( res ).toEqual( [ 'abc' ] );
    } );
} );
