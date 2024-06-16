/******************************************************************
 * Copyright (C) 2022 LvChengbin
 *
 * File: test/decorator.spec.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 02/27/2022
 * Description:
 ******************************************************************/

import { Inject } from '@ussuri/injection';
import { Application, Action, Metadata, Context, Pipe, Module } from '../src';
import { createDecorator, createPipeDecorator } from '../src/decorator';
import { chain } from '../src/pipe';

describe( 'decorator utilities', () => {

    describe( 'create decorators', () => {

        it( 'create multiple types of decorators', async () => {
            const context = {
                params : { name : 'Jay' }
            };
            const error = new Error( 'Something is wrong!' );
            const inputInterceptor = jest.fn();
            const outputInterceptor = jest.fn( () => {
                throw error;
            } );
            const parameterInterceptor = jest.fn( ( metadata: Metadata, ctx: Context ) => {
                return ctx.params.name;
            } );
            const parameterInterceptor2 = jest.fn( ( metadata: Metadata, ctx: Context, application: Application, value: string ) => {
                return `${value}-${value}`;
            } );
            const exceptionInterceptor = jest.fn( ( metadata: Metadata, e: unknown ) => {
                if( e instanceof Error ) return e.message;
                return 'unknown error';
            } );

            const InputDecorator = jest.fn( createDecorator( {
                input : [ inputInterceptor, {} ]
            } ) );

            const OutputDecorator = jest.fn( createDecorator( {
                output : [ outputInterceptor, {} ]
            } ) );

            const ParameterDecorator = jest.fn( createDecorator( {
                parameter : [ parameterInterceptor, {} ]
            } ) );

            const ParameterDecorator2 = jest.fn( createDecorator( {
                parameter : [ parameterInterceptor2, {} ]
            } ) );

            const ExceptionDecorator = jest.fn( createDecorator( {
                exception : [ exceptionInterceptor, {} ]
            } ) );

            class SampleController {
                @ExceptionDecorator
                @InputDecorator
                @OutputDecorator
                @Action()
                action( @ParameterDecorator2 @ParameterDecorator name: string ) {
                    return name;
                }
            }

            expect( InputDecorator ).toHaveBeenCalled();
            expect( OutputDecorator ).toHaveBeenCalled();
            expect( ParameterDecorator ).toHaveBeenCalled();
            expect( ExceptionDecorator ).toHaveBeenCalled();

            const application = new Application( {
                controllers : [ SampleController ]
            } );

            const response = await application.call( SampleController, 'action', context );
            expect( response ).toEqual( error.message );

            expect( inputInterceptor ).toHaveBeenCalledWith( expect.any( Object ), context, application );
            expect( parameterInterceptor ).toHaveBeenCalledWith( expect.any( Object ), context, application, undefined );
            expect( parameterInterceptor2 ).toHaveBeenCalledWith( expect.any( Object ), context, application, 'Jay' );
            expect( outputInterceptor ).toHaveBeenCalledWith( expect.any( Object ), 'Jay-Jay', context, application );
            expect( exceptionInterceptor ).toHaveBeenCalledWith( expect.any( Object ), error, context, application );
        } );

    } );

    describe( 'createPipesDecorator', () => {
        it( 'should call pipes', async () => {

            expect.assertions( 14 );

            type Ctx = Context & { i: number };

            const context: Ctx = { i : 0 };

            class SampleProvider {}

            class ModulePipeTransform implements PipeTransform {
                @Inject( SampleProvider ) sampleProvider: SampleProvider;

                transform( ctx: Ctx ): boolean {
                    expect( this.sampleProvider ).toBeInstanceOf( SampleProvider );
                    expect( ctx.i ).toEqual( 1 );
                    ctx.i++;
                    return ctx;
                }
            }

            class ControllerPipeTransform implements PipeTransform {
                @Inject( SampleProvider ) sampleProvider: SampleProvider;

                transform( ctx: Ctx ): boolean {
                    expect( this.sampleProvider ).toBeInstanceOf( SampleProvider );
                    expect( ctx.i ).toEqual( 3 );
                    ctx.i++;
                    return ctx;
                }
            }

            class ActionPipeTransform implements PipeTransform {
                @Inject( SampleProvider ) sampleProvider: SampleProvider;

                transform( ctx: Ctx ): boolean {
                    expect( this.sampleProvider ).toBeInstanceOf( SampleProvider );
                    expect( ctx.i ).toEqual( 5 );
                    ctx.i++;
                    return ctx;
                }
            }

            class ParameterPipeTransform implements PipeTransform {
                @Inject( SampleProvider ) sampleProvider: SampleProvider;

                transform( ctx: Ctx ): boolean {
                    expect( this.sampleProvider ).toBeInstanceOf( SampleProvider );
                    expect( ctx.i ).toEqual( 7 );
                    ctx.i++;
                    return ctx;
                }
            }

            const ModulePipeFunction = jest.fn( ( ctx: Ctx ) => {
                expect( ctx.i ).toEqual( 0 );
                ctx.i++;
                return ctx;
            } );

            const ControllerPipeFunction = jest.fn( ( ctx: Ctx ) => {
                expect( ctx.i ).toEqual( 2 );
                ctx.i++;
                return ctx;
            } );

            const ActionPipeFunction = jest.fn( ( ctx: Ctx ) => {
                expect( ctx.i ).toEqual( 4 );
                ctx.i++;
                return ctx;
            } );

            const ParameterPipeFunction = jest.fn( ( ctx: Ctx ) => {
                expect( ctx.i ).toEqual( 6 );
                ctx.i++;
                return ctx;
            } );

            async function fn<C extends Context>( metadata: PipeMetadata, ctx: C, application: Application<C> ): Promise<unknown> {
                const value = ctx;
                return chain( metadata.data.pipes, ctx, value, application, metadata );
            }

            function Decorator( ...pipes: Pipe[] ): MethodDecorator {
                return createPipeDecorator( { input : fn, parameter : fn }, ...pipes );
            }

            @Decorator( ControllerPipeFunction, ControllerPipeTransform )
            class SampleController {
                @Action()
                @Decorator( ActionPipeFunction, ActionPipeTransform )
                foo( @Decorator( ParameterPipeFunction, ParameterPipeTransform ) ctx: Ctx ) {
                    expect( ctx.i ).toEqual( 8 );
                    return ++ctx.i;
                }
            }

            @Decorator( ModulePipeFunction, ModulePipeTransform )
            @Module( {
                controllers : [ SampleController ],
                providers : [ SampleProvider ]
            } )
            class MainModule {};

            const application = Application.create( MainModule );

            await application.call( SampleController, 'foo', context );

            expect( context.i ).toEqual( 9 );
        } );
    } );
} );
