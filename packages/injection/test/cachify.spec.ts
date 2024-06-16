/******************************************************************
 * Copyright (C) 2022 LvChengbin
 *
 * File: test/cachify.spec.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 02/10/2022
 * Description:
 ******************************************************************/

import { Cachify } from '../src/cachify';

describe( 'Cachify', () => {
    it( 'should return corrent value', () => {
        const cachify = new Cachify( {
            async executor( key: string ): Promise<string> {
                return key;
            }
        } );

        expect( cachify.get( 'key' ) ).resolves.toBe( 'key' );
    } );

    it( 'should call executor with correct arguments', async () => {
        const executor = jest.fn() as jest.MockedFunction<( name: string, id: number ) => Promise<string>>;
        const cachify = new Cachify( { executor } );
        await cachify.get( 'key', 1 );
        expect( executor ).toHaveBeenCalledWith( 'key', 1 );
    } );

    it( 'should get data from cache', () => {

        let i = 0;

        function id(): number {
            return i++;
        }

        const cachify = new Cachify( {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            async executor( key: string ): Promise<number> {
                return id();
            }
        } );

        expect( cachify.get( 'key' ) ).resolves.toBe( 0 );
        expect( cachify.get( 'key' ) ).resolves.toBe( 0 );
    } );

    it( 'should use custom keyGenerator', async () => {

        const cachify = new Cachify( {
            async executor( key: string ): Promise<string> {
                return key;
            },
            keyGenerator( key: string ): string {
                return `${key}-${key}`;
            }
        } );

        await cachify.get( 'key' );

        expect( cachify.cache.get( 'key-key' ) ).resolves.toBe( 'key' );
    } );

    it( 'should call keyGenerator function with correct arguments', async () => {
        const keyGenerator = jest.fn() as jest.MockedFunction<( key: string, id: number ) => string>;
        const cachify = new Cachify( {
            async executor( key: string, id: number ): Promise<{ key: string; id: number }> {
                return { key, id };
            },
            keyGenerator
        } );

        await cachify.get( 'key', 1 );

        expect( keyGenerator ).toHaveBeenCalledWith( 'key', 1 );
    } );
} );
