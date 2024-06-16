/******************************************************************
 * Copyright (C) 2022 LvChengbin
 *
 * File: decorators/body-parse.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 06/18/2022
 * Description:
 ******************************************************************/

import { bodyParse as body, MultipartBody } from '../utils/body';
import { Context } from '../context';

export async function bodyParse( context: Context ): Promise<void> {

    if( context.request.body || context.request.files ) return;

    const parse = body( context );

    context.request.body = parse.then( ( data: any ) => {
        if( context.is( 'multipart' ) ) {
            return ( data as MultipartBody ).fields;
        }
        return data ?? {};
    } );

    context.request.files = parse.then( ( data: any ) => {
        if( context.is( 'multipart' ) ) {
            return ( data as MultipartBody ).files;
        }
        return {};
    } );

    // tho make all promises catchable
    await Promise.all( [
        parse,
        context.request.body,
        context.request.files
    ] );

}
