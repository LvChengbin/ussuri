/******************************************************************
 * Copyright (C) 2022-2023 NextSeason
 *
 * @File: dataclass/link.ts
 *
 * This file is part of NextSeason projects.
 * Code in this file can not be copied and/or distributed without the
 * express permission of NextSeason. Inc
 ******************************************************************/

import { Constructor } from 'type-fest';
import { Dataclass } from './dataclass';
import { DataclassMetadata } from './metadata';

export function Link( ...dataclasses: Constructor<any>[] ): ClassDecorator {

    return ( target: Function ): void => {
        const metadata: DataclassMetadata = Dataclass.metadata( target ) ?? new DataclassMetadata();
        metadata.linked ??= new Set<any>();
        dataclasses.forEach( dataclass => {
            metadata.linked.add( dataclass );
        } );
    };
}
