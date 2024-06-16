/******************************************************************
 * Copyright (C) 2022-2023 NextSeason
 *
 * @File: utils/pattern-combinations.ts
 *
 * This file is part of NextSeason projects.
 * Code in this file can not be copied and/or distributed without the
 * express permission of NextSeason. Inc
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
