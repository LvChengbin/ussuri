/******************************************************************
 * Copyright (C) 2022 LvChengbin
 *
 * File: pipes/boolean.pipe.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 05/27/2022
 * Description:
 ******************************************************************/

/**
 * Convert value to boolean however `undefined` will be ignored.
 *
 * @example
 *
 * ```ts
 * @Query( 'key', Boolean() )
 * ```
 */
export function Boolean() {
    return ( value: unknown ): boolean | undefined => {
        if( value === undefined ) return value;
        return global.Boolean( value );
    };
}
