/******************************************************************
 * Copyright (C) 2022 LvChengbin
 *
 * File: decorators/injectable.decorator.spec.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 02/13/2022
 * Description:
 ******************************************************************/

import { Injection, Injectable } from '../../src';

describe( 'decorators/injectable', () => {

    it( 'shoull have called Injection.defineInjectableMetadata with correct arguments', () => {

        const fn = jest.spyOn( Injection, 'defineInjectableMetadata' );

        @Injectable() class A {}

        expect( fn ).toHaveBeenCalledWith( A, {} );

        fn.mockRestore();
    } );
} );
