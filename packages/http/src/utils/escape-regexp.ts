/******************************************************************
 * Copyright (C) 2022 LvChengbin
 *
 * File: utils/escape-regexp.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 07/02/2022
 * Description:
 ******************************************************************/

export function escapeRegexp( s: string ): string {
    return s.replace( /[/|\\{}()[\]^$+*?.]/g, '\\$&' ).replace( /-/g, '\\x2d' );
}
