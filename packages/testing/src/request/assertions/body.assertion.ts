/******************************************************************
 * Copyright (C) 2022 LvChengbin
 *
 * File: assertions/body.assertion.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 04/05/2022
 * Description:
 ******************************************************************/

import { expect } from '@jest/globals';
import { JestAsymmetricMatcher } from '../interfaces';
import { assert } from '../assert';
import { Assertion } from './assertion';

export type Body =
    | JestAsymmetricMatcher
    | string
    | RegExp
    | Object;

export class BodyAssertion implements Assertion {

    type = 'body';

    constructor( public body: Body ) {}

    assert( response: any ): void {
        expect( response ).toHaveProperty( 'body' );
        assert( this.body, response.body );
    }
}
