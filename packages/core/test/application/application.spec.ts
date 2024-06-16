/******************************************************************
 * Copyright (C) 2022-2023 NextSeason
 *
 * @File: test/application.spec.ts
 *
 * This file is part of NextSeason projects.
 * Code in this file can not be copied and/or distributed without the
 * express permission of NextSeason. Inc
 ******************************************************************/

import { createDecoratorBefore, createDecoratorAfter, createDecoratorException } from '@ussuri/method-interceptor';
import { Application, Action, Controller, Module, Ctx, Output } from '../../src';

describe( 'Application', () => {
    it( 'should generate correct handlers', () => {

        @Controller( {} )
        class ControllerOne {
            @Action()
            foo() {}
        }

        class ControllerTwo {
            @Action()
            foo() {}
        }

        const application = new Application( {
            providers : [],
            controllers : [ ControllerOne, ControllerTwo ]
        } );

        expect( application.handlers ).toEqual( new Map( [
            [ ControllerOne, {
                foo : expect.any( Function )
            } ],
            [ ControllerTwo, {
                foo : expect.any( Function )
            } ]
        ] ) );
    } );

    it( 'call a handler', () => {

        class SampleController {
            @Action()
            foo() {
                return 'bar';
            }
        }

        const application = new Application( {
            controllers : [ SampleController ]
        } );

        expect( application.call( SampleController, 'foo', {} ) ).resolves.toEqual( 'bar' );
    } );

    it( 'should call controller and action interceptor functions in correct order', async () => {

        const context = {};
        const fnActionDecoratorBefore = jest.fn();
        const fnActionDecoratorAfter = jest.fn( ( context, value ) => `${value}${value}` );

        const fnControllerDecoratorBefore = jest.fn();
        const fnControllerDecoratorAfter = jest.fn();

        const ActionDecoratorBefore = createDecoratorBefore( fnActionDecoratorBefore );
        const ActionDecoratorAfter = createDecoratorAfter( fnActionDecoratorAfter );

        const ControllerDecoratorBefore = createDecoratorBefore( fnControllerDecoratorBefore );
        const ControllerDecoratorAfter = createDecoratorAfter( fnControllerDecoratorAfter );

        @ControllerDecoratorBefore
        @ControllerDecoratorAfter
        class SampleController {
            @Action()
            @ActionDecoratorBefore
            @ActionDecoratorAfter
            foo() { return 'bar' }
        }

        const application = new Application( {
            controllers : [ SampleController ]
        } );

        await application.call( SampleController, 'foo', context );

        expect( fnActionDecoratorBefore ).toHaveBeenCalledTimes( 1 );
        expect( fnActionDecoratorBefore ).toHaveBeenCalledWith( expect.any( Object ), context, application );

        expect( fnActionDecoratorAfter ).toHaveBeenCalledTimes( 1 );
        expect( fnActionDecoratorAfter ).toHaveBeenCalledWith( expect.any( Object ), 'bar', context, application );

        expect( fnControllerDecoratorBefore ).toHaveBeenCalledTimes( 1 );
        expect( fnControllerDecoratorBefore ).toHaveBeenCalledWith( expect.any( Object ), context, application );

        expect( fnControllerDecoratorAfter ).toHaveBeenCalledTimes( 1 );
        expect( fnControllerDecoratorAfter ).toHaveBeenCalledWith( expect.any( Object ), 'barbar', context, application );

        expect( fnControllerDecoratorBefore ).toHaveBeenCalledBefore( fnActionDecoratorBefore );
        expect( fnActionDecoratorBefore ).toHaveBeenCalledBefore( fnActionDecoratorAfter );
        expect( fnActionDecoratorAfter ).toHaveBeenCalledBefore( fnControllerDecoratorAfter );
    } );

    it( 'using action exception interceptor', async () => {

        const context = {};
        const error = new Error( 'Error' );

        const fnActionExceptionDecorator = jest.fn( () => {
            return 'output';
        } );
        const ActionExceptionDecorator = createDecoratorException( fnActionExceptionDecorator );

        class SampleController {
            @ActionExceptionDecorator
            @Action()
            foo() {
                throw error;
            }
        }

        const application = new Application( {
            controllers : [ SampleController ]
        } );

        const response = await application.call( SampleController, 'foo', context );

        expect( fnActionExceptionDecorator ).toHaveBeenCalledTimes( 1 );
        expect( fnActionExceptionDecorator ).toHaveBeenCalledWith( expect.any( Object ), error, context, application );
        expect( response ).toEqual( 'output' );
    } );


    describe( 'visit method', () => {
        it( 'call visit method', async () => {
            @Controller()
            class TestController {
                @Action()
                f1() { return 'f1' }
            }

            const app = new Application( { controllers : [ TestController ] } );

            const res = await app.visit( { path : '/test/f1' } );
            expect( res ).toEqual( 'f1' );
        } );

        it( 'should call handle method if provide', async () => {

            const handle = jest.fn( () => {
                return 'h1';
            } );

            @Controller()
            class TestController {
                @Action( {
                    routing : { handle }
                } )
                f1() { return 'f1' }
            }

            const app = new Application( { controllers : [ TestController ] } );
            const res = await app.visit( { path : '/test/f1' } );
            expect( res ).toEqual( 'h1' );
            expect( handle ).toHaveBeenCalledTimes( 1 );
        } );

        it( 'call visit that routing to sub module', async () => {

            @Controller()
            class YController {
                @Action()
                z() { return 'zzz' }
            }

            @Module( { controllers : [ YController ] } )
            class SubModule {}

            const app = new Application( {
                modules : {
                    x : SubModule
                }
            } );

            const res = await app.visit( { path : '/x/y/z' } );
            expect( res ).toEqual( 'zzz' );
        } );

        it( 'correct composition', async () => {

            const context = {};
            const SubmoduleInputPipe = jest.fn();
            const SubmoduleOutputPipe = jest.fn();
            const AppInputPipe = jest.fn();
            const AppOutputPipe = jest.fn();

            @Controller()
            class YController {
                @Action() z() { return 'zzz' }
            }

            @Ctx( SubmoduleInputPipe )
            @Output( SubmoduleOutputPipe )
            @Module( { controllers : [ YController ] } )
            class SubModule {}

            @Ctx( AppInputPipe )
            @Output( AppOutputPipe )
            class App extends Application {}

            const app = new App( {
                controllers : [ YController ],
                modules : { x : SubModule }
            } );

            await app.visit( { path : '/x/y/z' }, context );

            expect( SubmoduleInputPipe ).toHaveBeenCalledTimes( 1 );
            expect( SubmoduleOutputPipe ).toHaveBeenCalledTimes( 1 );
            expect( AppInputPipe ).toHaveBeenCalledTimes( 1 );
            expect( AppOutputPipe ).toHaveBeenCalledTimes( 1 );

            expect( AppInputPipe ).toHaveBeenCalledBefore( SubmoduleInputPipe );
            expect( SubmoduleInputPipe ).toHaveBeenCalledBefore( SubmoduleOutputPipe );
            expect( SubmoduleOutputPipe ).toHaveBeenCalledBefore( AppOutputPipe );

        } );
    } );
} );
