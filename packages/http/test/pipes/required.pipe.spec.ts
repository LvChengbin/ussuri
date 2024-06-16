/******************************************************************
 * Copyright (C) 2022-2023 NextSeason
 *
 * @File: pipes/required.pipe.spec.ts
 *
 * This file is part of NextSeason projects.
 * Code in this file can not be copied and/or distributed without the
 * express permission of NextSeason. Inc
 ******************************************************************/

import statuses from 'statuses';
import { ParameterPipeMetadata, Pipe } from '@ussuri/core';
import { createContext } from '../helpers/context';
import { createParameterPipeMetadata } from '../helpers/metadata';
import { Application, Required } from '../../src';

describe( 'Required Pipe', () => {

    const application = new Application();
    const context = createContext();

    const metadata = ( property = 'id', pipes: Pipe[] = [] ): ParameterPipeMetadata => {
        return createParameterPipeMetadata( {
            data : { property, pipes }
        } );
    };

    it( 'should have returned a function', () => {
        expect( Required() ).toBeInstanceOf( Function );
    } );

    it( 'should have returned the original given value', async () => {
        const data = {};
        expect( await Required()( data, context, metadata() ) ).toBe( data );
    } );

    it( 'should return the given value if the value is not undefined or null', async () => {
        await expect( Required()( 0, context, application, metadata() ) ).resolves.toEqual( 0 );
        await expect( Required()( '0', context, application, metadata() ) ).resolves.toEqual( '0' );
    } );

    describe( 'default exception', () => {

        const fn = Required();
        const meta = metadata();

        it( 'should have thrown an error if the given value is null', async () => {
            await expect( fn( null, context, application, meta ) ).rejects.toThrowUssuriHttpException();
        } );

        it( 'should have thrown an error if the given value is undefined', async () => {
            await expect( fn( undefined, context, application, meta ) ).rejects.toThrowUssuriHttpException();
        } );

        it( 'should have thrown exception if the given value is an empty string', async () => {
            await expect( fn( '', context, application, meta ) ).rejects.toThrowUssuriHttpException();
        } );

        it( 'should have thrown HttpException with correct response', async () => {
            return expect( fn( undefined, context, application, meta ) ).rejects.toThrowUssuriHttpException( {
                status : 400,
                error : statuses.message[ 400 ],
                message : [ 'id is required' ]
            } );
        } );

        it( 'should thrown HttpException with correct message if metadata.data.property is empty', async () => {
            return expect( fn( undefined, context, application, createParameterPipeMetadata() ) ).rejects.toThrowUssuriHttpException( {
                status : 400,
                error : statuses.message[ 400 ],
                message : [ 'missing parameter' ]
            } );
        } );
    } );

    describe( 'custom exception', () => {
        const fn = Required( new Error( 'something error' ) );
        const meta = metadata();

        it( 'should have thrown an error if the given value is null', async () => {
            await expect( fn( null, context, application, meta ) ).rejects.toThrow( Error );
            await expect( fn( null, context, application, meta ) ).rejects.toThrow( 'something error' );
        } );

        it( 'should have thrown an error if the given value is undefined', async () => {
            await expect( fn( undefined, context, application, meta ) ).rejects.toThrow( Error );
            await expect( fn( undefined, context, application, meta ) ).rejects.toThrow( 'something error' );
        } );

        it( 'should use the options for creating HttpException', async () => {
            const args = {
                status : 401,
                error : statuses.message[ 401 ],
                message : [ 'error message' ]
            };
            return expect( Required( args )( undefined, context, application, meta ) ).rejects.toThrowUssuriHttpException( args );
        } );
    } );
} );
