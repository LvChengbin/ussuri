/******************************************************************
 * Copyright (C) 2022 LvChengbin
 *
 * File: exceptions/circular-dependency.exception.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 02/09/2022
 * Description:
 ******************************************************************/

import { InjectionToken } from '../interfaces';
import { InjectionError } from './injection-error';
import { circularDependencyMessage } from './messages';

export class CircularDependencyException extends InjectionError {
    constructor( token: InjectionToken, circlePath: InjectionToken[] ) {
        super( circularDependencyMessage( token, circlePath ) );
    }
}
