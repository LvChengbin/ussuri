/******************************************************************
 * Copyright (C) 2021 LvChengbin
 *
 * File: decorator/create-decorator-exception.spec.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 01/26/2021
 * Description:
 ******************************************************************/

import 'reflect-metadata';
import { KEY_EXCEPTION, createDecoratorException } from '../../src';

describe( 'decorator/create-decorator-exception', () => {
    it( 'should have created a method decorator', () => {
        const exception = createDecoratorException( () => {} );
        expect( exception ).toBeInstanceOf( Function );
    } );

    it( 'the decorator should emit metadata', () => {
        const method = () => {};
        const exception = createDecoratorException( method );
        class A { @exception fn() {} }
        const descriptor = Reflect.getOwnPropertyDescriptor( A.prototype, 'fn' )!;
        const metadata = Reflect.getMetadata( KEY_EXCEPTION, descriptor.value );
        expect( metadata ).toEqual( [ {
            method,
            interceptorType : 'exception'
        } ] );
    } );

    it( 'multiple exception decorators on a method', () => {
        const fn1 = () => {};
        const fn2 = () => {};
        const exception1 = createDecoratorException( fn1 );
        const exception2 = createDecoratorException( fn2 );
        class A { @exception1 @exception2 fn() {} }
        const descriptor = Reflect.getOwnPropertyDescriptor( A.prototype, 'fn' )!;
        const metadata = Reflect.getMetadata( KEY_EXCEPTION, descriptor.value );
        expect( metadata ).toEqual( [ {
            method : fn2,
            interceptorType : 'exception'
        }, {
            method : fn1,
            interceptorType : 'exception'
        } ] );
    } );

    it( 'should have added parameters into metadata if it is set', () => {
        const method = () => {};
        const parameters = { x : 1 };
        const exception = createDecoratorException( method, { parameters } );
        class A { @exception fn() {} }
        const descriptor = Reflect.getOwnPropertyDescriptor( A.prototype, 'fn' )!;
        const metadata = Reflect.getMetadata( KEY_EXCEPTION, descriptor.value );
        expect( metadata ).toEqual( [ {
            method,
            interceptorType : 'exception',
            parameters
        } ] );
    } );

    it( 'should have added exceptionType into metadata if it is set', () => {
        const method = () => {};
        const parameters = { x : 1 };
        const exceptionType = Error;
        const exception = createDecoratorException( method, { exceptionType, parameters } );
        class A { @exception fn() {} }
        const descriptor = Reflect.getOwnPropertyDescriptor( A.prototype, 'fn' )!;
        const metadata = Reflect.getMetadata( KEY_EXCEPTION, descriptor.value );
        expect( metadata ).toEqual( [ {
            method,
            interceptorType : 'exception',
            exceptionType,
            parameters
        } ] );
    } );

    it( 'should support to create class decorator', () => {
        const method = () => {};
        const parameters = { x : 1 };
        const exceptionType = Error;
        const exception = createDecoratorException( method, { exceptionType, parameters } );

        @exception
        class A {}

        const metadata = Reflect.getMetadata( KEY_EXCEPTION, A );

        expect( metadata ).toEqual( [ {
            method,
            interceptorType : 'exception',
            exceptionType,
            parameters
        } ] );
    } );
} );
