/******************************************************************
 * Copyright (C) 2022 LvChengbin
 *
 * File: injection/instance-cache.spec.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 02/11/2022
 * Description:
 ******************************************************************/

import { InstanceCache } from '../src/instance-cache';

describe( 'injection/instance-cache', () => {
    it( 'should return null if cache not exists', () => {
        const cache = new InstanceCache();
        expect( cache.get( 'non-existent key' ) ).toBe( null );
    } );

    it( 'should return value from caceh', () => {
        const cache = new InstanceCache();
        cache.set( 'key', 'value' );
        expect( cache.get( 'key' ) ).toBe( 'value' );
    } );
} );
