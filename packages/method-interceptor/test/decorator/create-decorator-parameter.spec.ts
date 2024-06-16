/******************************************************************
 * Copyright (C) 2021 LvChengbin
 *
 * File: decorator/create-decorator-parameter.spec.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 01/26/2021
 * Description:
 ******************************************************************/

import 'reflect-metadata';
import { KEY_PARAMETER, createDecoratorParameter } from '../../src';

describe( 'decorator/create-decorator-parameter', () => {
    it( 'should have created a parameter decorator', () => {
        const parameter = createDecoratorParameter( () => {} );
        expect( parameter ).toBeInstanceOf( Function );
    } );

    it( 'the decorator should emit correct metadata', () => {
        const fn = () => {};
        const parameter = createDecoratorParameter( fn );
        class A { fn( @parameter name: string ) {} } // eslint-disable-line @typescript-eslint/no-unused-vars
        const metadata = Reflect.getMetadata( KEY_PARAMETER, A.prototype, 'fn' );
        expect( metadata ).toEqual( [
            [ {
                method : fn,
                interceptorType : 'parameter',
                paramtype : String
            } ]
        ] );
    } );

    it( 'using with multiple arguments', () => {
        const fn1 = () => {};
        const fn2 = () => {};
        const parameter1 = createDecoratorParameter( fn1 );
        const parameter2 = createDecoratorParameter( fn2 );
        class A { fn( @parameter1 name: string, @parameter2 age: number ) {} } // eslint-disable-line @typescript-eslint/no-unused-vars
        const metadata = Reflect.getMetadata( KEY_PARAMETER, A.prototype, 'fn' );
        expect( metadata ).toEqual( [
            [ {
                method : fn1,
                interceptorType : 'parameter',
                paramtype : String
            } ],
            [ {
                method : fn2,
                interceptorType : 'parameter',
                paramtype : Number
            } ]
        ] );
    } );

    it( 'using multiple decorators', () => {
        const fn1 = () => {};
        const fn2 = () => {};
        const parameter1 = createDecoratorParameter( fn1 );
        const parameter2 = createDecoratorParameter( fn2 );
        class A { fn( @parameter1 @parameter2 name: string ) {} } // eslint-disable-line @typescript-eslint/no-unused-vars
        const metadata = Reflect.getMetadata( KEY_PARAMETER, A.prototype, 'fn' );
        expect( metadata ).toEqual( [
            [ {
                method : fn2,
                interceptorType : 'parameter',
                paramtype : String
            }, {
                method : fn1,
                interceptorType : 'parameter',
                paramtype : String
            } ]
        ] );
    } );

    it( 'item of array can be undefined', () => {
        const fn = () => {};
        const parameter = createDecoratorParameter( fn );
        class A { fn( name: string, @parameter age: number ) {} } // eslint-disable-line @typescript-eslint/no-unused-vars
        const metadata = Reflect.getMetadata( KEY_PARAMETER, A.prototype, 'fn' );
        expect( metadata ).toEqual( [
            undefined,
            [ {
                method : fn,
                interceptorType : 'parameter',
                paramtype : Number
            } ]
        ] );
    } );

    it( 'decorators for constructors of classes', () => {
        const fn1 = () => {};
        const fn2 = () => {};
        const parameter1 = createDecoratorParameter( fn1 );
        const parameter2 = createDecoratorParameter( fn2 );
        class A {
            constructor( @parameter1 name: string, @parameter2 age: number ) {} // eslint-disable-line @typescript-eslint/no-unused-vars
        }
        const metadata = Reflect.getMetadata( KEY_PARAMETER, A );;

        expect( metadata ).toEqual( [
            [ {
                method : fn1,
                interceptorType : 'parameter',
                paramtype : String
            } ], [ {
                method : fn2,
                interceptorType : 'parameter',
                paramtype : Number
            } ]
        ] );
        expect( Reflect.getMetadata( 'design:paramtypes', A ) ).toEqual( [ String, Number ] );
    } );
} );
