/******************************************************************
 * Copyright (C) 2022 LvChengbin
 *
 * File: decorators/redirect.decorator.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 04/12/2022
 * Description:
 ******************************************************************/

import { OutputMetadata } from '@ussuri/core';
import { createOutputDecorator } from '@ussuri/core/decorator';
import { Context } from '../context';

interface RedirectOptions {
    url: string;
    alt?: string;
}

async function fn( metadata: OutputMetadata, res: string | RedirectOptions, context: Context ): Promise<unknown> {
    let url, alt;

    if( typeof res === 'string' ) {
        url = res;
    } else {
        url = res.url;
        alt = res.alt;
    }

    context.redirect( url, alt );
    return context;

}

export function Redirect( ...data: [ url?: string, alt?: string ] ): ClassDecorator & MethodDecorator {
    return createOutputDecorator( fn, { data } );
}
