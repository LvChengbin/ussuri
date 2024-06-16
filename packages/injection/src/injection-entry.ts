/******************************************************************
 * Copyright (C) 2022 LvChengbin
 *
 * File: injection/injection-entry.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 02/08/2022
 * Description:
 ******************************************************************/

import { Scope } from './enums';
import { INJECTABLE_METADATA_KEY } from './constants';
import { Provider } from './interfaces';

export interface InjectionEntryOptions<T extends Provider = Provider> {
    provider: T;
}

export class InjectionEntry<T extends Provider = Provider> {

    scope: Scope | null = null;

    provider!: T;

    constructor( options: InjectionEntryOptions<T> | InjectionEntry<T> ) {

        if( options instanceof InjectionEntry ) return options;

        this.provider = options.provider;

        /**
         * If a `ClassProvider` is provided, get the default options set with `Injectable` decorator.
         */
        if( 'useClass' in this.provider ) {
            this.scope = this.provider.scope
                ?? Reflect.getMetadata( INJECTABLE_METADATA_KEY, this.provider.useClass )?.scope ?? null;
        }
    }
}
