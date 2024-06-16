/******************************************************************
 * Copyright (C) 2022 LvChengbin
 *
 * File: decorators/body.decorator.spec.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 05/16/2022
 * Description:
 ******************************************************************/

import { callMethodBeforeInterceptor } from '@ussuri/testing';
import { Context, Body } from '../../src';

describe( '@Body()', () => {
    describe( 'Using as a method decorator', () => {
        it( 'pass the whole request body to pipe functions', async () => {
            const context = new Context( {
                request : { method : 'POST', body : { id : 1 } }
            } );

            const pipe = jest.fn();

            await callMethodBeforeInterceptor( Body( pipe ), context );

            expect( pipe ).toHaveBeenCalledWith( context.request.body, context, undefined, {
                interceptorType : 'before',
                method : expect.any( Function ),
                data : {
                    pipes : [ pipe ],
                    property : undefined
                }
            } );
        } );

        it( 'just pass the specific property', async () => {
            const context = new Context( {
                request : { body : { id : 1 } }
            } );

            const pipe = jest.fn();

            await callMethodBeforeInterceptor( Body( 'id', pipe ), context );

            expect( pipe ).toHaveBeenCalledWith( context.request.body.id, context, undefined, {
                interceptorType : 'before',
                method : expect.any( Function ),
                data : { pipes : [ pipe ], property : 'id' }
            } );
        } );

    } );
} );
