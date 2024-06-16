/******************************************************************
 * Copyright (C) 2022-2023 NextSeason
 *
 * @File: test/providers.spec.ts
 *
 * This file is part of NextSeason projects.
 * Code in this file can not be copied and/or distributed without the
 * express permission of NextSeason. Inc
 ******************************************************************/

import { Inject, Injection, Injectable } from '../src';

describe( 'providers', () => {

    describe( 'FactoryProvider', () => {

        it( 'instantiate a provider dependent factory provider', () => {

            const injection = new Injection( {
                providers : [ {
                    provide : 'service',
                    useFactory() {
                        return 'factory provider';
                    }
                } ]
            } );

            const instance = injection.instantiate( 'service' );
            expect( instance ).toEqual( 'factory provider' );
        } );

        it( 'instantiate a provider dependent factory provider', () => {
            class SampleService {}

            @Injectable()
            class SampleProvider {
                constructor( @Inject( 'service' ) public service: SampleService ) {}
            }

            const injection = new Injection( {
                providers : [ SampleProvider, {
                    provide : 'service',
                    useFactory() {
                        return new SampleService();
                    }
                } ]
            } );

            const instance = injection.instantiate( SampleProvider );
            expect( instance.service ).toBeInstanceOf( SampleService );
        } );

        it( 'factory provider with inject list', () => {

            class SampleService {}

            const injection = new Injection( {
                providers : [ SampleService, {
                    provide : 'service',
                    useFactory( service: SampleService ) {
                        return service;
                    },
                    inject : [ SampleService ]
                } ]
            } );

            const instance = injection.instantiate( 'service' );
            expect( instance ).toBeInstanceOf( SampleService );
        } );

        it( 'factory provider with static args', () => {

            class SampleService {}

            const injection = new Injection( {
                providers : [ SampleService, {
                    provide : 'service',
                    useFactory( name: string, service: SampleService ) {
                        return { name, service };
                    },
                    args : [ 'sample' ],
                    inject : [ SampleService ]
                } ]
            } );

            const instance = injection.instantiate( 'service' );
            expect( instance.name ).toEqual( 'sample' );
            expect( instance.service ).toBeInstanceOf( SampleService );
        } );
    } );

} );
