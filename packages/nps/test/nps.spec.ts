/******************************************************************
 * Copyright (C) 2022 LvChengbin
 *
 * File: test/nps.spec.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 05/18/2022
 * Description:
 ******************************************************************/

import { NPS } from '../src';
import { TestApplication } from './fixtures/application';

describe( 'NPS', () => {

    describe( 'default status', () => {
        it( 'uninjected', () => {
            expect( NPS.injected ).toEqual( false );
        } );

        it( 'empty registry', () => {
            expect( NPS.registry ).toEqual( {} );
        } );

        it( 'empty service map', () => {
            expect( NPS.services ).toEqual( {} );
        } );

        it( 'no config', () => {
            expect( NPS.config ).toEqual( null );
        } );
    } );

    describe( 'before injected', () => {
        beforeAll( () => {
            NPS.register( '@services/test', TestApplication );
            NPS.config = {
                '1.test.service' : {
                    serviceType : 'NPS',
                    serviceName : '@services/test',
                    serviceConf : {
                        name : 'test 1'
                    }
                },
                '2.test.service' : {
                    serviceType : 'NPS',
                    serviceName : '@services/test',
                    serviceConf : {
                        name : 'test 2'
                    }
                },
                '3.test.service' : {
                    serviceType : 'HTTP',
                    address : 'www.test-service.com'
                }
            };
        } );

        it( 'registry', () => {
            expect( NPS.registry ).toEqual( {
                '@services/test' : {
                    application : TestApplication
                }
            } );
        } );

        it( 'services', () => {
            expect( NPS.services ).toEqual( {
                '1.test.service' : {
                    serviceType : 'NPS',
                    serviceName : '@services/test',
                    serviceConf : {
                        name : 'test 1'
                    },
                    application : expect.any( TestApplication )
                },
                '2.test.service' : {
                    serviceType : 'NPS',
                    serviceName : '@services/test',
                    serviceConf : {
                        name : 'test 2'
                    },
                    application : expect.any( TestApplication )
                },
                '3.test.service' : {
                    serviceType : 'HTTP',
                    address : 'www.test-service.com'
                }
            } );
        } );

        it( 'get service with domain before injected', () => {
            expect( NPS.service( '1.test.service' ) ).toEqual( null );
        } );
    } );

    describe( 'injected', () => {
        beforeAll( () => {
            NPS.inject();
        } );

        it( 'get service with domain', () => {
            expect( NPS.service( '1.test.service' ) ).toEqual( {
                serviceType : 'NPS',
                serviceName : '@services/test',
                serviceConf : {
                    name : 'test 1'
                },
                application : expect.any( TestApplication )
            } );
        } );

        it( 'pass config correctly', async () => {
            const res = await NPS.service( '1.test.service' ).application.handle( {
                url : '/'
            } );
            expect( res.response.body ).toEqual( 'test 1' );
        } );
    } );
} );
