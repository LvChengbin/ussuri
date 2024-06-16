/******************************************************************
 * Copyright (C) 2022-2023 NextSeason
 *
 * @File: utils/compose.spec.ts
 *
 * This file is part of NextSeason projects.
 * Code in this file can not be copied and/or distributed without the
 * express permission of NextSeason. Inc
 ******************************************************************/

import { Application, Ctx, Output, Exception, Finally } from '../../src';
import { compose } from '../../src/utils';

describe( 'compose', () => {
    describe( 'interceptors in options', () => {

        it( 'call options.interceptors and application interceptors in correct order', async () => {

            const context = {};
            const interceptorInput = jest.fn();
            const interceptorOutput = jest.fn();
            const interceptorException = jest.fn();
            const interceptorFinally = jest.fn();
            const inputPipe = jest.fn();
            const outputPipe = jest.fn();
            const finallyPipe = jest.fn();
            const exceptionPipe = jest.fn();
            const callback = jest.fn();


            @Ctx( inputPipe )
            @Output( outputPipe )
            @Exception( exceptionPipe )
            @Finally( finallyPipe )
            class Test extends Application {
            }

            const app = new Test();

            await compose( app, context, callback, {
                interceptors : {
                    input : interceptorInput,
                    output : interceptorOutput,
                    exception : interceptorException,
                    finally : interceptorFinally
                }
            } );

            expect( interceptorInput ).toHaveBeenCalledTimes( 1 );
            expect( interceptorOutput ).toHaveBeenCalledTimes( 1 );
            expect( interceptorException ).toHaveBeenCalledTimes( 0 );
            expect( interceptorFinally ).toHaveBeenCalledTimes( 1 );

            expect( interceptorInput ).toHaveBeenCalledBefore( inputPipe );
            expect( inputPipe ).toHaveBeenCalledBefore( outputPipe );
            expect( outputPipe ).toHaveBeenCalledBefore( interceptorOutput );
            expect( interceptorOutput ).toHaveBeenCalledBefore( finallyPipe );
            expect( finallyPipe ).toHaveBeenCalledBefore( interceptorFinally );
        } );
    } );
} );
