/******************************************************************
 * Copyright (C) 2022 LvChengbin
 *
 * File: assertions/response.assertion.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 05/11/2022
 * Description:
 ******************************************************************/

import { Assertion } from './assertion';

export interface ResponseAssertionHandler {
    ( response: any ): void;
}

export class ResponseAssertion implements Assertion {

    type = 'context';

    constructor( public handler: ResponseAssertionHandler ) {}

    assert( response: any ): void {
        this.handler( response );
    }
}
