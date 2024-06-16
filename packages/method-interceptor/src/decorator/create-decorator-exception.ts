/******************************************************************
 * Copyright (C) 2021 LvChengbin
 *
 * File: decorator/create-decorator-exception.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 01/26/2021
 * Description:
 ******************************************************************/

import { MethodException, MetadataException } from '../interfaces';
import { saveMetadataException } from '../metadata';

export type CreateDecoratorExceptionOptions<D> = Pick<MetadataException<D>, 'exceptionType' | 'data'>;

export function createDecoratorException<T extends unknown[], D>(
    method: MethodException<T, D>,
    options: CreateDecoratorExceptionOptions<D> = {}
): MethodDecorator & ClassDecorator {
    return ( target: Object, key?: string | symbol, descriptor?: PropertyDescriptor ): void => {
        saveMetadataException( descriptor ?? target, method, options );
    };
}
