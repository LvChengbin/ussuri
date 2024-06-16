/******************************************************************
 * Copyright (C) 2022 LvChengbin
 *
 * File: decorators/on-event.decorator.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 10/13/2022
 * Description:
 ******************************************************************/

import { OnOptions } from 'eventemitter2';
import { setListenerMetadata } from '../metadata';

export function OnEvent( event: string | symbol | ( string | symbol )[], options?: OnOptions ): MethodDecorator {
    return ( target: object, key: string | symbol ) => {
        const events = Array.isArray( event ) ? event : [ event ];
        setListenerMetadata( events.map( event => ( { event, options } ) ), target, key );
    };
}
