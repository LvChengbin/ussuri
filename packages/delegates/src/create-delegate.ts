/******************************************************************
 * Copyright (C) 2021 LvChengbin
 *
 * File: src/create-delegate.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 07/18/2021
 * Description:
 ******************************************************************/

import defineProperty, { DefinePropertyOptions } from './define-property';

export default function createDelegate( options: DefinePropertyOptions ) {
    return <T, M extends keyof T>( property: M, name?: keyof T[ M ] ): PropertyDecorator => {
        return ( target: Object, key: PropertyKey ): void => {
            defineProperty<T, M>( target, key, property, name ?? key as keyof T[ M ], options );
        };
    };
}
