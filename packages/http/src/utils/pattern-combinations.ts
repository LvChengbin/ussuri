/******************************************************************
 * Copyright (C) 2022 LvChengbin
 *
 * File: utils/pattern-combinations.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 03/15/2022
 * Description:
 ******************************************************************/

export function patternCombinations<T extends string | RegExp>( ...patterns: ( T[] | T )[] ): T[][] {
    let combinations: T[][] = [];

    patterns.forEach( ( group: T[] | T ) => {

        if( !Array.isArray( group ) ) group = [ group ];

        if( combinations.length === 0 ) {
            combinations = ( group as T[] ).map( x => [ x ] );
            return;
        }

        const tmp: T[][] = [];

        combinations.forEach( ( item: T[] ) => {
            ( group as T[] ).forEach( ( pattern: T ) => {
                tmp.push( [ ...item, pattern ] );
            } );
        } );

        combinations = tmp;

    } );

    return combinations;
}
