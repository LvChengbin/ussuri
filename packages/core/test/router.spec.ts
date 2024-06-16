/******************************************************************
 * Copyright (C) 2022-2023 NextSeason
 *
 * @File: test/router.spec.ts
 *
 * This file is part of NextSeason projects.
 * Code in this file can not be copied and/or distributed without the
 * express permission of NextSeason. Inc
 ******************************************************************/

import { Scope } from '@ussuri/injection';
import { Router } from '../src/router';
import { Application } from '../src/application';
import { Controller, getControllerRoutingMetadata } from '../src/controller';
import { Action, getActionRoutingMetadata } from '../src/action';
import { DEFAULT_ROUTING_GROUP_NAME } from '../src/constants';

describe( 'Router', () => {
    describe( 'add', () => {
        it( 'shoud return the router instance from add method', () => {
            const router = new Router();
            expect( router.add( { pattern : '/' } ) ).toBe( router );
        } );

        it( 'should add rule into rules', () => {
            const router = new Router();
            const rule = { pattern : '/', group : 'x' };
            router.add( rule );
            expect( router.rules ).toEqual( {
                x : [ {
                    rule,
                    keys : [],
                    pattern : expect.any( RegExp )
                } ]
            } );
        } );

        it( 'should group rules in correct way', () => {
            const router = new Router();
            const r1 = { pattern : '/r1', group : 'x' };
            const r2 = { pattern : '/r2', group : 'x' };
            const r3 = { pattern : '/r3', group : 'y' };
            const r4 = { pattern : '/r4', group : 'y' };
            router.add( r1 );
            router.add( r2 );
            router.add( r3 );
            router.add( r4 );
            expect( router.rules ).toEqual( {
                x : [ {
                    rule : r1,
                    keys : [],
                    pattern : expect.any( RegExp )
                }, {
                    rule : r2,
                    keys : [],
                    pattern : expect.any( RegExp )
                } ],
                y : [ {
                    rule : r3,
                    keys : [],
                    pattern : expect.any( RegExp )
                }, {
                    rule : r4,
                    keys : [],
                    pattern : expect.any( RegExp )
                } ]
            } );
        } );

        it( 'should combine multiple patterns in sigle rule', () => {
            const router = new Router();
            const rule = {
                group : 'x',
                pattern : [
                    [ '/a', '/b' ],
                    [ '1', '2' ]
                ]
            };
            router.add( rule );
            expect( router.rules.x.length ).toEqual( 4 );
        } );
    } );

    describe( 'match', () => {

        it( 'should return false with empty router', () => {
            const router = new Router();
            expect( router.match( '*' ) ).toEqual( false );
            expect( router.match( {} ) ).toEqual( false );
        } );

        it( 'should return false if no rules matched', () => {
            const router = new Router();
            router.add( { pattern : '/a' } );
            expect( router.match( '/b' ) ).toEqual( false );
        } );

        it( 'should match with correct rule', () => {
            const router = new Router();
            router.add( { pattern : '/a' } );
            const matches = router.match( { path : '/a' } );
            expect( matches ).toBeTruthy();
            expect( matches.rule.pattern ).toEqual( '/a' );
        } );

        it( 'should try matching namespace', () => {
            const router = new Router();
            router.add( { namespace : 'test', pattern : '/a' } );
            const matches = router.match( {
                namespace : 'test',
                path : '/a'
            } );
            expect( matches ).toBeTruthy();
            expect( matches.rule.pattern ).toEqual( '/a' );
            expect( router.match( { namespace : 'x', path : '/a' } ) ).toEqual( false );
        } );

        it( 'should match in same rules', () => {
            const router = new Router();
            router.add( { group : 'x', pattern : '/a' } );
            const matches = router.match( {
                group : 'x',
                path : '/a'
            } );
            expect( matches ).toBeTruthy();
            expect( matches.rule.pattern ).toEqual( '/a' );
            expect( router.match( { path : '/a' } ) ).toBeFalsy();
        } );

    } );

    describe( '@Controller', () => {

        it( 'should use controller name as pattern if pattern is not provided', () => {

            @Controller()
            @Controller( {
                routing : {
                    group : 'x'
                }
            } )
            class TestController {}

            const metadata = getControllerRoutingMetadata( TestController );

            expect( metadata.rules[ DEFAULT_ROUTING_GROUP_NAME ] ).toEqual( [ {
                pattern : 'test'
            } ] );

            expect( metadata.rules.x ).toEqual( [ {
                pattern : 'test'
            } ] );
        } );

        it( 'should support using a string as argument', () => {

            @Controller( '/' )
            class TestController {}

            const metadata = getControllerRoutingMetadata( TestController );

            expect( metadata.rules[ DEFAULT_ROUTING_GROUP_NAME ] ).toEqual( [ {
                pattern : '/'
            } ] );
        } );

        it( 'should support using a RegExp as argument', () => {

            const pattern = /^\//;

            @Controller( pattern )
            class TestController {}

            const metadata = getControllerRoutingMetadata( TestController );

            expect( metadata.rules[ DEFAULT_ROUTING_GROUP_NAME ] ).toEqual( [ {
                pattern
            } ] );
        } );

        it( 'should support using an array as argument', () => {
            const pattern = /^\//;

            @Controller( [ pattern, '/' ] )
            class TestController {}

            const metadata = getControllerRoutingMetadata( TestController );

            expect( metadata.rules[ DEFAULT_ROUTING_GROUP_NAME ] ).toEqual( [
                { pattern },
                { pattern : '/' }
            ] );
        } );

        it( 'should support using mixed options', () => {
            @Controller( {
                scope : Scope.REQUEST,
                routing : {
                    pattern : '/'
                }
            } )
            class TestController {}

            const metadata = getControllerRoutingMetadata( TestController );

            expect( metadata.rules[ DEFAULT_ROUTING_GROUP_NAME ] ).toEqual( [
                { pattern : '/' }
            ] );
        } );

        it( 'should support using mixed options with complex routing', () => {

            const reg = /^\//;

            @Controller( {
                scope : Scope.REQUEST,
                routing : [ '/', reg, { pattern : '/a' } ]
            } )
            class TestController {}

            const metadata = getControllerRoutingMetadata( TestController );

            expect( metadata.rules[ DEFAULT_ROUTING_GROUP_NAME ] ).toEqual( [
                { pattern : '/' },
                { pattern : reg },
                { pattern : '/a' }
            ] );
        } );

        it( 'should support adding controller multiple times', () => {
            @Controller( '/a' )
            @Controller( '/b' )
            @Controller( [ { group : 'x', pattern : '/x' } ] )
            @Controller( [ { group : 'x', pattern : '/y' } ] )
            class TestController {}

            const metadata = getControllerRoutingMetadata( TestController );

            expect( metadata.rules[ DEFAULT_ROUTING_GROUP_NAME ] ).toEqual( [
                { pattern : '/b' },
                { pattern : '/a' }
            ] );

            expect( metadata.rules.x ).toEqual( [
                { pattern : '/y' },
                { pattern : '/x' }
            ] );
        } );
    } );

    describe( '@Action', () => {
        it( 'should use action name as pattern if not provided', () => {

            class TestController {
                @Action()
                fn() {}
            }

            const metadata = getActionRoutingMetadata( TestController.prototype, 'fn' );

            expect( metadata.rules[ DEFAULT_ROUTING_GROUP_NAME ] ).toEqual( [ {
                pattern : 'fn'
            } ] );
        } );

        it( 'should support providing mutliple patterns', () => {
            class TestController {
                @Action( [ '/', '/a' ] )
                fn() {}
            }

            const metadata = getActionRoutingMetadata( TestController.prototype, 'fn' );

            expect( metadata.rules[ DEFAULT_ROUTING_GROUP_NAME ] ).toEqual( [
                { pattern : '/' },
                { pattern : '/a' }
            ] );
        } );

        it( 'should support adding action multiple times', () => {
            class TestController {
                @Action()
                @Action( 'a' )
                fn() {}
            }

            const metadata = getActionRoutingMetadata( TestController.prototype, 'fn' );

            expect( metadata.rules[ DEFAULT_ROUTING_GROUP_NAME ] ).toEqual( [
                { pattern : 'a' },
                { pattern : 'fn' }
            ] );
        } );
    } );

    describe( '@Controller and @Action', () => {
        it( 'should not generate routing rules if the class has no actions', () => {

            @Controller()
            class TestController {}

            const app = new Application( {
                controllers : [ TestController ]
            } );

            expect( app.router.rules ).toEqual( {} );
        } );

        it( 'should combind controller and action routing rules with default group name', () => {
            @Controller( '/a' )
            class TestController {
                @Action( 'b' )
                fn() {}
            }

            const app = new Application( {
                controllers : [ TestController ]
            } );

            expect( app.router.rules[ DEFAULT_ROUTING_GROUP_NAME ][ 0 ].rule.pattern ).toEqual( [
                '/a', 'b'
            ] );
        } );

        it( 'should group rules correctly', () => {
            @Controller( '/a' )
            @Controller( {
                routing : {
                    group : 'x',
                    pattern : '/x'
                }
            } )
            class TestController {
                @Action( 'b' )
                @Action( {
                    routing : {
                        group : 'x',
                        pattern : 'y'
                    }
                } )
                fn() {}
            }

            const app = new Application( {
                controllers : [ TestController ]
            } );

            const rules = app.router.rules;

            expect( rules[ DEFAULT_ROUTING_GROUP_NAME ][ 0 ].rule.pattern ).toEqual( [
                '/a', 'b'
            ] );

            expect( rules.x[ 0 ].rule.pattern ).toEqual( [ '/x', 'y' ] );
        } );
    } );

    it( 'should save handle into rule object if exists in controller', () => {

        const handle = () => {};

        @Controller( {
            routing : { handle }
        } )
        class TestController {
            @Action()
            fn() {}
        }

        const app = new Application( { controllers : [ TestController ] } );

        expect( app.router.rules[ DEFAULT_ROUTING_GROUP_NAME ][ 0 ].rule.handle ).toEqual( handle );
    } );

    it( 'should use handle function in action routing rule if exists', () => {
        const handle = () => {};

        @Controller( {
            routing : { handle() {} }
        } )
        class TestController {
            @Action( { routing : { handle } } )
            fn() {}
        }

        const app = new Application( { controllers : [ TestController ] } );

        expect( app.router.rules[ DEFAULT_ROUTING_GROUP_NAME ][ 0 ].rule.handle ).toEqual( handle );
    } );
} );
