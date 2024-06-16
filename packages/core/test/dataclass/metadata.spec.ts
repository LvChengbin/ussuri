/******************************************************************
 * Copyright (C) 2022 LvChengbin
 *
 * File: dataclass/metadata.spec.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 05/29/2022
 * Description:
 ******************************************************************/

import { DataclassMetadata, Dataclass, Property } from '../../src';

describe( 'DataclassMetadata', () => {
    it( 'DataclassMetadata instance should have correct properties', () => {
        const metadata = new DataclassMetadata();
        expect( metadata.pipes ).toEqual( [] );
        expect( metadata.properties ).toEqual( {} );
    } );

    it( 'set property with pipes', () => {
        const metadata = new DataclassMetadata();
        const pipe1 = () => {};
        const pipe2 = () => {};

        metadata.setProperty( 'name', String, pipe1, pipe2 );
        expect( metadata.properties ).toEqual( {
            name : {
                linked : new Set(),
                type : String,
                pipes : [ pipe1, pipe2 ]
            }
        } );
    } );

    it( 'set property without pipes', () => {
        const metadata = new DataclassMetadata();
        metadata.setProperty( 'name', String );
        expect( metadata.properties ).toEqual( {
            name : {
                linked : new Set(),
                type : String,
                pipes : []
            }
        } );
    } );

    it( 'get property', () => {
        const metadata = new DataclassMetadata();
        const pipe1 = () => {};
        const pipe2 = () => {};

        metadata.setProperty( 'name', String, pipe1, pipe2 );
        expect( metadata.getProperty( 'name' ) ).toEqual( {
            linked : new Set(),
            type : String,
            pipes : [ pipe1, pipe2 ]
        } );
    } );

    it( 'should return null while get a nonexistence property', () => {
        const metadata = new DataclassMetadata();
        expect( metadata.getProperty( 'name' ) ).toEqual( null );
    } );

    describe( 'DataclassMetadata.pipes()', () => {

        it( 'collect pipes recursively', () => {
            function p1() {}
            function p2() {}
            function p3() {}
            function p4() {}
            function p5() {}
            function p6() {}
            function p7() {}
            function p8() {}
            function p9() {}
            function p10() {}

            @Dataclass( p7, p8 )
            class B {
                @Property( p9, p10 ) name: string;
            }

            @Dataclass( p1, p2 )
            class A {
                @Property( p3, p4 ) name: string;

                @Property( p5, p6 ) b: B;
            }

            const metadata = Dataclass.metadata( A );
            const pipes = DataclassMetadata.pipes( metadata );
            expect( pipes ).toEqual( [ p1, p2, p3, p4, p5, p6, p7, p8, p9, p10 ] );
        } );
    } );
} );
