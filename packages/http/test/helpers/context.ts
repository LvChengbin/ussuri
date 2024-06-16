/******************************************************************
 * Copyright (C) 2022 LvChengbin
 *
 * File: helpers/context.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 03/06/2022
 * Description:
 ******************************************************************/

import { Context, ContextOptions } from '../../src';

export function createContext( url?: string ): Context;
export function createContext( request?: Partial<ContextOptions[ 'request' ]>, response?: Partial<ContextOptions[ 'response' ]> ): Context;
export function createContext( request?: Partial<ContextOptions[ 'request' ]> | string, response?: Partial<ContextOptions[ 'response' ]> ): Context {

    if( typeof request === 'string' ) {
        return new Context( {
            request : { url : request }
        } );
    }

    return new Context( {
        request : { url : '/', method : 'GET', ...request },
        response : { ...response }
    } );
}
