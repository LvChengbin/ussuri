/******************************************************************
 * Copyright (C) 2022 LvChengbin
 *
 * File: assertions/status.assertion.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 04/04/2022
 * Description:
 ******************************************************************/

import { expect } from '@jest/globals';
import { JestAsymmetricMatcher } from '../interfaces';
import { assert } from '../assert';
import { Assertion } from './assertion';

export type Status = number;

export type Message =
    | JestAsymmetricMatcher
    | string
    | RegExp;

export class StatusAssertion implements Assertion {

    type = 'status';

    constructor( public expectedStatus: Status, public expectedText?: Message ) {}

    assert( response: any ): void {
        expect( response ).toHaveProperty( 'status' );
        expect( response ).toHaveProperty( 'statusText' );
        expect( response.status ).toEqual( this.expectedStatus );
        this.expectedText && assert( this.expectedText, response.body.message );
    }
}
