/******************************************************************
 * Copyright (C) 2022-2023 NextSeason
 *
 * @File: src/index.ts
 *
 * This file is part of NextSeason projects.
 * Code in this file can not be copied and/or distributed without the
 * express permission of NextSeason. Inc
 ******************************************************************/

import { createFinallyDecorator } from '@ussuri/core/decorator';

export interface MorganStreamOptions {
    write( str: string ): void;
}

export interface MorganOptions<C = any> {
    skip?: ( context: C ) => boolean;
    tokens?: Record<string, any>;
    stream?: MorganStreamOptions;
}
/**
 * `:token`
 */
export function compile( format: string ): Function {

    const source = format.replace( /:([[\]'"$_a-zA-Z0-9-.]*)/g, ( _, name ) => {

        const key = name.split( '.' ).map( ( piece: string ) => {
            /**
             * Convert dot path to use brackest
             * so that special chars can be used in dot path.
             */
            if( piece.startsWith( '[' ) && piece.endsWith( ']' ) ) return piece;
            return `[ ${JSON.stringify( piece )} ]`;
        } ).join( '?.' );

        /**
         * The optional chainning operator (?.) provides a very convient way
         * to support both dot paths and brackets ([]) syntax
         *
         * ```ts
         * context?.dot.path
         * context?.[ 'brackets' ]
         * context?.[ 0 ]
         * ```
         *
         * Otherwise, we must check if the first letter is "[" to determine if
         * a dot (.) should be added between "context" and the given path or not.
         */

        return `" + ( tokens?.${key}?.( context ) ?? context?.${key} ?? '-' ) + "`;
    } );

    const script = `"use strict" \n return String( "${source}" )`;

    return new Function( 'context, tokens', script );
}

export function Morgan<C = any>( format: string, options: MorganOptions<C> = {} ): ClassDecorator & MethodDecorator {

    const compiled = compile( format );
    const { tokens, skip, stream = process.stdout } = options;

    return createFinallyDecorator<C>( ( metadata, context: C ) => {
        if( skip?.( context ) ) return;
        stream.write( compiled( context, tokens ) + '\n' );
    } );
}
