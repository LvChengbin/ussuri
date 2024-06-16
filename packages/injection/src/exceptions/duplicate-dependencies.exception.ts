/******************************************************************
 * Copyright (C) 2022 LvChengbin
 *
 * File: exceptions/duplicate-dependencies.exception.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 02/12/2022
 * Description:
 ******************************************************************/

import { InjectionToken } from '../interfaces';
import { InjectionError } from './injection-error';
import { duplicateDependenciesMessage } from './messages';

export class DuplicateDependenciesException extends InjectionError {
    constructor( token: InjectionToken ) {
        super( duplicateDependenciesMessage( token ) );
    }
}
