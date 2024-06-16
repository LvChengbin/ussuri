/******************************************************************
 * Copyright (C) 2021 LvChengbin
 *
 * File: decorator/create-decorator-before.spec.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 01/26/2021
 * Description:
 ******************************************************************/

import 'reflect-metadata';
import { KEY_BEFORE, createDecoratorBefore } from '../../src';

describe( 'decorator/create-decorator-before', () => {

    it( 'should have created a method decorator', () => {
        const before = createDecoratorBefore( () => {} );
        expect( before ).toBeInstanceOf( Function );
    } );

    it( 'the decorator should emit metadata', () => {
        const method = () => {};
        const before = createDecoratorBefore( method );
        class A { @before fn() {} }
        const descriptor = Reflect.getOwnPropertyDescriptor( A.prototype, 'fn' )!;
        const metadata = Reflect.getMetadata( KEY_BEFORE, descriptor.value );
        expect( metadata ).toEqual( [ {
            method,
            interceptorType : 'before'
        } ] );
    } );

    it( 'multiple before decorators on a method', () => {
        const fn1 = () => {};
        const fn2 = () => {};
        const before1 = createDecoratorBefore( fn1 );
        const before2 = createDecoratorBefore( fn2 );
        class A { @before1 @before2 fn() {} }
        const descriptor = Reflect.getOwnPropertyDescriptor( A.prototype, 'fn' )!;
        const metadata = Reflect.getMetadata( KEY_BEFORE, descriptor.value );
        expect( metadata ).toEqual( [ {
            method : fn2,
            interceptorType : 'before'
        }, {
            method : fn1,
            interceptorType : 'before'
        } ] );
    } );

    it( 'should have added parameters into metadata if it is set', () => {
        const method = () => {};
        const parameters = { x : 1 };
        const before = createDecoratorBefore( method, { parameters } );
        class A { @before fn() {} }
        const descriptor = Reflect.getOwnPropertyDescriptor( A.prototype, 'fn' )!;
        const metadata = Reflect.getMetadata( KEY_BEFORE, descriptor.value );
        expect( metadata ).toEqual( [ {
            method,
            interceptorType : 'before',
            parameters
        } ] );
    } );

    it( 'should support to create class decorator', () => {
        const method = () => {};
        const parameters = { x : 1 };
        const before = createDecoratorBefore( method, { parameters } );

        @before
        class A {}

        const metadata = Reflect.getMetadata( KEY_BEFORE, A );

        expect( metadata ).toEqual( [ {
            method,
            interceptorType : 'before',
            parameters
        } ] );
    } );
} );
