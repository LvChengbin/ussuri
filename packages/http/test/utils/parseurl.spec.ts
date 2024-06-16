/******************************************************************
 * Copyright (C) 2021 LvChengbin
 *
 * File: utils/parseurl.spec.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 07/25/2021
 * Description:
 ******************************************************************/

import { default as nodeurl, parse } from 'node:url';
import { parseurl } from '../../src/utils/parseurl';

describe( 'utils/parseurl', () => {

    /**
     * Some test cases are copied from pillarjs/parseurl
     * https://github.com/pillarjs/parseurl/blob/master/test/test.js
     */
    const cases = [
        {
            desc : 'should have same properties with url.parse in node core',
            url : ''
        },
        {
            desc : 'should parse the given url',
            url : '/foo/bar'
        },
        {
            desc : 'should parse with query string',
            url : '/foo/bar?fizz=buzz'
        },
        {
            desc : 'should parse a full URL',
            url : 'http://localhost:8888/foo/bar'
        },
        {
            desc : 'should not choke on auth-looking URL',
            url : '//todo@txt'
        }
    ];

    for( const item of cases ) {
        it( item.desc, () => {
            expect( parseurl( item.url ) ).toEqual( parse( item.url ) );
        } );
    }

    describe( 'more urls', () => {

        /**
         * Most of these urls are copied from petkaantonov/urlparser
         * https://github.com/petkaantonov/urlparser/blob/master/test/urlparser.js
         */
        const urls = [
            'http://www.google.com',
            'http://www.google.com/',
            'http://www.google.com/?',
            'http://www.google.com?',
            'http://www.google.com?#',
            'http://www.google.com/?a#',
            'http://www.google.com/?querystring',
            'http://www.google.com?querystring',
            'http://www.google.com/?query#string',
            'http://www.google.com#string',
            'http://a@b/c@d',
            'http://a@b@c/',
            'http://a@b?@c',
            'http://www.google.com# k',
            'http://www.google.com? k',
            'http://www.google.com/ k',
            'http://www.google.com#{}',
            'http://www.google.com?{}',
            'http://www.google.com/{}',
            'http://www.google.com/{}?{}#{}',
            'http://www.google.com#a{b}{}',
            'http://www.google.com?a{b}{}',
            'http://www.google.com/a{b}{}',
            'http://www.google.com/a{b}{}?a{b}{}#a{b}{}',
            'http://www.google.com/gâteaux_d\'ange.jpg',
            'http://www.google.com# k',
            'http://www.google.com? k',
            'http://www.google.com/ k',
            'http://www.google.com#{}',
            'http://www.google.com?{}',
            'http://www.google.com/{}',
            'http://www.google.com/{}?{}#{}',
            'http://www.google.com#a{b}{}',
            'http://www.google.com?a{b}{}',
            'http://www.google.com/a{b}{}',
            'http://www.google.com/a{b}{}?a{b}{}#a{b}{}',
            'http://www.google.com/gâteaux_d\'ange.jpg',
            'javascript:alert(\'hello world\');',
            'mailto:user@example.com?subject=Message Title&body=Message Content',
            'file:///C:/Users/Petka%20Antonov/urlparser/.npmignore',
            'http://www.google.com:80',
            'http://www.google.com:8080',
            'http://www.google.com:',
            'http://www.google.com:008',
            '/path?q=blah&other=meh#blargh:008',
            '//path?q=blah&other=meh#blargh:008',
            `/${String.fromCharCode( 0x09 )}`,
            `/${String.fromCharCode( 0x0a )}`,
            `/${String.fromCharCode( 0x0c )}`,
            `/${String.fromCharCode( 0x0d )}`,
            `/${String.fromCharCode( 0x20 )}`,
            `/${String.fromCharCode( 0x23 )}`,
            `/${String.fromCharCode( 0xa0 )}`,
            `/${String.fromCharCode( 0x40 )}`,
            `/${String.fromCharCode( 0xfeff )}`
        ];

        for( const url of urls ) {
            it( url, () => {
                expect( parseurl( url ) ).toEqual( parse( url ) );
            } );
        }
    } );

    describe( 'cache', () => {
        it( 'should work with cache', () => {
            const href = 'http://localhost:8080/foo/bar?aa=bb';
            const url = parseurl( href );
            jest.spyOn( nodeurl, 'parse' );
            expect( parseurl( href ) ).toEqual( url );
        } );
    } );
} );
