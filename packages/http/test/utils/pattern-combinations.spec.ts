/******************************************************************
 * Copyright (C) 2022 LvChengbin
 *
 * File: utils/pattern-combinations.spec.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 03/16/2022
 * Description:
 ******************************************************************/

import { patternCombinations } from '../../src/utils/pattern-combinations';

describe( 'Pattern Combinations', () => {
    it( 'single pattern', () => {
        const output = patternCombinations( 'a' );
        expect( output ).toEqual( [ [ 'a' ] ] );
    } );

    it( 'multiple single patterns', () => {
        const output = patternCombinations( 'a', 'b', 'c' );
        expect( output ).toEqual( [ [ 'a', 'b', 'c' ] ] );
    } );

    it( 'multiple complex patterns', () => {
        const output = patternCombinations( [ 'a', 'b' ], 'c', [ 'd', 'e', 'f' ] );
        expect( output ).toEqual( [
            [ 'a', 'c', 'd' ],
            [ 'a', 'c', 'e' ],
            [ 'a', 'c', 'f' ],
            [ 'b', 'c', 'd' ],
            [ 'b', 'c', 'e' ],
            [ 'b', 'c', 'f' ]
        ] );
    } );
} );
