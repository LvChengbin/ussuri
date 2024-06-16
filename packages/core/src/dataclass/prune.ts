/******************************************************************
 * Copyright (C) 2022-2023 NextSeason
 *
 * @File: dataclass/prune.ts
 *
 * This file is part of NextSeason projects.
 * Code in this file can not be copied and/or distributed without the
 * express permission of NextSeason. Inc
 ******************************************************************/

import { Dataclass } from './dataclass';
import { DataclassMetadata } from './metadata';

export function Prune( prune = true ): ClassDecorator {
    return ( target: Function ): void => {
        const metadata: DataclassMetadata = Dataclass.metadata( target ) ?? new DataclassMetadata();
        metadata.prune = prune;
        Dataclass.defineMetadata( target, metadata );
    };
}
