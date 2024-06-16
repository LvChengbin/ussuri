/******************************************************************
 * Copyright (C) 2022-2023 NextSeason
 *
 * @File: utils/merge-application-options.ts
 *
 * This file is part of NextSeason projects.
 * Code in this file can not be copied and/or distributed without the
 * express permission of NextSeason. Inc
 ******************************************************************/

import { ApplicationOptions, MergedApplicationOptions } from '../application';

export function mergeApplicationOptions(
    a: ApplicationOptions,
    b?: ApplicationOptions
): MergedApplicationOptions {
    const { controllers, providers, modules, ...rest } = a;

    return {
        ...b, ...rest,

        controllers :
            typeof controllers === 'function'
                ? controllers( b?.controllers as any ?? [] )
                : [ ...b?.controllers as any[] ?? [], ...controllers ?? [] ],

        providers :
            typeof providers === 'function'
                ? providers( b?.providers as any ?? [] )
                : [ ...b?.providers as any[] ?? [], ...providers ?? [] ],

        modules :
            typeof modules === 'function'
                ? modules( b?.modules as any ?? {} )
                : { ...b?.modules as object ?? {}, ...modules ?? {} }
    };
}
