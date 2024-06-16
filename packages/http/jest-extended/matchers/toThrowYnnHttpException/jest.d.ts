/// <reference types="jest" />

import { HttpException, HttpExceptionResponse } from '../../../src';

declare global {
    declare namespace jest {
        interface Matchers<R> {
            toThrowUssuriHttpException: ( response?: number | string | HttpExceptionResponse | HttpException, error?: string ) => R;
        }
    }
}
