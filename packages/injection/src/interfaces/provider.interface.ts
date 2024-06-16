/******************************************************************
 * Copyright (C) 2022 LvChengbin
 *
 * File: interfaces/provider.interface.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 02/10/2022
 * Description:
 ******************************************************************/

import { Constructor } from 'type-fest';
import { Scope } from '../enums';
import { InjectionToken } from '../interfaces';

/**
 * Defining an interface for *Class* type provider
 *
 * @example
 *
 * ```ts
 * const sampleProvider = {
 *     provide : SampleService,
 *     useClass : SampleService,
 *     scope : Scope.DEFAULT,
 *     args : [ 'sample', 'service' ]
 * }
 * ```
 */
export interface ClassProvider<T = any, M extends any[] = any[]> {
    /**
     * Injection token
     */
    provide: InjectionToken;

    /**
     * Constructor name of the provider
     */
    useClass: Constructor<T, M>;

    /**
     * Denoting the lifetime of the injected provider.
     */
    scope?: Scope;

    /**
     * Static arguments for the provider constructor
     */
    args?: M;
}

export interface FactoryProvider<T = any, M extends any[] = any[]> {
    provide: InjectionToken;
    useFactory: ( ...args: any[] ) => T | Promise<T>;

    /**
     * List of providers to be injected into the context of the Factory function.
     */
    inject?: InjectionToken[];

    /**
     * Static arguments for the given function
     */
    args?: M;
}

/**
 * Defining an interface for *Static* type provider
 *
 * @example
 *
 * ```ts
 * const sampleProvider = {
 *     provide : 'utils',
 *     value : utils
 * }
 * ```
 */
export interface StaticProvider<T = unknown> {
    provide: InjectionToken;
    value: T;
}

export type Provider<T = unknown> =
    | Constructor<any>
    | ClassProvider<T>
    | StaticProvider<T>
    | FactoryProvider<T>;
