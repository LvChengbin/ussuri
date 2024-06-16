/******************************************************************
 * Copyright (C) 2021 LvChengbin
 *
 * File: interceptor/create-interceptor-parameter.spec.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 01/25/2021
 * Description:
 ******************************************************************/

import 'reflect-metadata';
import 'jest-extended';
import { createInterceptorParameter, createInterceptorParameterSync, KEY_PARAMETER, MetadataParameter } from '../../src';
import Decorate from '../helpers/decorate';

describe( 'interceptor/create-interceptor-parameter', () => {

    describe( 'createInterceptorParameter', () => {
        it( 'should have created a function', () => {
            class A {
                @Decorate
                fn() {}
            }
            expect( createInterceptorParameter( A, 'fn' ) ).toBeInstanceOf( Function );
        } );

        it( 'should have created a function even if the decorator metadata has not been emitted', () => {
            class A { fn() {} }
            expect( createInterceptorParameter( A.prototype, 'fn' ) ).toBeInstanceOf( Function );
        } );

        it( 'should return a Promise object by the created function', () => {
            class A { fn() {} }
            const parameter = createInterceptorParameter( A.prototype, 'fn' );
            expect( parameter() ).toBeInstanceOf( Promise );
        } );

        it( 'should have called the corresponding methods', async () => {
            class A { @Decorate fn( name: string ) {} } // eslint-disable-line
            const fn = jest.fn();

            const metadata: MetadataParameter[][] = [
                [ {
                    method : fn,
                    interceptorType : 'parameter'
                } ]
            ];

            Reflect.defineMetadata( KEY_PARAMETER, metadata, A.prototype, 'fn' );
            await createInterceptorParameter( A.prototype, 'fn' )();
            expect( fn ).toHaveBeenCalledTimes( 1 );
        } );

        it( 'metadata can be undefined', async () => {
            class A { @Decorate fn( name: string ) {} } // eslint-disable-line

            const metadata: MetadataParameter[][] = [];

            Reflect.defineMetadata( KEY_PARAMETER, metadata, A.prototype, 'fn' );
            await createInterceptorParameter( A.prototype, 'fn' )();
        } );

        it( 'should have called the corresponding methods with correct arguments', async () => {
            class A { @Decorate fn( name: string ) {} } // eslint-disable-line
            const fn = jest.fn();

            const metadata: MetadataParameter[][] = [
                [ {
                    method : fn,
                    interceptorType : 'parameter'
                } ]
            ];

            Reflect.defineMetadata( KEY_PARAMETER, metadata, A.prototype, 'fn' );
            await createInterceptorParameter( A.prototype, 'fn' )();
            expect( fn ).toHaveBeenCalledWith( {
                ...metadata[ 0 ][ 0 ],
                paramtype : String
            }, undefined );
        } );

        it( 'should return a Promise resolves with return values of corresponding methods', async () => {
            class A { @Decorate fn( name: string, age: number ) {} } // eslint-disable-line

            const fn1 = () => 'abc';
            const fn2 = () => 1;

            const metadata: MetadataParameter[][] = [
                [ { method : fn1, interceptorType : 'parameter' } ],
                [ { method : fn2, interceptorType : 'parameter' } ]
            ];

            Reflect.defineMetadata( KEY_PARAMETER, metadata, A.prototype, 'fn' );
            const parameter = createInterceptorParameter( A.prototype, 'fn' );
            return expect( parameter() ).resolves.toEqual( [ 'abc', 1 ] );
        } );

        it( 'should have called multiple decorators for single parameter in order', async () => {
            class A { @Decorate fn( name: string ) {} } // eslint-disable-line
            const fn1 = jest.fn();
            const fn2 = jest.fn();

            const metadata: MetadataParameter[][] = [ [
                { method : fn1, interceptorType : 'parameter' },
                { method : fn2, interceptorType : 'parameter' }
            ] ];

            Reflect.defineMetadata( KEY_PARAMETER, metadata, A.prototype, 'fn' );
            const parameter = createInterceptorParameter( A.prototype, 'fn' );
            await parameter();
            expect( fn1 ).toHaveBeenCalledBefore( fn2 );
            expect( fn1 ).toHaveBeenCalled();
            expect( fn2 ).toHaveBeenCalled();
        } );

        it( 'should pass return value through decorators of parameter', async () => {
            class A { @Decorate fn( name: string ) {} } // eslint-disable-line
            const fn1 = () => 'ussuri';
            const fn2 = jest.fn();

            const metadata: MetadataParameter[][] = [ [
                { method : fn1, interceptorType : 'parameter' },
                { method : fn2, interceptorType : 'parameter' }
            ] ];

            Reflect.defineMetadata( KEY_PARAMETER, metadata, A.prototype, 'fn' );
            const parameter = createInterceptorParameter( A.prototype, 'fn' );
            await parameter( 'nny' );
            expect( fn2 ).toHaveBeenCalledWith( {
                interceptorType : 'parameter',
                paramtype : String,
                method : fn2
            }, 'nny', 'ussuri' );
        } );

        it( 'shoule return Promise<null> if some parameters have not decorators', async () => {
            class A {
                @Decorate
                fn( name: string ): string {
                    return name;
                }
            }

            Reflect.defineMetadata( KEY_PARAMETER, [ [] ], A.prototype, 'fn' );

            const parameter = createInterceptorParameter( A.prototype, 'fn' );
            const res = await parameter();
            expect( res ).toEqual( [ undefined ] );
        } );
    } );

    describe( 'createInterceptorParameterSync', () => {

        it( 'should have generated a function', () => {
            class A {
                @Decorate
                fn() {}
            }
            expect( createInterceptorParameterSync( A, 'fn' ) ).toBeInstanceOf( Function );
        } );

        it( 'should return an array from the generated function', () => {
            class A { fn() {} }
            const parameter = createInterceptorParameterSync( A.prototype, 'fn' );
            expect( parameter() ).toBeInstanceOf( Array );
        } );

        it( 'should have called the corresponding methods', () => {
            class A { @Decorate fn( name: string ) {} } // eslint-disable-line
            const fn = jest.fn();

            const metadata: MetadataParameter[][] = [
                [ { method : fn, interceptorType : 'parameter' } ]
            ];

            Reflect.defineMetadata( KEY_PARAMETER, metadata, A.prototype, 'fn' );
            createInterceptorParameterSync( A.prototype, 'fn' )();
            expect( fn ).toHaveBeenCalledTimes( 1 );
        } );

        it( 'metadata can be undefined', () => {
            class A { @Decorate fn( name: string ) {} } // eslint-disable-line
            const metadata: MetadataParameter[][] = [];

            Reflect.defineMetadata( KEY_PARAMETER, metadata, A.prototype, 'fn' );
            createInterceptorParameterSync( A.prototype, 'fn' )();
        } );

        it( 'should have called the corresponding methods with correct arguments', () => {
            class A { @Decorate fn( name: string ) {} } // eslint-disable-line
            const fn = jest.fn();

            const metadata: MetadataParameter[][] = [
                [ { method : fn, interceptorType : 'parameter' } ]
            ];

            Reflect.defineMetadata( KEY_PARAMETER, metadata, A.prototype, 'fn' );
            createInterceptorParameterSync( A.prototype, 'fn' )();
            expect( fn ).toHaveBeenCalledWith( {
                ...metadata[ 0 ][ 0 ],
                paramtype : String
            }, undefined );
        } );

        it( 'should return a value returns from methods', () => {
            class A { @Decorate fn( name: string, age: number ) {} } // eslint-disable-line

            const fn1 = () => 'abc';
            const fn2 = () => 1;

            const metadata: MetadataParameter[][] = [
                [ { method : fn1, interceptorType : 'parameter' } ],
                [ { method : fn2, interceptorType : 'parameter' } ]
            ];

            Reflect.defineMetadata( KEY_PARAMETER, metadata, A.prototype, 'fn' );
            const parameter = createInterceptorParameterSync( A.prototype, 'fn' );
            expect( parameter() ).toEqual( [ 'abc', 1 ] );
        } );

        it( 'should have called multiple decorators for single parameter in order', () => {
            class A { @Decorate fn( name: string ) {} } // eslint-disable-line
            const fn1 = jest.fn();
            const fn2 = jest.fn();

            const metadata: MetadataParameter[][] = [ [
                { method : fn1, interceptorType : 'parameter' },
                { method : fn2, interceptorType : 'parameter' }
            ] ];

            Reflect.defineMetadata( KEY_PARAMETER, metadata, A.prototype, 'fn' );
            createInterceptorParameterSync( A.prototype, 'fn' )();
            expect( fn1 ).toHaveBeenCalledBefore( fn2 );
            expect( fn1 ).toHaveBeenCalled();
            expect( fn2 ).toHaveBeenCalled();
        } );

        it( 'should pass return value through decorators of parameter', () => {
            class A { @Decorate fn( name: string ) {} } // eslint-disable-line
            const fn1 = () => 'ussuri';
            const fn2 = jest.fn();

            const metadata: MetadataParameter[][] = [ [
                { method : fn1, interceptorType : 'parameter' },
                { method : fn2, interceptorType : 'parameter' }
            ] ];

            Reflect.defineMetadata( KEY_PARAMETER, metadata, A.prototype, 'fn' );
            createInterceptorParameterSync( A.prototype, 'fn' )( 'nny' );
            expect( fn2 ).toHaveBeenCalledWith( {
                interceptorType : 'parameter',
                paramtype : String,
                method : fn2
            }, 'nny', 'ussuri' );
        } );

        it( 'shoule return Promise<null> if some parameters have not decorators', () => {
            class A {
                @Decorate
                fn( name: string ): string {
                    return name;
                }
            }

            Reflect.defineMetadata( KEY_PARAMETER, [ [] ], A.prototype, 'fn' );

            const parameter = createInterceptorParameterSync( A.prototype, 'fn' );
            expect( parameter() ).toEqual( [ undefined ] );
        } );
    } );
} );
