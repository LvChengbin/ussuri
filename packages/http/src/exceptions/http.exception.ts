/******************************************************************
 * Copyright (C) 2022 LvChengbin
 *
 * File: exceptions/http.exception.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 03/06/2022
 * Description:
 ******************************************************************/

import statuses from 'statuses';
import { HttpStatus } from '../enums';

export type HttpExceptionResponse =
    | number
    | string
    | Record<string, unknown>;

export class HttpException extends Error {

    #status: number = HttpStatus.INTERNAL_SERVER_ERROR;
    #error: string = statuses.message[ HttpStatus.INTERNAL_SERVER_ERROR ] ?? '';
    #response: HttpExceptionResponse;
    #message?: any;

    constructor( response: HttpExceptionResponse, message?: any ) {
        super();

        this.#response = response;

        if( typeof response === 'number' ) {
            this.status = response;
            message && ( this.message = message );
        } else if( typeof response === 'string' ) {
            this.message = response;
        } else {
            if( typeof response.status === 'number' ) {
                this.status = response.status;
            }

            if( response.message ) {
                this.message = response.message;
            }

            if( typeof response.statusText === 'string' ) {
                this.error = response.statusText;
            }
        }
    }

    set status( status: number ) {
        this.#status = status;
        this.error = statuses.message[ status ] ?? '';
    }

    get status(): number {
        return this.#status;
    }

    set error( error: string ) {
        this.#error = error;
    }

    get error(): string {
        return this.#error;
    }

    get response(): HttpExceptionResponse {
        return this.#response;
    }

    set message( message: any ) {
        this.#message = message;
    }

    get message(): any {
        return this.#message ?? this.error;
    }

    toJSON(): HttpExceptionResponse {
        return {
            status : this.status,
            error : this.error,
            message : this.message,
            response : this.response
        };
    }
}
