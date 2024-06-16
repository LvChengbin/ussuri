/******************************************************************
 * Copyright (C) 2022-2023 NextSeason
 *
 * @File: pipes/match.pipe.spec.ts
 *
 * This file is part of NextSeason projects.
 * Code in this file can not be copied and/or distributed without the
 * express permission of NextSeason. Inc
 ******************************************************************/

import statuses from 'statuses';
import { ParameterPipeMetadata, Pipe } from '@ussuri/core';
import { Application, Match } from '../../src';
import { createContext } from '../helpers/context';
import { createParameterPipeMetadata } from '../helpers/metadata';

describe( 'Match Pipe', () => {

    const application = new Application();
    const context = createContext();

    const metadata = ( property = 'id', pipes: Pipe[] = [] ): ParameterPipeMetadata => {
        return createParameterPipeMetadata( {
            data : { property, pipes }
        } );
    };

    describe( 'pass validation', () => {
        it( 'matches a string', async () => {
            await expect( Match( 'abc' )( 'abc', context, application, metadata ) ).resolves.toEqual( 'abc' );
        } );

        it( 'matches a RegExp', async () => {
            await expect( Match( /abc/ )( 'abc', context, application, metadata ) ).resolves.toEqual( 'abc' );
        } );

        it( 'matches a list of string, and RegExp', async () => {
            const fn = Match( [ /abc/, 'def' ] );
            await expect( fn( 'abc', context, application, metadata ) ).resolves.toEqual( 'abc' );
            await expect( fn( 'def', context, application, metadata ) ).resolves.toEqual( 'def' );
        } );

        it( 'should convert number to string', async () => {
            await expect( Match( '123' )( 123, context, application, metadata() ) ).resolves.toEqual( 123 );
        } );
    } );

    describe( 'default exception', () => {

        const fn1 = Match( 'string' );
        const fn2 = Match( /regexp/ );
        const fn3 = Match( [ 'string', /regexp/ ] );
        const meta = metadata();

        it( 'string pattern', async () => {
            const defaultExceptionResponse = {
                status : 400,
                error : statuses.message[ 400 ],
                message : [ 'id should match "string"' ]
            };

            await expect( fn1( 'xstring', context, application, meta ) ).rejects.toThrowUssuriHttpException( defaultExceptionResponse );
            await expect( fn1( 'stringx', context, application, meta ) ).rejects.toThrowUssuriHttpException( defaultExceptionResponse );
            await expect( fn1( 'abc', context, application, meta ) ).rejects.toThrowUssuriHttpException( defaultExceptionResponse );
        } );

        it( 'regexp pattern', async () => {
            const defaultExceptionResponse = {
                status : 400,
                error : statuses.message[ 400 ],
                message : [ `id should match "${/regexp/.toString()}"` ]
            };

            await expect( fn2( 'abc', context, application, meta ) ).rejects.toThrowUssuriHttpException( defaultExceptionResponse );
            await expect( fn2( 2, context, application, meta ) ).rejects.toThrowUssuriHttpException( defaultExceptionResponse );
        } );

        it( 'mixed patterns', async () => {

            const defaultExceptionResponse = {
                status : 400,
                error : statuses.message[ 400 ],
                message : [ 'id should match any of [ "string", /regexp/ ]' ]
            };

            await expect( fn3( 'abc', context, application, meta ) ).rejects.toThrowUssuriHttpException( defaultExceptionResponse );
            await expect( fn3( 2, context, application, meta ) ).rejects.toThrowUssuriHttpException( defaultExceptionResponse );
        } );

        it( 'correct error message while metadata.property is not empty', async () => {
            await expect( fn1( 'abc', context, application, meta ) ).rejects.toThrowUssuriHttpException( {
                status : 400,
                error : statuses.message[ 400 ],
                message : [ 'id should match "string"' ]
            } );

            await expect( fn2( 'abc', context, application, meta ) ).rejects.toThrowUssuriHttpException( {
                status : 400,
                error : statuses.message[ 400 ],
                message : [ `id should match "${/regexp/.toString()}"` ]
            } );
        } );

        it( 'correct error message while metadata.property is empty', async () => {
            await expect( fn1( 'a', context, application, createParameterPipeMetadata() ) ).rejects.toThrowUssuriHttpException( {
                status : 400,
                error : statuses.message[ 400 ],
                message : [ 'parameter does not match "string"' ]
            } );
        } );

    } );
} );
