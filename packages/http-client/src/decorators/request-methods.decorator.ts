/******************************************************************
 * Copyright (C) 2022 LvChengbin
 *
 * File: decorators/request-methods.decorator.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 05/07/2022
 * Description:
 ******************************************************************/

import { Action as CoreAction, ActionOptions as CoreActionOptions, InputMetadata } from '@ussuri/core';
import { createInputDecorator } from '@ussuri/core/decorator';
import { RequestMethod } from '@ussuri/http/interfaces';
import { Context } from '../context';
import { joinPath } from '../utils';

function fn( metadata: InputMetadata, context: Context ): void {
    const { options } = context;
    const { method, path = '/' } = metadata.data ?? {};

    options.method = method;

    if( !options.path ) {
        options.path = path;
        return;
    }

    options.path = joinPath( options.path, path );
}

export type MethodOptions =
    & CoreActionOptions
    & {
        path?: string;
        method: string;
    };

function createRequestMethodDecorator( method: RequestMethod ) {
    return ( path: string | MethodOptions = '/' ): MethodDecorator => {
        const data = typeof path === 'string' ? { method, path } : { ...path, method };
        const action = CoreAction( data );
        const input = createInputDecorator( fn, { data } );
        return ( target: object, key: string | symbol, descriptor: PropertyDescriptor ): void => {
            action( target, key, descriptor );
            input( target, key, descriptor );
        };
    };
}

export const Get = createRequestMethodDecorator( 'GET' );
export const Post = createRequestMethodDecorator( 'POST' );
export const Head = createRequestMethodDecorator( 'HEAD' );
export const Put = createRequestMethodDecorator( 'PUT' );
export const Delete = createRequestMethodDecorator( 'DELETE' );
export const Patch = createRequestMethodDecorator( 'PATCH' );
export const Options = createRequestMethodDecorator( 'OPTIONS' );
export const Purge = createRequestMethodDecorator( 'PURGE' );
export const Link = createRequestMethodDecorator( 'LINK' );
export const Unlink = createRequestMethodDecorator( 'UNLINK' );

export function Method( data: MethodOptions ): MethodDecorator {
    /**
     * Transform data.method to uppercase;
     */
    data = { ...data, method : data.method.toUpperCase() };
    const action = CoreAction( data );
    const input = createInputDecorator( fn, { data } );
    return ( target: object, key: string | symbol, descriptor: PropertyDescriptor ): void => {
        action( target, key, descriptor );
        input( target, key, descriptor );
    };
}

export const Action = Method;
