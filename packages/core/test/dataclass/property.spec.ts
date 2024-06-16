/******************************************************************
 * Copyright (C) 2022 LvChengbin
 *
 * File: dataclass/property.spec.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 05/29/2022
 * Description:
 ******************************************************************/

import { Property, Dataclass, DataclassMetadata } from '../../src';

describe( '@Property()', () => {

    it( 'set property without pipes', () => {
        class TestData {
            @Property() name: string;
        }

        const metadata = Dataclass.metadata( TestData );

        expect( metadata ).toBeInstanceOf( DataclassMetadata );
        expect( metadata ).toHaveProperty( 'properties', {
            name : {
                linked : new Set(),
                type : String,
                pipes : []
            }
        } );
    } );

    it( 'using with process options of pipes', () => {

        const pipes = [ jest.fn(), jest.fn() ];

        class TestData {
            @Property( ...pipes )
            name: string;
        }

        const metadata = Dataclass.metadata( TestData );
        expect( metadata ).toHaveProperty( 'properties', {
            name : {
                linked : new Set(),
                type : String,
                pipes
            }
        } );
    } );
} );
