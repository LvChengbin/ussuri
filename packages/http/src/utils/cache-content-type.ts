/******************************************************************
 * Copyright (C) 2021 LvChengbin
 *
 * File: utils/cache-content-type.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 07/31/2021
 * Description:
 ******************************************************************/

import mimetypes from 'mime-types';
import { LRUCache } from 'lru-cache';

const cache = new LRUCache<string, string | false>( { max : 1000 } );

export default ( type: string ): string | false => {
    let mimetype = cache.get( type );
    if( !mimetype ) {
        mimetype = mimetypes.contentType( type );
        cache.set( type, mimetype );
    }
    return mimetype;
};
