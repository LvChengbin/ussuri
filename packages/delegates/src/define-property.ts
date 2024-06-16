/******************************************************************
 * Copyright (C) 2021 LvChengbin
 *
 * File: src/define-property.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 07/17/2021
 * Description:
 ******************************************************************/

export interface DefinePropertyOptions {
    method?: boolean;
    setter?: boolean;
    getter?: boolean;
}

function defineProperty<T, M extends keyof T>(
    target: any,
    key: PropertyKey,
    property: M,
    name: keyof T[ M ],
    options: DefinePropertyOptions = {}
): void {
    const descriptor: PropertyDescriptor = {};
    const { method, setter, getter } = options;

    method && Object.assign( descriptor, {
        value( this: T, ...args: any[] ): any {
            return ( this[ property ][ name ] as unknown as Function )( ...args );
        }
    } );

    setter && Object.assign( descriptor, {
        set( this: T, val: any ) {
            this[ property ][ name ] = val;
        }
    } );

    getter && Object.assign( descriptor, {
        get( this: T ) {
            return this[ property ][ name ];
        }
    } );

    Object.defineProperty( target, key, descriptor );
}

export default defineProperty;
