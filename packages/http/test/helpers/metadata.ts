/******************************************************************
 * Copyright (C) 2022 LvChengbin
 *
 * File: helpers/metadata.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 03/06/2022
 * Description:
 ******************************************************************/

import { ParameterPipeMetadata } from '@ussuri/core';

export function createParameterPipeMetadata( options?: Partial<ParameterPipeMetadata> ): ParameterPipeMetadata {
    return {
        interceptorType : 'parameter',
        data : { pipes : [] },
        paramtype : Object,
        ...options
    };
}
