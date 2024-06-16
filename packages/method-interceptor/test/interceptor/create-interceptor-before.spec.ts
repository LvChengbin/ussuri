/******************************************************************
 * Copyright (C) 2021 LvChengbin
 *
 * File: interceptor/create-interceptor-before.spec.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 01/09/2021
 * Description:
 ******************************************************************/

import 'reflect-metadata';
import { createInterceptorBefore, KEY_BEFORE, MetadataBefore } from '../../src';
import { generateDescriptor } from '../helpers/util';

describe( 'interceptor/create-interceptor-before', () => {
    it( 'should created a function', () => {
        expect( createInterceptorBefore( generateDescriptor() ) ).toBeInstanceOf( Function );
    } );

    it( 'should return a Promise object by the created function', () => {
        expect( createInterceptorBefore( generateDescriptor() )() ).toBeInstanceOf( Promise );
    } );

    it( 'should return a Promise object which resolves with empty', async () => {
        return expect( createInterceptorBefore( generateDescriptor() )() ).resolves.toEqual();
    } );

    it( 'should have called the corresponding methods in storage', async () => {
        const descriptor = generateDescriptor();
        const fn = jest.fn();
        const metadata: MetadataBefore[] = [ {
            method : fn,
            interceptorType : 'before'
        } ];

        Reflect.defineMetadata( KEY_BEFORE, metadata, descriptor.value );
        await createInterceptorBefore( descriptor )();
        expect( fn ).toHaveBeenCalledTimes( 1 );
    } );

    it( 'should have called methods with default arguments', async () => {
        const descriptor = generateDescriptor();
        const fn = jest.fn();
        const metadata: MetadataBefore[] = [ {
            method : fn,
            interceptorType : 'before'
        } ];

        Reflect.defineMetadata( KEY_BEFORE, metadata, descriptor.value );
        await createInterceptorBefore( descriptor )();
        expect( fn ).toHaveBeenCalledWith( {
            interceptorType : 'before',
            method : fn
        } );
    } );

    it( 'should have called methods with given arguments', async () => {
        const descriptor = generateDescriptor();
        const fn = jest.fn();
        const metadata: MetadataBefore[] = [ {
            method : fn,
            interceptorType : 'before'
        } ];

        Reflect.defineMetadata( KEY_BEFORE, metadata, descriptor.value );
        await createInterceptorBefore<[ number, string ]>( descriptor )( 1, 'interceptor' );
        expect( fn ).toHaveBeenCalledWith( metadata[ 0 ], 1, 'interceptor' );
    } );

    it( 'should return a Promise object with empty', async () => {
        const descriptor = generateDescriptor();

        const fn1 = () => 'fn1';
        const fn2 = () => 'fn2';
        const fn3 = async () => Promise.resolve( 'fn3' );

        const metadata: MetadataBefore[] = [
            { method : fn1, interceptorType : 'before' },
            { method : fn2, interceptorType : 'before' },
            { method : fn3, interceptorType : 'before' }
        ];

        Reflect.defineMetadata( KEY_BEFORE, metadata, descriptor.value );
        const before = createInterceptorBefore( descriptor );
        return expect( before() ).resolves.toEqual();
    } );

    it( 'should support creating interceptor functions for class constructor', async () => {
        class A {};

        const fn1 = () => 'fn1';
        const fn2 = () => 'fn2';
        const fn3 = async () => Promise.resolve( 'fn3' );

        const metadata: MetadataBefore[] = [
            { method : fn1, interceptorType : 'before' },
            { method : fn2, interceptorType : 'before' },
            { method : fn3, interceptorType : 'before' }
        ];

        Reflect.defineMetadata( KEY_BEFORE, metadata, A );
        const before = createInterceptorBefore( A );
        return expect( before() ).resolves.toEqual();
    } );
} );
