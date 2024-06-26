/******************************************************************
 * Copyright (C) 2021 LvChengbin
 *
 * File: decorator/create-decorator-finally.spec.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 04/05/2021
 * Description:
 ******************************************************************/

import 'reflect-metadata';
import { KEY_FINALLY, createDecoratorFinally } from '../../src';

describe( 'decorator/create-decorator-finally', () => {
    it( 'should have created a method decorator', () => {
        const f = createDecoratorFinally( () => {} );
        expect( f ).toBeInstanceOf( Function );
    } );

    it( 'the decorator should emit correct metadta', () => {
        const method = () => {};
        const f = createDecoratorFinally( method );
        class A { @f fn() {} }
        const descriptor = Reflect.getOwnPropertyDescriptor( A.prototype, 'fn' )!;
        const metadata = Reflect.getMetadata( KEY_FINALLY, descriptor.value );
        expect( metadata ).toEqual( [ {
            method,
            interceptorType : 'finally'
        } ] );
    } );

    it( 'using multiple decorators on same method', () => {
        const fn1 = () => {};
        const fn2 = () => {};
        const f1 = createDecoratorFinally( fn1 );
        const f2 = createDecoratorFinally( fn2 );
        class A { @f1 @f2 fn() {} }
        const descriptor = Reflect.getOwnPropertyDescriptor( A.prototype, 'fn' )!;
        const metadata = Reflect.getMetadata( KEY_FINALLY, descriptor.value );
        expect( metadata ).toEqual( [ {
            method : fn2,
            interceptorType : 'finally'
        }, {
            method : fn1,
            interceptorType : 'finally'
        } ] );
    } );

    it( 'should have added parameters into metadata if it is set', () => {
        const method = () => {};
        const parameters = { x : 1 };
        const f = createDecoratorFinally( method, { parameters } );
        class A { @f fn() {} }
        const descriptor = Reflect.getOwnPropertyDescriptor( A.prototype, 'fn' )!;
        const metadata = Reflect.getMetadata( KEY_FINALLY, descriptor.value );
        expect( metadata ).toEqual( [ {
            method,
            interceptorType : 'finally',
            parameters
        } ] );
    } );

    it( 'should support to create class decorator', () => {
        const method = () => {};
        const parameters = { x : 1 };
        const f = createDecoratorFinally( method, { parameters } );

        @f
        class A {}

        const metadata = Reflect.getMetadata( KEY_FINALLY, A );

        expect( metadata ).toEqual( [ {
            method,
            interceptorType : 'finally',
            parameters
        } ] );
    } );
} );
