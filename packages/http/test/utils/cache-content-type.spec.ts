/******************************************************************
 * Copyright (C) 2022 LvChengbin
 *
 * File: utils/cache-content-type.spec.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 01/21/2022
 * Description:
 ******************************************************************/

import mimetypes from 'mime-types';
import cacheContentType from '../../src/utils/cache-content-type';

describe( 'utils/cache-content-type', () => {
    it( 'should return correct content type', () => {
        expect( cacheContentType( 'html' ) ).toEqual( 'text/html; charset=utf-8' );
    } );

    it( 'should work with cache', () => {
        cacheContentType( 'json' );
        jest.spyOn( mimetypes, 'contentType' );
        expect( cacheContentType( 'json' ) ).toEqual( 'application/json; charset=utf-8' );
    } );
} );
