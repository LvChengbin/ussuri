/******************************************************************
 * Copyright (C) 2022-2023 NextSeason
 *
 * @File: utils/change-case.ts
 *
 * This file is part of NextSeason projects.
 * Code in this file can not be copied and/or distributed without the
 * express permission of NextSeason. Inc
 ******************************************************************/

type Case =
    | 'upper'
    | 'lower';

export function changeCase( data: string, c?: Case ): string;
export function changeCase( data: string[], c?: Case ): string[];
export function changeCase( data: string | string[], c = 'lower' ): string | string[] {

    if( !data ) return data;

    const method = c === 'lower' ? 'toLowerCase' : 'toUpperCase';

    return Array.isArray( data )
        ? data.map( x => x[ method ]() )
        : data[ method ]();
}
