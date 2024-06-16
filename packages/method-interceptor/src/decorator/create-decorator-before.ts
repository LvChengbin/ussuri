/******************************************************************
 * Copyright (C) 2021 LvChengbin
 *
 * File: decorator/create-decorator-before.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 01/24/2021
 * Description:
 ******************************************************************/

import { MethodBefore, MetadataBefore } from '../interfaces';
import { saveMetadataBefore } from '../metadata';

export type CreateDecoratorBeforeOptions<D> = Pick<MetadataBefore<D>, 'data'>;

export function createDecoratorBefore<T extends unknown[], D>(
    method: MethodBefore<T, D>,
    options: CreateDecoratorBeforeOptions<D> = {}
): MethodDecorator & ClassDecorator {
    return ( target: Object, key?: string | symbol, descriptor?: PropertyDescriptor ): void => {
        saveMetadataBefore( descriptor ?? target, method, options );
    };
}
