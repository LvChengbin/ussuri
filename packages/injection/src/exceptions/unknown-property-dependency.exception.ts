/******************************************************************
 * Copyright (C) 2022 LvChengbin
 *
 * File: exceptions/unknown-property-dependency.exception.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 02/13/2022
 * Description:
 ******************************************************************/

import { InjectionToken } from '../interfaces';
import { InjectionError } from './injection-error';
import { unknownPropertyDependencyMessage } from './messages';

export class UnknownPropertyDependencyException extends InjectionError {
    constructor( token: InjectionToken, key: string | symbol, dependency: InjectionToken ) {
        super( unknownPropertyDependencyMessage( token, key, dependency ) );
    }
}
