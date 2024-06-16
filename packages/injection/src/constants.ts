/******************************************************************
 * Copyright (C) 2022 LvChengbin
 *
 * File: src/constants.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 02/13/2022
 * Description:
 ******************************************************************/

/**
 * The key for storing `Injectable` in reflect metadata
 */
export const INJECTABLE_METADATA_KEY = Symbol( 'injectable#metadata#key' );

/**
 * The key for storing `Inject` options metadata
 */
export const INJECT_METADATA_KEY = Symbol( 'inject#metadata#key' );

/**
 * The key for saving metadata key while using decorators, such as `@Inject()` or `@Optional`, as property decorator
 */
export const INJECT_PROPERTY_METADATA_KEY = Symbol( 'inject#property#metadata#key' );

/**
 * The key for saving dependencies for a class
 */
export const INJECT_DEPENDENCIES_METADATA_KEY = Symbol( 'parameter#dependencies#metadata#key' );

/**
 *  Metadata key for saving extra dependencies data of a provider.
 */
export const EXTRA_DEPENDENCIES_METADATA_KEY = Symbol( 'extra#dependencies#metadata#key' );
