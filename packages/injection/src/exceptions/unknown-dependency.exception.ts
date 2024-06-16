/******************************************************************
 * Copyright (C) 2022 LvChengbin
 *
 * File: exceptions/unknown-dependency.exception.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 02/09/2022
 * Description:
 ******************************************************************/

import { InjectionToken } from '../interfaces';
import { InjectionError } from './injection-error';
import { unknownDependencyMessage } from './messages';

export class UnknownDependencyException extends InjectionError {
    constructor( token: InjectionToken, index: number, dependency: InjectionToken ) {
        super( unknownDependencyMessage( token, index, dependency ) );
    }
}
