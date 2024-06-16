/******************************************************************
 * Copyright (C) 2022 LvChengbin
 *
 * File: injection/empty-dependency.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 02/09/2022
 * Description:
 ******************************************************************/

import { InjectionToken } from './interfaces';

export class EmptyDependency {

    constructor( public token: InjectionToken, public value?: any ) {}
}
