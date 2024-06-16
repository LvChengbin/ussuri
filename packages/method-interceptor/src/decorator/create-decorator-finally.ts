/******************************************************************
 * Copyright (C) 2021 LvChengbin
 *
 * File: decorator/create-decorator-finally.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 04/05/2021
 * Description:
 ******************************************************************/

import { MethodFinally, MetadataFinally } from '../interfaces';
import { saveMetadataFinally } from '../metadata';

export type CreateDecoratorFinallyOptions<D> = Pick<MetadataFinally<D>, 'data'>;

export function createDecoratorFinally<T extends unknown[], D>(
    method: MethodFinally<T, D>,
    options: CreateDecoratorFinallyOptions<D> = {}
): MethodDecorator & ClassDecorator {
    return ( target: Object, key?: string | symbol, descriptor?: PropertyDescriptor ): void => {
        saveMetadataFinally( descriptor ?? target, method, options );
    };
}
