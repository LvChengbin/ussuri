/******************************************************************
 * Copyright (C) 2022 LvChengbin
 *
 * File: pipes/pick.pipe.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 06/15/2022
 * Description:
 ******************************************************************/

import get from 'lodash.get';

export function Pick<T = any>( path: string ) {
    return ( value: object ): T => {
        return get( value, path ) as T;
    };
}
