/******************************************************************
 * Copyright (C) 2022-2023 NextSeason
 *
 * @File: utils/escape-regexp.ts
 *
 * This file is part of NextSeason projects.
 * Code in this file can not be copied and/or distributed without the
 * express permission of NextSeason. Inc
 ******************************************************************/

export function escapeRegexp( s: string ): string {
    return s.replace( /[/|\\{}()[\]^$+*?.]/g, '\\$&' ).replace( /-/g, '\\x2d' );
}
