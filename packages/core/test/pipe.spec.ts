/******************************************************************
 * Copyright (C) 2022 LvChengbin
 *
 * File: test/pipe.spec.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 02/25/2022
 * Description:
 ******************************************************************/

import { Inject } from '@ussuri/injection';
import { Application, PipeTransform } from '../src';
import { call, chain } from '../src/pipe';

describe( 'Pipe methods', () => {
    describe( 'call a pipe', () => {
        it( 'call a PipeFunction', () => {
            function SamplePipeFunction( value: string ): boolean {
                return value.length > 3;
            }
            expect( call( SamplePipeFunction, 'abc' ) ).resolves.toEqual( false );
            expect( call( SamplePipeFunction, 'abcd' ) ).resolves.toEqual( true );
        } );

        it( 'call a PipeTransform instance', () => {
            class SamplePipeTransform implements PipeTransform {
                transform( value: string ): boolean {
                    return value.length > 3;
                }
            }

            expect( call( new SamplePipeTransform(), 'abc' ) ).resolves.toEqual( false );
            expect( call( new SamplePipeTransform(), 'abcd' ) ).resolves.toEqual( true );
        } );

        it( 'call a PipeTransform constructor', () => {

            expect.assertions( 4 );

            class SampleProvider {}

            class SamplePipeTransform implements PipeTransform {

                @Inject( SampleProvider ) sampleProvider: SampleProvider;

                transform( value: string ): boolean {
                    expect( this.sampleProvider ).toBeInstanceOf( SampleProvider );
                    return value.length > 3;
                }
            }

            const application = new Application( {
                providers : [ SamplePipeTransform, SampleProvider ]
            } );

            expect( call( SamplePipeTransform, 'abc', {}, application ) ).resolves.toEqual( false );
            expect( call( SamplePipeTransform, 'abcd', {}, application ) ).resolves.toEqual( true );
        } );
    } );

    describe( 'call pipes in chain', () => {

        it( 'call multiple pipes in correct order', () => {
            function SamplePipeFunction( value: number ): number {
                return value + 1;
            }

            class SamplePipeTransform implements PipeTransform {
                transform( value: number ): number {
                    return value * 5;
                }
            }

            const application = new Application( {
                providers : [ SamplePipeTransform ]
            } );

            const pipes = [ SamplePipeFunction, SamplePipeTransform, new SamplePipeTransform() ];
            expect( chain( pipes, 1, {}, application ) ).resolves.toEqual( 50 );
        } );

        it( 'should pass correct value to pipes', async () => {

            const SamplePipeFunction = jest.fn( ( value: number ): number => value + 1 );
            const transform = jest.fn( ( value: number ): number => value * 5 );

            class SamplePipeTransform implements PipeTransform {
                transform = transform;
            }

            const application = new Application( {
                providers : [ SamplePipeTransform ]
            } );

            const pipes = [ SamplePipeFunction, SamplePipeTransform, new SamplePipeTransform() ];
            const context = {};
            const metadata = {};
            await expect( chain( pipes, 1, context, application, metadata ) ).resolves.toEqual( 50 );

            expect( SamplePipeFunction ).toHaveBeenCalledWith( 1, context, application, metadata );
            expect( transform ).toHaveBeenCalledTimes( 2 );
            expect( transform ).toHaveBeenCalledWith( 2, context, application, metadata );
            expect( transform ).toHaveBeenCalledWith( 10, context, application, metadata );
        } );
    } );
} );
