/******************************************************************
 * Copyright (C) 2021 LvChengbin
 *
 * File: interceptor/create-interceptor-exception.spec.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 01/23/2021
 * Description:
 ******************************************************************/

import 'reflect-metadata';
import { createInterceptorException, KEY_EXCEPTION, MetadataException } from '../../src';
import { generateDescriptor } from '../helpers/util';

describe( 'interceptor/create-interceptor-exception', () => {
    it( 'should create a function', () => {
        expect( createInterceptorException( generateDescriptor() ) ).toBeInstanceOf( Function );
    } );

    it( 'should throw the original error by default', () => {
        const e = new Error( 'Unknown error' );
        expect( createInterceptorException( generateDescriptor() )( e ) ).rejects.toEqual( e );
    } );

    it( 'should call corresponding function', async () => {
        const descriptor = generateDescriptor();
        const fn = jest.fn();
        const metadata: MetadataException[] = [ {
            method : fn,
            interceptorType : 'exception'
        } ];

        const e = new Error( 'Unknown error' );
        Reflect.defineMetadata( KEY_EXCEPTION, metadata, descriptor.value );
        await createInterceptorException( descriptor )( e );
        expect( fn ).toHaveBeenCalledTimes( 1 );
    } );

    it( 'should call corresponding methods with correct arguments', async () => {
        const descriptor = generateDescriptor();
        const fn = jest.fn();
        const metadata: MetadataException[] = [ {
            method : fn,
            interceptorType : 'exception'
        } ];

        Reflect.defineMetadata( KEY_EXCEPTION, metadata, descriptor.value );
        const e = new Error( 'Unknown error' );
        const args = [ 1, 'a' ] as const;
        await createInterceptorException<[number, string]>( descriptor )( e, ...args );
        expect( fn ).toHaveBeenCalledWith( metadata[ 0 ], e, ...args );
    } );

    it( 'should have thrown the exception which have been thrown from a method', () => {
        const descriptor = generateDescriptor();
        const e = new Error( 'Unknown error' );
        const fn = () => { throw e };
        const metadata: MetadataException[] = [ {
            method : fn,
            interceptorType : 'exception'
        } ];

        Reflect.defineMetadata( KEY_EXCEPTION, metadata, descriptor.value );
        const exception = createInterceptorException( descriptor );
        expect( exception( 'x' ) ).rejects.toEqual( e );
    } );

    it( 'should have returned the return value of the method has been called', () => {
        const descriptor = generateDescriptor();
        const e = new Error( 'Unknown error' );
        const fn = async () => 'abc';
        const metadata: MetadataException[] = [ {
            method : fn,
            interceptorType : 'exception'
        } ];

        Reflect.defineMetadata( KEY_EXCEPTION, metadata, descriptor.value );
        const exception = createInterceptorException( descriptor );
        expect( exception( e ) ).resolves.toEqual( 'abc' );
    } );

    it( 'should only call the method which exceptionType matches the thrown error object', async () => {
        class CustomError {}
        const descriptor = generateDescriptor();
        const fn1 = jest.fn();
        const fn2 = jest.fn();
        const metadata: MetadataException[] = [ {
            method : fn1,
            interceptorType : 'exception',
            exceptionType : TypeError
        }, {
            method : fn2,
            interceptorType : 'exception',
            exceptionType : CustomError
        } ];

        Reflect.defineMetadata( KEY_EXCEPTION, metadata, descriptor.value );
        await createInterceptorException( descriptor )( new CustomError );
        expect( fn1 ).toHaveBeenCalledTimes( 0 );
        expect( fn2 ).toHaveBeenCalledTimes( 1 );
    } );

    it( 'should support creating interceptor functions for class constructor', async () => {
        class CustomError {}
        class A {}
        const [ fn1, fn2 ] = [ jest.fn(), jest.fn() ];

        const metadata: MetadataException[] = [ {
            method : fn1,
            interceptorType : 'exception',
            exceptionType : TypeError
        }, {
            method : fn2,
            interceptorType : 'exception',
            exceptionType : CustomError
        } ];

        Reflect.defineMetadata( KEY_EXCEPTION, metadata, A );
        await createInterceptorException( A )( new CustomError );
        expect( fn1 ).toHaveBeenCalledTimes( 0 );
        expect( fn2 ).toHaveBeenCalledTimes( 1 );
    } );
} );
