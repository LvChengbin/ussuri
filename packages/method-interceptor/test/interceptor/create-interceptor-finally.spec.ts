/******************************************************************
 * Copyright (C) 2021 LvChengbin
 *
 * File: interceptor/create-interceptor-finally.spec.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 04/05/2021
 * Description:
 ******************************************************************/

import 'reflect-metadata';
import { createInterceptorFinally, KEY_FINALLY, MetadataFinally } from '../../src';
import { generateDescriptor } from '../helpers/util';

describe( 'interceptor/create-interceptor-finally', () => {
    it( 'should created a function', () => {
        expect( createInterceptorFinally( generateDescriptor() ) ).toBeInstanceOf( Function );
    } );

    it( 'should return a Promise object by the created function', () => {
        expect( createInterceptorFinally( generateDescriptor() )() ).toBeInstanceOf( Promise );
    } );

    it( 'should return a Promise object which resolves with empty', async () => {
        return expect( createInterceptorFinally( generateDescriptor() )() ).resolves.toEqual();
    } );

    it( 'should have called the corresponding methods in storage', async () => {
        const descriptor = generateDescriptor();
        const fn = jest.fn();
        const metadata: MetadataFinally[] = [ {
            method : fn,
            interceptorType : 'finally'
        } ];

        Reflect.defineMetadata( KEY_FINALLY, metadata, descriptor.value );
        await createInterceptorFinally( descriptor )();
        expect( fn ).toHaveBeenCalledTimes( 1 );
    } );

    it( 'should have called methods with default arguments', async () => {
        const descriptor = generateDescriptor();
        const fn = jest.fn();
        const metadata: MetadataFinally[] = [ {
            method : fn,
            interceptorType : 'finally'
        } ];

        Reflect.defineMetadata( KEY_FINALLY, metadata, descriptor.value );
        await createInterceptorFinally( descriptor )();
        expect( fn ).toHaveBeenCalledWith( {
            interceptorType : 'finally',
            method : fn
        } );
    } );

    it( 'should have called methods with given arguments', async () => {
        const descriptor = generateDescriptor();
        const fn = jest.fn();
        const metadata: MetadataFinally[] = [ {
            method : fn,
            interceptorType : 'finally'
        } ];

        Reflect.defineMetadata( KEY_FINALLY, metadata, descriptor.value );
        await createInterceptorFinally<[ number, string ]>( descriptor )( 1, 'interceptor' );
        expect( fn ).toHaveBeenCalledWith( metadata[ 0 ], 1, 'interceptor' );
    } );

    it( 'should return a Promise object with empty', async () => {
        const descriptor = generateDescriptor();

        const fn1 = () => 'fn1';
        const fn2 = () => 'fn2';
        const fn3 = async () => Promise.resolve( 'fn3' );

        const metadata: MetadataFinally[] = [
            { method : fn1, interceptorType : 'finally' },
            { method : fn2, interceptorType : 'finally' },
            { method : fn3, interceptorType : 'finally' }
        ];

        Reflect.defineMetadata( KEY_FINALLY, metadata, descriptor.value );
        const f = createInterceptorFinally( descriptor );
        return expect( f() ).resolves.toEqual();
    } );

    it( 'should support creating interceptor functions for class constructor', async () => {

        class A {};

        const fn1 = () => 'fn1';
        const fn2 = () => 'fn2';
        const fn3 = async () => Promise.resolve( 'fn3' );

        const metadata: MetadataFinally[] = [
            { method : fn1, interceptorType : 'finally' },
            { method : fn2, interceptorType : 'finally' },
            { method : fn3, interceptorType : 'finally' }
        ];

        Reflect.defineMetadata( KEY_FINALLY, metadata, A );
        const f = createInterceptorFinally( A );
        return expect( f() ).resolves.toEqual();
    } );
} );
