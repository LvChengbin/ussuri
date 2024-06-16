/******************************************************************
 * Copyright (C) 2022 LvChengbin
 *
 * File: src/module.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 02/23/2022
 * Description:
 ******************************************************************/

import { Class, Constructor } from 'type-fest';
import { ApplicationOptions } from './application';
import { MODULE_METADATA_KEY } from './constants';
import { mergeApplicationOptions } from './utils';

/**
 * Options for creating a module
 */
export type ModuleOptions<T = any> = ApplicationOptions<T>;

export interface ModuleDescriptor<T = any> {
    module: Constructor<unknown>;
    options: ModuleOptions<T>;
}

/**
 * Decorator for declaring a Module
 *
 * @example
 *
 * ```ts
 * @Module( options )
 * class SampleModule {
 * }
 *
 * @Module( SampleModule )
 * @Module( SampleModule, options )
 * ```
 */
export function Module<T>( module: Class<unknown>, options?: ModuleOptions<T> ): ClassDecorator;
export function Module<T>( options?: ModuleOptions<T> ): ClassDecorator;
export function Module<T>( moduleOrOptions?: Class<unknown> | ModuleOptions<T>, options?: ModuleOptions<T> ): ClassDecorator {

    if( typeof moduleOrOptions !== 'function' ) {
        options = mergeApplicationOptions( moduleOrOptions ?? {} );
    } else {

        options = mergeApplicationOptions(
            options ?? {},
            Reflect.getMetadata( MODULE_METADATA_KEY, moduleOrOptions )
        );
    }

    return ( target: object ): void => {
        Reflect.defineMetadata( MODULE_METADATA_KEY, options, target );
    };
}
