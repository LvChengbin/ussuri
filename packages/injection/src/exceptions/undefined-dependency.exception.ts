/******************************************************************
 * Copyright (C) 2022 LvChengbin
 *
 * File: exceptions/undefined-dependency.expception.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 02/11/2022
 * Description:
 ******************************************************************/

import { InjectionToken } from '../interfaces';
import { InjectionError } from './injection-error';
import { undefinedDependencyMessage } from './messages';

export class UndefinedDependencyException extends InjectionError {
    constructor( token: InjectionToken ) {
        super( undefinedDependencyMessage( token ) );
    }
}
