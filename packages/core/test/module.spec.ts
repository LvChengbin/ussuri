/******************************************************************
 * Copyright (C) 2022 LvChengbin
 *
 * File: test/module.spec.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 03/09/2022
 * Description:
 ******************************************************************/

import { createDecoratorBefore, createDecoratorAfter } from '@ussuri/method-interceptor';
import { Application, Module, Action, Metadata } from '../src';

describe( 'Module', () => {
    it( 'should return an instance of Application from Application.create()', () => {
        @Module()
        class MainModule {}
        const app = Application.create( MainModule );
        expect( app ).toBeInstanceOf( Application );
    } );

    it( 'should call module interceptors in correct order', async () => {
        const context = {};

        const fnControllerDecoratorBefore = jest.fn();
        const fnControllerDecoratorAfter = jest.fn( ( metadata: Metadata<unknown>, value: string ) => {
            return value;
        } );

        const fnModuleDecoratorBefore = jest.fn();
        const fnModuleDecoratorAfter = jest.fn( ( metadata: Metadata<unknown>, value: string ) => {
            return `${value}${value}`;
        } );

        const ControllerDecoratorBefore = createDecoratorBefore( fnControllerDecoratorBefore );
        const ControllerDecoratorAfter = createDecoratorAfter( fnControllerDecoratorAfter );

        const ModuleDecoratorBefore = createDecoratorBefore( fnModuleDecoratorBefore );
        const ModuleDecoratorAfter = createDecoratorAfter( fnModuleDecoratorAfter );

        @ControllerDecoratorBefore
        @ControllerDecoratorAfter
        class SampleController {
            @Action()
            foo() { return 'bar' }
        }

        @ModuleDecoratorBefore
        @ModuleDecoratorAfter
        @Module( {
            controllers : [ SampleController ]
        } )
        class MainModule {}

        const application = Application.create( MainModule );
        const response = await application.call( SampleController, 'foo', context );
        expect( response ).toEqual( 'barbar' );

        expect( fnControllerDecoratorAfter ).toHaveBeenCalledBefore( fnModuleDecoratorAfter );
        expect( fnModuleDecoratorBefore ).toHaveBeenCalledBefore( fnControllerDecoratorBefore );
    } );
} );
