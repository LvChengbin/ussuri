/******************************************************************
 * Copyright (C) 2021 LvChengbin
 *
 * File: decorator/create-decorator-after.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 01/26/2021
 * Description:
 ******************************************************************/

import { MethodAfter, MetadataAfter } from '../interfaces';
import { saveMetadataAfter } from '../metadata';

export type CreateDecoratorAfterOptions<D> = Pick<MetadataAfter<D>, 'data'>;

export function createDecoratorAfter<T extends unknown[], D>(
    method: MethodAfter<T, D>,
    options: CreateDecoratorAfterOptions<D> = {}
): MethodDecorator & ClassDecorator {
    return ( target: Object, key?: string | symbol, descriptor?: PropertyDescriptor ): void => {
        saveMetadataAfter( descriptor ?? target, method, options );
    };
}
