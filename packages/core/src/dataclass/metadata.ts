/******************************************************************
 * Copyright (C) 2022 LvChengbin
 *
 * File: src/metadata.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 05/24/2022
 * Description:
 ******************************************************************/

import { Pipe } from '../interfaces';
import { Constructor } from 'type-fest';
import { Dataclass } from './dataclass';

export type PropertyName =
    | string
    | symbol;

export interface PropertyMetadata {
    type: any;
    pipes: Pipe[];
    linked: Set<any>;
}

export class DataclassMetadata<T = any> {

    static pipes( metadata: DataclassMetadata ): Pipe[] {
        const output = [ ...metadata.pipes ];

        metadata.linked?.forEach( ( dataclass ) => {
            const pipes = DataclassMetadata.pipes( Dataclass.metadata( dataclass ) as DataclassMetadata );
            output.push( ...pipes );
        } );

        Object.values( metadata.properties ).forEach( item => {
            const { type, pipes } = item;
            output.push( ...pipes );
            if( Dataclass.isDataclass( type ) ) {
                output.push( ...DataclassMetadata.pipes( Dataclass.metadata( type ) as DataclassMetadata ) );
            }
        } );

        return output;
    }

    prune = true;

    pipes: Pipe[] = [];

    linked = new Set<any>();

    properties = {} as Record<keyof T, PropertyMetadata>;

    setProperty( name: keyof T, type: any, ...pipes: Pipe[] ): void {
        const linked = new Set<Constructor<any>>();

        pipes.forEach( pipe => {
            if( Dataclass.isDataclass( pipe ) ) {
                linked.add( pipe );
            }
        } );

        this.properties[ name ] ??= { type, pipes, linked };
    }

    getProperty( name: keyof T ): PropertyMetadata | null {
        return this.properties[ name ] ?? null;
    }
}
