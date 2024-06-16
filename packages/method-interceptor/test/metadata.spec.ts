/******************************************************************
 * Copyright (C) 2021 LvChengbin
 *
 * File: test/metadata.spec.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 04/10/2021
 * Description:
 ******************************************************************/

import 'reflect-metadata';
import {
    KEY_BEFORE, saveMetadataBefore, getMetadataBefore,
    KEY_AFTER, saveMetadataAfter, getMetadataAfter,
    KEY_EXCEPTION, saveMetadataException, getMetadataException,
    KEY_FINALLY, saveMetadataFinally, getMetadataFinally,
    KEY_PARAMETER, saveMetadataParameter, getMetadataParameter
} from '../src';
import { generateDescriptor } from './helpers/util';

describe( 'methods of metadata', () => {
    describe( 'metadata before', () => {
        it( 'save "before" metadata for a constructor', () => {
            class A {}
            const fn = () => {};
            saveMetadataBefore( A, fn );
            const metadata = Reflect.getMetadata( KEY_BEFORE, A );
            expect( metadata ).toEqual( [ {
                interceptorType : 'before',
                method : fn
            } ] );
        } );

        it( 'save "before" metadata for a descriptor', () => {
            const fn = () => {};
            const descriptor = generateDescriptor();
            saveMetadataBefore( descriptor, fn );
            const metadata = Reflect.getMetadata( KEY_BEFORE, descriptor.value );
            expect( metadata ).toEqual( [ {
                interceptorType : 'before',
                method : fn
            } ] );
        } );

        it( 'save multiple "before" metadtas', () => {
            class A {}
            const fn = () => {};
            saveMetadataBefore( A, fn );
            saveMetadataBefore( A, fn );
            const metadata = Reflect.getMetadata( KEY_BEFORE, A );
            expect( metadata ).toEqual( [ {
                interceptorType : 'before',
                method : fn
            }, {
                interceptorType : 'before',
                method : fn
            } ] );
        } );

        it( 'set "parameters" option for "before" metadata', () => {
            class A {}
            const fn = () => {};
            saveMetadataBefore( A, fn, {
                parameters : { x : 1 }
            } );
            const metadata = Reflect.getMetadata( KEY_BEFORE, A );
            expect( metadata ).toEqual( [ {
                interceptorType : 'before',
                parameters : { x : 1 },
                method : fn
            } ] );
        } );

        it( 'get "before" metadata for a constructor', () => {
            class A {}
            const fn = () => {};
            saveMetadataBefore( A, fn );
            const metadata = getMetadataBefore( A );
            expect( metadata ).toEqual( [ {
                interceptorType : 'before',
                method : fn
            } ] );
        } );

        it( 'get "before" metadata for a descriptor', () => {
            const fn = () => {};
            const descriptor = generateDescriptor();
            saveMetadataBefore( descriptor, fn );
            const metadata = getMetadataBefore( descriptor );
            expect( metadata ).toEqual( [ {
                interceptorType : 'before',
                method : fn
            } ] );
        } );
    } );

    describe( 'metadata after', () => {
        it( 'save "after" metadata for a constructor', () => {
            class A {}
            const fn = () => {};
            saveMetadataAfter( A, fn );
            const metadata = Reflect.getMetadata( KEY_AFTER, A );
            expect( metadata ).toEqual( [ {
                interceptorType : 'after',
                method : fn
            } ] );
        } );

        it( 'save "after" metadata for a descriptor', () => {
            const fn = () => {};
            const descriptor = generateDescriptor();
            saveMetadataAfter( descriptor, fn );
            const metadata = Reflect.getMetadata( KEY_AFTER, descriptor.value );
            expect( metadata ).toEqual( [ {
                interceptorType : 'after',
                method : fn
            } ] );
        } );

        it( 'save multiple "after" metadtas', () => {
            class A {}
            const fn = () => {};
            saveMetadataAfter( A, fn );
            saveMetadataAfter( A, fn );
            const metadata = Reflect.getMetadata( KEY_AFTER, A );
            expect( metadata ).toEqual( [ {
                interceptorType : 'after',
                method : fn
            }, {
                interceptorType : 'after',
                method : fn
            } ] );
        } );

        it( 'set "parameters" option for "after" metadata', () => {
            class A {}
            const fn = () => {};
            saveMetadataAfter( A, fn, {
                parameters : { x : 1 }
            } );
            const metadata = Reflect.getMetadata( KEY_AFTER, A );
            expect( metadata ).toEqual( [ {
                interceptorType : 'after',
                parameters : { x : 1 },
                method : fn
            } ] );
        } );

        it( 'get "after" metadata for a constructor', () => {
            class A {}
            const fn = () => {};
            saveMetadataAfter( A, fn );
            const metadata = getMetadataAfter( A );
            expect( metadata ).toEqual( [ {
                interceptorType : 'after',
                method : fn
            } ] );
        } );

        it( 'get "after" metadata for a descriptor', () => {
            const fn = () => {};
            const descriptor = generateDescriptor();
            saveMetadataAfter( descriptor, fn );
            const metadata = getMetadataAfter( descriptor );
            expect( metadata ).toEqual( [ {
                interceptorType : 'after',
                method : fn
            } ] );
        } );
    } );

    describe( 'metadata exception', () => {
        it( 'save "exception" metadata for a constructor', () => {
            class A {}
            const fn = () => {};
            saveMetadataException( A, fn );
            const metadata = Reflect.getMetadata( KEY_EXCEPTION, A );
            expect( metadata ).toEqual( [ {
                interceptorType : 'exception',
                method : fn
            } ] );
        } );

        it( 'save "exception" metadata for a descriptor', () => {
            const fn = () => {};
            const descriptor = generateDescriptor();
            saveMetadataException( descriptor, fn );
            const metadata = Reflect.getMetadata( KEY_EXCEPTION, descriptor.value );
            expect( metadata ).toEqual( [ {
                interceptorType : 'exception',
                method : fn
            } ] );
        } );

        it( 'save multiple "exception" metadtas', () => {
            class A {}
            const fn = () => {};
            saveMetadataException( A, fn );
            saveMetadataException( A, fn );
            const metadata = Reflect.getMetadata( KEY_EXCEPTION, A );
            expect( metadata ).toEqual( [ {
                interceptorType : 'exception',
                method : fn
            }, {
                interceptorType : 'exception',
                method : fn
            } ] );
        } );

        it( 'set "parameters" option for "exception" metadata', () => {
            class A {}
            const fn = () => {};
            saveMetadataException( A, fn, {
                parameters : { x : 1 }
            } );
            const metadata = Reflect.getMetadata( KEY_EXCEPTION, A );
            expect( metadata ).toEqual( [ {
                interceptorType : 'exception',
                parameters : { x : 1 },
                method : fn
            } ] );
        } );

        it( 'get "exception" metadata for a constructor', () => {
            class A {}
            const fn = () => {};
            saveMetadataException( A, fn );
            const metadata = getMetadataException( A );
            expect( metadata ).toEqual( [ {
                interceptorType : 'exception',
                method : fn
            } ] );
        } );

        it( 'get "exception" metadata for a descriptor', () => {
            const fn = () => {};
            const descriptor = generateDescriptor();
            saveMetadataException( descriptor, fn );
            const metadata = getMetadataException( descriptor );
            expect( metadata ).toEqual( [ {
                interceptorType : 'exception',
                method : fn
            } ] );
        } );
    } );

    describe( 'metadata finally', () => {
        it( 'save "finally" metadata for a constructor', () => {
            class A {}
            const fn = () => {};
            saveMetadataFinally( A, fn );
            const metadata = Reflect.getMetadata( KEY_FINALLY, A );
            expect( metadata ).toEqual( [ {
                interceptorType : 'finally',
                method : fn
            } ] );
        } );

        it( 'save "finally" metadata for a descriptor', () => {
            const fn = () => {};
            const descriptor = generateDescriptor();
            saveMetadataFinally( descriptor, fn );
            const metadata = Reflect.getMetadata( KEY_FINALLY, descriptor.value );
            expect( metadata ).toEqual( [ {
                interceptorType : 'finally',
                method : fn
            } ] );
        } );

        it( 'save multiple "finally" metadtas', () => {
            class A {}
            const fn = () => {};
            saveMetadataFinally( A, fn );
            saveMetadataFinally( A, fn );
            const metadata = Reflect.getMetadata( KEY_FINALLY, A );
            expect( metadata ).toEqual( [ {
                interceptorType : 'finally',
                method : fn
            }, {
                interceptorType : 'finally',
                method : fn
            } ] );
        } );

        it( 'set "parameters" option for "finally" metadata', () => {
            class A {}
            const fn = () => {};
            saveMetadataFinally( A, fn, {
                parameters : { x : 1 }
            } );
            const metadata = Reflect.getMetadata( KEY_FINALLY, A );
            expect( metadata ).toEqual( [ {
                interceptorType : 'finally',
                parameters : { x : 1 },
                method : fn
            } ] );
        } );

        it( 'get "finally" metadata for a constructor', () => {
            class A {}
            const fn = () => {};
            saveMetadataFinally( A, fn );
            const metadata = getMetadataFinally( A );
            expect( metadata ).toEqual( [ {
                interceptorType : 'finally',
                method : fn
            } ] );
        } );

        it( 'get "finally" metadata for a descriptor', () => {
            const fn = () => {};
            const descriptor = generateDescriptor();
            saveMetadataFinally( descriptor, fn );
            const metadata = getMetadataFinally( descriptor );
            expect( metadata ).toEqual( [ {
                interceptorType : 'finally',
                method : fn
            } ] );
        } );
    } );

    describe( 'metadata parameter', () => {
        it( 'save "parameter" metadata', () => {
            class A {}
            const fn = () => {};
            saveMetadataParameter( A, 'fn', 0, fn );
            const metadata = Reflect.getMetadata( KEY_PARAMETER, A, 'fn' );
            expect( metadata ).toEqual( [ [
                { interceptorType : 'parameter', method : fn, paramtype : Object }
            ] ] );
        } );

        it( 'save mutliple "parameter" metadatas for same parameter', () => {
            class A {}
            const fn = () => {};
            saveMetadataParameter( A, 'fn', 0, fn );
            saveMetadataParameter( A, 'fn', 0, fn );
            const metadata = Reflect.getMetadata( KEY_PARAMETER, A, 'fn' );
            expect( metadata ).toEqual( [ [
                { interceptorType : 'parameter', method : fn, paramtype : Object },
                { interceptorType : 'parameter', method : fn, paramtype : Object }
            ] ] );
        } );

        it( 'save "parameter" metadatas for multiple parameters', () => {
            class A {}
            const fn = () => {};
            saveMetadataParameter( A, 'fn', 0, fn );
            saveMetadataParameter( A, 'fn', 1, fn );
            const metadata = Reflect.getMetadata( KEY_PARAMETER, A, 'fn' );
            expect( metadata ).toEqual( [ [
                { interceptorType : 'parameter', method : fn, paramtype : Object }
            ], [
                { interceptorType : 'parameter', method : fn, paramtype : Object }
            ] ] );
        } );

        it( 'save "parameter" metadata with "parameters" option', () => {
            class A {}
            const fn = () => {};
            saveMetadataParameter( A, 'fn', 0, fn, {
                data : { x : 1 }
            } );
            const metadata = Reflect.getMetadata( KEY_PARAMETER, A, 'fn' );
            expect( metadata ).toEqual( [ [
                {
                    interceptorType : 'parameter',
                    method : fn,
                    data : { x : 1 },
                    paramtype : Object
                }
            ] ] );
        } );

        it( 'get "parameter" metadata', () => {

            // eslint-disable-next-line
            const D = ( ...args: any[] ): any => {};

            class A {
                // eslint-disable-next-line
                fn( @D id: string ) {}
            }
            const fn = () => {};
            saveMetadataParameter( A.prototype, 'fn', 0, fn, {
                data : { x : 1 }
            } );
            const metadata = getMetadataParameter( A.prototype, 'fn' );
            expect( metadata ).toEqual( [ [
                {
                    interceptorType : 'parameter',
                    method : fn,
                    data : { x : 1 },
                    paramtype : String
                }
            ] ] );
        } );
    } );
} );
