/******************************************************************
 * Copyright (C) 2022 LvChengbin
 *
 * File: src/controller.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 05/08/2022
 * Description:
 ******************************************************************/

import {
    Controller as CoreController,
    ControllerOptions as CoreControllerOptions,
    InputMetadata
} from '@ussuri/core';
import { createInputDecorator } from '@ussuri/core/decorator';
import { Context } from './context';
import { joinPath } from './utils';

function fn( metadata: InputMetadata, context: Context ): void {
    const { options } = context;
    const { path = '/' } = metadata.data ?? {};

    if( !options.path ) {
        options.path = path;
        return;
    }

    options.path = joinPath( options.path, path );
}

export type ControllerOptions =
    & CoreControllerOptions
    & {
        path?: string;
        name?: string;
    };

export function Controller(): ClassDecorator;
export function Controller( name: string, path: string | ControllerOptions ): ClassDecorator;
export function Controller( path: string | ControllerOptions ): ClassDecorator;
export function Controller( ...args: [ name?: string | ControllerOptions, path?: string | ControllerOptions ] ): ClassDecorator {

    const name = args.length > 1 ? args[ 0 ] : '';
    const path = args.length > 1 ? args[ 1 ] : args[ 0 ] ?? '/';

    const data: ControllerOptions = {};

    path && Object.assign( data, typeof path === 'string' ? { path } : path );
    name && Object.assign( data, { name } );

    const controller = CoreController( data );
    const input = createInputDecorator( fn, { data } );

    return ( target ): void => {
        controller( target );
        input( target );
    };
}
