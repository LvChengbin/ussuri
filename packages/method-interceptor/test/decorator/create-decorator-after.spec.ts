/******************************************************************
 * Copyright (C) 2021 LvChengbin
 *
 * File: decorator/create-decorator-after.spec.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 01/26/2021
 * Description:
 ******************************************************************/

import 'reflect-metadata';
import { KEY_AFTER, createDecoratorAfter } from '../../src';

describe( 'decorator/create-decorator-after', () => {
    it( 'should have created a method decorator', () => {
        const after = createDecoratorAfter( () => {} );
        expect( after ).toBeInstanceOf( Function );
    } );

    it( 'the decorator should emit correct metadata', () => {
        const method = () => {};
        const after = createDecoratorAfter( method );
        class A { @after fn() {} }
        const descriptor = Reflect.getOwnPropertyDescriptor( A.prototype, 'fn' )!;
        const metadata = Reflect.getMetadata( KEY_AFTER, descriptor.value );
        expect( metadata ).toEqual( [ {
            method,
            interceptorType : 'after'
        } ] );
    } );

    it( 'using mutiple decorators', () => {
        const fn1 = () => {};
        const fn2 = () => {};
        const after1 = createDecoratorAfter( fn1 );
        const after2 = createDecoratorAfter( fn2 );
        class A { @after1 @after2 fn() {} }
        const descriptor = Reflect.getOwnPropertyDescriptor( A.prototype, 'fn' )!;
        const metadata = Reflect.getMetadata( KEY_AFTER, descriptor.value );
        expect( metadata ).toEqual( [ {
            method : fn2,
            interceptorType : 'after'
        }, {
            method : fn1,
            interceptorType : 'after'
        } ] );
    } );

    it( 'should have added parameters into metadata if it is set', () => {
        const method = () => {};
        const parameters = { x : 1 };
        const after = createDecoratorAfter( method, { parameters } );
        class A { @after fn() {} }
        const descriptor = Reflect.getOwnPropertyDescriptor( A.prototype, 'fn' )!;
        const metadata = Reflect.getMetadata( KEY_AFTER, descriptor.value );
        expect( metadata ).toEqual( [ {
            method,
            interceptorType : 'after',
            parameters
        } ] );
    } );

    it( 'should support to create class decorator', () => {
        const method = () => {};
        const parameters = { x : 1 };
        const after = createDecoratorAfter( method, { parameters } );

        @after
        class A {}

        const metadata = Reflect.getMetadata( KEY_AFTER, A );

        expect( metadata ).toEqual( [ {
            method,
            interceptorType : 'after',
            parameters
        } ] );
    } );
} );
