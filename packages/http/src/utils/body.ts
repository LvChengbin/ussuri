/******************************************************************
 * Copyright (C) 2020 LvChengbin
 *
 * File: src/body-parser.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 12/09/2020
 * Description:
 ******************************************************************/

import qs from 'qs';
import bytes from 'bytes';
import formidable, { Fields, Files, Options as MultipartOptions, BufferEncoding } from 'formidable';
import cobody, { Options as CobodyOptions } from 'co-body';
import { Context } from '../context';

export { Files as RequestFiles, File as RequestFile } from 'formidable';

/**
 * The type of the return value of `cobody` while `options.returnRawBody` is set to `true`.
 * The `parsed` part will be in different types while using different request types.
 *  - it will be `string` while `Content-Type` matches `text`.
 *  - it will be `ReturnType<typeof qs.parse>` while `Content-Type` matches `form`.
 *  - it will be `ReturnType<typeof JSON.parse>` while `Content-Type` matches `json`.
 */
type RawBody = {
    parsed: string | ReturnType<typeof qs.parse> | ReturnType<typeof JSON.parse>;
    raw: string;
};

export interface MultipartBody {
    fields: Fields;
    files: Files ;
}

async function parseMultipart( context: Context, options: MultipartOptions ): Promise<MultipartBody> {
    return new Promise( ( resolve, reject ) => {
        const form = formidable( options );

        form.parse( context.req!, ( err, fields, files ) => {
            if( err ) reject( err );
            else resolve( { fields, files } );
        } );
    } );
}

/**
 * BodyParseOptions extends Cobody.Options.
 *
 * @see https://github.com/cojs/co-body
 * @see https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/co-body/index.d.ts
 */
export interface BodyParseOptions extends CobodyOptions {
    encoding?: BufferEncoding;
    limit?: string;
    strict?: boolean;
    queryString?: qs.IParseOptions;
    returnRawBody?: boolean;
    jsonTypes?: string[];
    formTypes?: string[];
    textTypes?: string[];
    multipartOptions?: MultipartOptions;
}

/**
 * get body data by setting `options.returnRawBody` to `true`, it will return the {@link RawBody} only when `Content-Type` doesn't match `multipart`.
 *
 * @param context - the context object
 * @param options - the options object. {@link BodyParseOptions}
 *
 * @returns the parsed body with `fields` and `files`.
 */
export async function bodyParse(
    context: Context,
    options: Readonly<BodyParseOptions> = {}
): Promise<RawBody | MultipartBody | ReturnType<typeof cobody> | null> {

    if( !context.req || context.request.type === '' ) return null;

    const encoding = options.encoding ?? 'utf-8';
    const limit = '20mb';

    if( context.request.is( 'multipart' ) ) {

        const { multipartOptions = {} } = options;
        const maxSizeOptions: {
            maxFieldsSize?: number;
            maxFileSize?: number;
        } = {};

        if( typeof multipartOptions.maxFileSize === 'string' ) {
            maxSizeOptions.maxFileSize = bytes.parse( multipartOptions.maxFileSize );
        }

        if( typeof multipartOptions.maxFieldsSize === 'string' ) {
            maxSizeOptions.maxFieldsSize = bytes.parse( multipartOptions.maxFieldsSize );
        }

        return parseMultipart( context, {
            encoding,
            multiples : true,
            minFileSize : 1,
            maxFileSize : 209715200, // 200mb
            maxFields : 2000,
            maxFieldsSize : 20971520, // 20mb
            ...multipartOptions,
            ...maxSizeOptions
        } );
    }

    return cobody( context.req, { encoding, limit, returnRawBody : false, ...options } );
}
