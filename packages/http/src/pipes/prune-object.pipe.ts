/******************************************************************
 * Copyright (C) 2022 LvChengbin
 *
 * File: pipes/prune-object.pipe.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 05/18/2022
 * Description:
 ******************************************************************/

export function PruneObject( values: unknown[] = [ undefined, null ] ): <T extends object>( value: T ) => Partial<T> {

    const haystack = new Set<unknown>( values );

    return <T extends Record<string | number, any>>( value: T ): Partial<T> => {
        const output: Partial<T> = {};

        Object.keys( value ).forEach( ( key: keyof T ) => {
            if( !haystack.has( value[ key ] ) ) {
                output[ key ] = value[ key ];
            }
        } );

        return output;
    };
}
