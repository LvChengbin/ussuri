/******************************************************************
 * Copyright (C) 2022 LvChengbin
 *
 * File: pipes/trim.pipe.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 06/15/2022
 * Description:
 ******************************************************************/

export function Trim() {
    return <T extends string | undefined>( value: T ): T => {
        if( value === undefined ) return value;
        /**
         * Remove whitespaces and ideographic spaces from both ends of the given string.
         *
         * https://www.fileformat.info/info/unicode/char/3000/index.htm
         */
        return value.trim().replaceAll( '\u3000', '' ) as T;
    };
}
