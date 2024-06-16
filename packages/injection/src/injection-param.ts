/******************************************************************
 * Copyright (C) 2022 LvChengbin
 *
 * File: injection/injection-param.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 02/09/2022
 * Description:
 ******************************************************************/

import { InjectionToken } from './interfaces';

export interface InjectionParamOptions {
    token?: InjectionToken;
    optional?: boolean;
    defaultValue?: any;
}

export class InjectionParam {
    token?: InjectionToken;
    optional = false;
    defaultValue?: any;

    constructor( options: InjectionParamOptions ) {
        options && Object.assign( this, options );
    }
}
