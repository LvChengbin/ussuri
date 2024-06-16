/******************************************************************
 * Copyright (C) 2022 LvChengbin
 *
 * File: test/config.service.spec.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 06/06/2022
 * Description:
 ******************************************************************/

import { Config, ConfigService } from '../src';

describe( 'ConfigService', () => {

    it( 'instantiate with multiple configs', () => {
        const configService = new ConfigService( {}, {} );
        expect( configService.configs ).toEqual( [
            expect.any( Config ),
            expect.any( Config )
        ] );
    } );

    it( 'should filter null options', () => {
        const configService = new ConfigService( null, {}, null, {} );
        expect( configService.configs ).toEqual( [
            expect.any( Config ),
            expect.any( Config )
        ] );
    } );

    it( 'get the whole config object', () => {
        const configService = new ConfigService( {}, {} );
        expect( configService.get() ).resolves.toEqual( {} );
    } );

    it( 'get config value in order', () => {
        const configService = new ConfigService( { name : 'Achilles' }, { name : 'Medusa', age : 100 } );
        expect( configService.get( 'name' ) ).resolves.toEqual( 'Achilles' );
        expect( configService.get( 'age' ) ).resolves.toEqual( 100 );
    } );

    it( 'undefined value should not override low level', () => {
        const configService = new ConfigService( { name : undefined }, { name : 'Medusa' } );
        expect( configService.get( 'name' ) ).resolves.toEqual( 'Medusa' );
    } );

    it( 'use default value', () => {
        const configService = new ConfigService( { name : 'Achilles' }, { name : 'Medusa', age : 100 } );
        expect( configService.get( 'name' ) ).resolves.toEqual( 'Achilles' );
        expect( configService.get( 'age' ) ).resolves.toEqual( 100 );
    } );
} );
