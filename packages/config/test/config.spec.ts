/******************************************************************
 * Copyright (C) 2022 LvChengbin
 *
 * File: test/config.spec.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 06/06/2022
 * Description:
 ******************************************************************/

import { Config } from '../src';

describe( 'config', () => {

    describe( 'Config#get', () => {

        const data = {
            database : {
                mysql : {
                    host : '127.0.0.1',
                    password : 'test',
                    port : 3306,
                    database : 'test'
                },
                'mysql.account' : {
                    host : 'localhost'
                },
                cassandra : null
            },
            'database.mongodb' : 'mongodb://127.0.0.1/test',
            list : [ 'A', 'B' ]
        };

        const config = new Config( data );

        it( 'get the whole config object', () => {
            expect( config.get() ).resolves.toEqual( data );
        } );

        it( 'get existing value', () => {
            expect( config.get( 'database.mysql.host' ) ).resolves.toEqual( '127.0.0.1' );
            expect( config.get( 'database.mysql.host', 'x' ) ).resolves.toEqual( '127.0.0.1' );
        } );

        it( 'get value with key has dot', () => {
            expect( config.get( 'database.mongodb' ) ).resolves.toEqual( 'mongodb://127.0.0.1/test' );
        } );

        it( 'get nonexisting value', () => {
            expect( config.get( 'a.b.c.d' ) ).resolves.toEqual( undefined );
        } );

        it( 'get nonexisting value with default value', () => {
            expect( config.get( 'a.b.c.d', 'x' ) ).resolves.toEqual( 'x' );
        } );

        it( 'get a null value', () => {
            expect( config.get( 'database.cassandra', 'x' ) ).resolves.toEqual( null );
        } );

        it( 'cannot get properties in prototype chain', () => {
            expect( config.get( 'database.mongodb.length' ) ).resolves.toEqual( undefined );
        } );

        it( 'get value from an array with index', () => {
            expect( config.get( 'list.0' ) ).resolves.toEqual( 'A' );
        } );
    } );
} );
