/******************************************************************
 * Copyright (C) 2022 LvChengbin
 *
 * File: assertions/assert.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 04/05/2022
 * Description:
 ******************************************************************/

import { expect } from '@jest/globals';

export function assert( expected: unknown, actual: unknown ): void {

    if( expected instanceof RegExp ) {
        expect( actual ).toMatch( expected );
        return;
    }

    /**
     * Support using Jest AsymmetricMatchers.
     */
    if( ( expected as any )?.$$typeof === Symbol.for( 'jest.asymmetricMatcher' ) ) {
        expect( actual ).toEqual( expected );
        return;
    }

    expect( actual ).toEqual( expected );
}
