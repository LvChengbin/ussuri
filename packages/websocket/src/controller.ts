/******************************************************************
 * Copyright (C) 2022-2024 NextSeason
 *
 * @File: src/controller.ts
 *
 * This file is part of NextSeason projects.
 * Code in this file can not be copied and/or distributed without the
 * express permission of NextSeason. Inc
 ******************************************************************/

import { Controller as CoreController, ControllerMetadata, ControllerOptions, RouterPatternItem } from '@ussuri/core';
import { routingHandler, WEBSOCKET_ROUTING_GROUP } from './websocket';

export function Controller( pattern?: RouterPatternItem, options?: ControllerMetadata ): ClassDecorator {
    return CoreController( {
        ...options,
        routing : {
            pattern,
            group : WEBSOCKET_ROUTING_GROUP,
            handle : routingHandler
        }
    } as ControllerOptions );
}
