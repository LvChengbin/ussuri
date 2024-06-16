/******************************************************************
 * Copyright (C) 2022 LvChengbin
 *
 * File: src/config.service.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 06/05/2022
 * Description:
 ******************************************************************/

import { Injectable, Inject, Optional } from '@ussuri/injection';
import { Config, ConfigOptions } from './config';
import { Path, Value } from './types';

const { hasOwn } = Object;

/**
 * @example
 *
 * ```ts
 * {
 *     providers : [
 *         ConfigService,
 *         {
 *             provide : 'INJECT_KEY',
 *             useClass : ConfigService,
 *             args : [ {
 *                 // config object
 *             } ]
 *         }
 *     ]
 * }
 * ```
 *
 * @example
 *
 * ```ts
 * {
 *     providers : [
 *         ConfigService,
 *         {
 *             provide : 'CONFIG_SERVICE_OPTIONS',
 *             value : {
 *                 // config object
 *             }
 *         }
 *     ]
 * }
 * ```
 */
@Injectable()
export class ConfigService<T = Record<string, unknown>> {

    configs: Config[];
    #cache: Record<string, any> = {};

    constructor(
        @Optional() options?: ConfigOptions,
        @Optional() @Inject( '$CONFIG' ) config?: ConfigOptions,
        @Optional() ...args: ConfigOptions[]
    ) {
        this.configs = [ config, options, ...args ]
            .filter( item => !!item )
            .map( item => new Config( item ) );
    }

    get<R = any>( path: Path<T> ): R;
    get<K extends Path<T>, R = Value<T, K>>( path: K, defaultValue: R ): R;
    get<R = any>( path: Path<T>, defaultValue?: R ): R | undefined {

        if( hasOwn( this.#cache, path ) ) {
            return this.#cache[ path ];
        }

        let value: R | undefined = undefined;

        for( const config of this.configs ) {
            value = config.get( path );
            if( value !== undefined ) break;
        }

        if( value !== undefined ) {
            /**
             * Don't add the default value into cache
             */
            this.#cache[ path ] = value;
            return value;
        }

        return defaultValue ?? undefined;
    }
}
