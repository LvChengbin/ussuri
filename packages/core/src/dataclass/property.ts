/******************************************************************
 * Copyright (C) 2022 LvChengbin
 *
 * File: src/property.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 05/29/2022
 * Description:
 ******************************************************************/

import { Pipe } from '../interfaces';
import { Dataclass } from './dataclass';
import { DataclassMetadata } from './metadata';

export function Property( ...pipes: Pipe[] ): PropertyDecorator {

    return ( target: any, property: string | symbol ): void => {
        const { constructor } = target;
        const metadata: DataclassMetadata = Dataclass.metadata( constructor ) ?? new DataclassMetadata();
        const type = Reflect.getMetadata( 'design:type', target, property );

        metadata.setProperty( property, type, ...pipes );
        Dataclass.defineMetadata( constructor, metadata );
    };
}
