/******************************************************************
 * Copyright (C) 2021 LvChengbin
 *
 * File: interceptor/create-interceptor-after.spec.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 01/11/2021
 * Description:
 ******************************************************************/

import 'reflect-metadata';
import { createInterceptorAfter, KEY_AFTER, MetadataAfter } from '../../src';
import { generateDescriptor } from '../helpers/util';

describe( 'interceptor/create-interceptor-after', () => {
    it( 'should have created a function', () => {
        expect( createInterceptorAfter( generateDescriptor() ) ).toBeInstanceOf( Function );
    } );

    it( 'should return a Promise object by the created function', () => {
        const after = createInterceptorAfter( generateDescriptor() );
        expect( after( 'x' ) ).toBeInstanceOf( Promise );
    } );

    it( 'should return a Promise object resolves with the given value', async () => {
        const after = createInterceptorAfter( generateDescriptor() );
        return expect( after( 'ussuri' ) ).resolves.toEqual( 'ussuri' );
    } );

    it( 'should have called the corresponding methods in order', async () => {
        const descriptor = generateDescriptor();
        const res: string[] = [];
        const fn1 = () => { res.push( 'first' ) };
        const fn2 = () => { res.push( 'second' ) };

        const metadata: MetadataAfter[] = [
            { method : fn2, interceptorType : 'after' },
            { method : fn1, interceptorType : 'after' }
        ];

        Reflect.defineMetadata( KEY_AFTER, metadata, descriptor.value );
        await createInterceptorAfter( descriptor )( 'x' );
        expect( res ).toEqual( [ 'second', 'first' ] );
    } );

    it( 'should have called methods with default arguments', async () => {
        const descriptor = generateDescriptor();
        const fn = jest.fn();
        const metadata: MetadataAfter[] = [ {
            method : fn,
            interceptorType : 'after'
        } ];

        Reflect.defineMetadata( KEY_AFTER, metadata, descriptor.value );
        await createInterceptorAfter( descriptor )( 'ussuri' );
        expect( fn ).toHaveBeenCalledWith( metadata[ 0 ], 'ussuri' );
    } );

    it( 'should have called methods with given arguments', async () => {
        const descriptor = generateDescriptor();
        const fn = jest.fn();
        const metadata: MetadataAfter[] = [ {
            method : fn,
            interceptorType : 'after'
        } ];

        Reflect.defineMetadata( KEY_AFTER, metadata, descriptor.value );
        const args = [ 1, 2, 3 ] as const;
        await createInterceptorAfter( descriptor )( 'ussuri', ...args );
        expect( fn ).toHaveBeenCalledWith( metadata[ 0 ], 'ussuri', ...args );
    } );

    it( 'should return a Promise object with expected values', async () => {
        const descriptor = generateDescriptor();

        const fn1 = () => 'fn1';
        const fn2 = () => 'fn2';
        const fn3 = async () => Promise.resolve( 'fn3' );

        const metadata: MetadataAfter[] = [
            { method : fn1, interceptorType : 'after' },
            { method : fn2, interceptorType : 'after' },
            { method : fn3, interceptorType : 'after' }
        ];

        Reflect.defineMetadata( KEY_AFTER, metadata, descriptor.value );
        const after = createInterceptorAfter( descriptor );
        return expect( after( 'x' ) ).resolves.toEqual( 'fn3' );
    } );

    it( 'should have called a method using the return value of the previous method', async () => {
        const descriptor = generateDescriptor();
        const fn1 = () => 'fn1';
        const fn2 = jest.fn();

        const metadata: MetadataAfter[] = [
            { method : fn1, interceptorType : 'after' },
            { method : fn2, interceptorType : 'after' }
        ];

        Reflect.defineMetadata( KEY_AFTER, metadata, descriptor.value );
        await createInterceptorAfter( descriptor )( 'x' );
        expect( fn2 ).toHaveBeenCalledWith( metadata[ 1 ], 'fn1' );
    } );

    it( 'should support creating interceptor functions for class constructor', async () => {
        class A {}

        const fn1 = () => 'fn1';
        const fn2 = jest.fn();

        const metadata: MetadataAfter[] = [
            { method : fn1, interceptorType : 'after' },
            { method : fn2, interceptorType : 'after' }
        ];

        Reflect.defineMetadata( KEY_AFTER, metadata, A );
        await createInterceptorAfter( A )( 'x' );
        expect( fn2 ).toHaveBeenCalledWith( metadata[ 1 ], 'fn1' );
    } );
} );
