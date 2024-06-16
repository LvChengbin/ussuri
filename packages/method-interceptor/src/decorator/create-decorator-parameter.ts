/******************************************************************
 * Copyright (C) 2021 LvChengbin
 *
 * File: decorator/create-decorator-parameter.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 01/26/2021
 * Description:
 ******************************************************************/

import { MethodParameter, MetadataParameter } from '../interfaces';
import { saveMetadataParameter } from '../metadata';

export type CreateDecoratorParameterOptions<D> = Pick<MetadataParameter<D>, 'data'>;

/**
 * Create a ParameterDecorator while be called in InterceptorParameter lifecycle
 *
 * ```ts
 * createDecoratorParameter( () => {}, { data : {} } );
 * ```
 */
export function createDecoratorParameter<T extends unknown[], D>(
    method: MethodParameter<T, D>,
    options: CreateDecoratorParameterOptions<D> = {}
): ParameterDecorator {

    return ( target: object, key: string | symbol | undefined, i: number ): void => {
        saveMetadataParameter( target, key, i, method, options );
    };
}
