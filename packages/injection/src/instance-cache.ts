/******************************************************************
 * Copyright (C) 2022 LvChengbin
 *
 * File: injection/instance-cache.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 02/11/2022
 * Description:
 ******************************************************************/

import { InjectionToken } from './interfaces';

export class InstanceCache {

    /**
     * A map for storing instances.
     */
    cache = new Map<InjectionToken, any>();

    set( token: InjectionToken, value: any ): void {
        this.cache.set( token, value );
    }

    get<T = any>( token: InjectionToken ): T | null {
        return this.cache.get( token ) ?? null;
    }
}
