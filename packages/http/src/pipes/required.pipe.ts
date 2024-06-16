/******************************************************************
 * Copyright (C) 2022-2023 NextSeason
 *
 * @File: pipes/required.pipe.ts
 *
 * This file is part of NextSeason projects.
 * Code in this file can not be copied and/or distributed without the
 * express permission of NextSeason. Inc
 ******************************************************************/

import { Application, PipeMetadata } from '@ussuri/core';
import { Context } from '../context';
import { BadRequestException } from '../exceptions';
import { ExceptionResponseObject } from './interfaces';
import { throwException } from './throw-exception';

export function Required( exception?: ExceptionResponseObject | Error | string ) {

    /**
     * An error will be triggered by typescript if not adding the `unknown` constraint to `T`.
     * https://www.typescriptlang.org/play?#code/GYVwdgxgLglg9mABMMAeAKgPgBSIB4Bci6iAlESQN4BQidiMwueiAvO4gOSdmKUC+tegCcAplBDCkeANzV+QA
     */
    return async <T>(
        value: T,
        ctx?: Context,
        application?: Application,
        metadata?: PipeMetadata
    ): Promise<T> => {

        if( value as unknown === '' || value === undefined || value === null ) {
            const property = metadata?.data?.property;
            const message = [
                property ? `${String( property )} is required` : 'missing parameter'
            ];
            throwException( exception, message, BadRequestException );
        }

        return value;
    };
}
