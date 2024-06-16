/******************************************************************
 * Copyright (C) 2022-2023 NextSeason
 *
 * @File: src/controller.ts
 *
 * This file is part of NextSeason projects.
 * Code in this file can not be copied and/or distributed without the
 * express permission of NextSeason. Inc
 ******************************************************************/

import { Controller as CoreController, ControllerMetadata, ControllerOptions, RouterPatternItem } from '@ussuri/core';
import { routingHandler, HTTP_ROUTING_GROUP } from './http';

export function Controller( pattern?: RouterPatternItem, options?: ControllerMetadata ): ClassDecorator {
    return CoreController( {
        ...options,
        /**
         * make it be compatible with the previous Controller version
         */
        path : pattern,
        routing : {
            pattern,
            group : HTTP_ROUTING_GROUP,
            handle : routingHandler
        }
    } as ControllerOptions );
}
