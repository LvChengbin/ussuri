/******************************************************************
 * Copyright (C) 2022 LvChengbin
 *
 * File: dataclass/dataclass.spec.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 05/29/2022
 * Description:
 ******************************************************************/

import { Property, Dataclass, DataclassMetadata, DATACLASS_METADATA_KEY } from '../../src';

describe( 'Dataclass', () => {

    describe( 'Dataclass.defineMetadata()', () => {
        it( 'should store correct metadata', () => {
            const metadata = new DataclassMetadata();
            class TestData {}
            Dataclass.defineMetadata( TestData, metadata );
            expect( Reflect.getMetadata( DATACLASS_METADATA_KEY, TestData ) ).toEqual( metadata );
        } );
    } );

    describe( 'Dataclass.metadata()', () => {
        it( 'should get correct metadata', () => {
            const metadata = new DataclassMetadata();
            class TestData {}
            Reflect.defineMetadata( DATACLASS_METADATA_KEY, metadata, TestData );
            expect( Dataclass.metadata( TestData ) ).toEqual( metadata );
        } );
    } );

    describe( 'Dataclass.create', () => {
        class TestData {
            @Property() name: string;
            @Property() age: number;
        }

        it( 'should pick properties in dataclass', async () => {
            const data = await Dataclass.create( TestData, {
                name : 'Achilles',
                age : 10,
                sex : 'male'
            } );

            expect( data ).toEqual( {
                name : 'Achilles',
                age : 10
            } );
        } );

        it( 'shoule not include properties whose values are undefined', async () => {
            const data = await Dataclass.create( TestData, {
                name : 'Achilles',
                age : undefined,
                sex : 'male'
            } );

            expect( data ).toEqual( {
                name : 'Achilles'
            } );
        } );

        it( 'should throw error if the first argument is not a dataclass', () => {
            class TestData {}
            expect( Dataclass.create( TestData, {} ) ).rejects.toThrow();
        } );
    } );
} );
