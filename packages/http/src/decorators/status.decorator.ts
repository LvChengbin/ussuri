/******************************************************************
 * Copyright (C) 2022 LvChengbin
 *
 * File: decorators/status.decorator.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 04/10/2022
 * Description:
 ******************************************************************/

import { Context } from '../context';
import { OutputMetadata } from '@ussuri/core';
import { createOutputDecorator } from '@ussuri/core/decorator';

interface StatusData {
    code: number;
    message?: string;
}

async function response<T>( metadata: OutputMetadata, res: T, context: Context ): Promise<T> {
    const { code, message } = metadata.data as StatusData;
    context.status = code;
    if( typeof message === 'string' ) context.message = message;
    return res;
}

export function Status( code: number, message?: string ): MethodDecorator & ClassDecorator {
    return createOutputDecorator( response, {
        data : { code, message }
    } );
}
