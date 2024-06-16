/******************************************************************
 * Copyright (C) 2022-2024 NextSeason
 *
 * @File: src/action.ts
 *
 * This file is part of NextSeason projects.
 * Code in this file can not be copied and/or distributed without the
 * express permission of NextSeason. Inc
 ******************************************************************/

import { Action, ActionMetadata, ActionOptions, RouterPatternItem } from '@ussuri/core';
import { routingHandler, WEBSOCKET_ROUTING_GROUP } from './websocket';
import { Context } from './context';

function createRouterDecorator( event: string ) {
    return ( pattern?: RouterPatternItem, options?: ActionMetadata ): MethodDecorator => {
        return Action<Context>( {
            ...options,
            routing : {
                pattern,
                namespace : event,
                group : WEBSOCKET_ROUTING_GROUP,
                handle : routingHandler
            }
        } as ActionOptions );
    };
};

export const Message = createRouterDecorator( 'message' );
export const Upgrade = createRouterDecorator( 'upgrade' );
export const Connection = createRouterDecorator( 'connection' );
