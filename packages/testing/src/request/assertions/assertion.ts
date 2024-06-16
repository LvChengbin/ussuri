/******************************************************************
 * Copyright (C) 2022 LvChengbin
 *
 * File: assertions/assertion.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 04/04/2022
 * Description:
 ******************************************************************/

export interface Assertion {
    type: string;
    assert( context: any ): void;
}
