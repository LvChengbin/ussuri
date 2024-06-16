/******************************************************************
 * Copyright (C) 2022 LvChengbin
 *
 * File: decorators/transform.decorator.spec.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 10/29/2022
 * Description:
 ******************************************************************/

import { callMethodAfterInterceptor } from '@ussuri/testing';
import { Transform } from '../../src';

interface TestOptions {
    res: any;
    property: string;
    data: any;
    pipe?: Function;
    spread?: boolean;
}

async function test( options: TestOptions ): Promise<void> {

    const {
        res, property, data,
        pipe = jest.fn(),
        spread = false
    } = options;
    const context = { context : true };

    const action = property ? Transform( property, pipe ) : Transform( pipe );

    await callMethodAfterInterceptor( action, res, context );

    const args = {
        interceptorType : 'after',
        method : expect.any( Function ),
        data : {
            pipes : [ pipe ],
            property
        }
    };


    if( spread ) {
        data.forEach( ( item: any, i: number ): void => {
            expect( pipe ).toHaveBeenCalledTimes( 2 );
            expect( pipe ).toHaveBeenNthCalledWith( i + 1, item, context, undefined, args );
        } );
        return;
    }

    expect( pipe ).toHaveBeenCalledTimes( 1 );
    expect( pipe ).toHaveBeenCalledWith( data, context, undefined, args );
}

describe( '@Transform()', () => {
    describe( 'data extraction', () => {
        it( 'transform the whole response data.', async () => {
            const res = { x : 1 };
            await test( { res, data : res } );
        } );

        describe( 'extract data with simple path without brackets ([])', () => {
            it( 'x', async () => {
                const res = { x : 1 };
                await test( { res, property : 'x', data : res.x } );
            } );

            it( 'x.y', async () => {
                const res = { x : { y : 2 } };
                await test( { res, property : 'x.y', data : res.x.y } );
            } );

            it( 'list', async () => {
                const res = { list : [ 1, 2 ] };
                await test( { res, property : 'list', data : res.list } );
            } );
        } );

        describe( 'extract data with path with brackets', () => {
            it( 'list[]', async () => {
                const res = { list : [ 1, 2 ] };
                await test( {
                    res,
                    property : 'list[]',
                    data : res.list,
                    spread : true
                } );
            } );

            it( 'list[ ]', async () => {
                const res = { list : [ 1, 2 ] };
                await test( {
                    res,
                    property : 'list[ ]',
                    data : res.list,
                    spread : true
                } );
            } );

            it( 'list[][]', async () => {
                const res = { list : [ [ 1, 2 ] ] };
                await test( {
                    res,
                    property : 'list[][]',
                    data : res.list[ 0 ],
                    spread : true
                } );
            } );

            it( 'list[][]', async () => {
                const res = {
                    list : [
                        [
                            { x : 1 },
                            { x : 2 }
                        ]
                    ]
                };
                await test( {
                    res,
                    property : 'list[][].x',
                    data : [ 1, 2 ],
                    spread : true
                } );
            } );

            it( 'list[0]', async () => {
                const res = { list : [ 1 ] };
                await test( {
                    res,
                    property : 'list[0]',
                    data : 1
                } );
            } );

            it( 'list[ 0 ]', async () => {
                const res = { list : [ 1 ] };
                await test( {
                    res,
                    property : 'list[ 0 ]',
                    data : 1
                } );
            } );
        } );
    } );
} );

