/******************************************************************
 * Copyright (C) 2022-2023 NextSeason
 *
 * @File: src/action.ts
 *
 * This file is part of NextSeason projects.
 * Code in this file can not be copied and/or distributed without the
 * express permission of NextSeason. Inc
 ******************************************************************/

import { Action as CoreAction, ActionOptions, ActionMetadata, RouterPatternItem } from '@ussuri/core';
import { routingHandler, HTTP_ROUTING_GROUP } from './http';

function createRouterDecorator( method: string ) {
    return ( pattern?: RouterPatternItem, options?: ActionMetadata ): MethodDecorator => {
        return CoreAction( {
            ...options,
            /**
             * make @Action be compatible with the previous implementation
             */
            method,
            path : pattern,
            routing : {
                pattern,
                namespace : method,
                group : HTTP_ROUTING_GROUP,
                handle : routingHandler
            }
        } as ActionOptions );
    };
}

export const Get = createRouterDecorator( 'GET' );
export const Post = createRouterDecorator( 'POST' );
export const Head = createRouterDecorator( 'HEAD' );
export const Put = createRouterDecorator( 'PUT' );
export const Patch = createRouterDecorator( 'PATCH' );
export const Delete = createRouterDecorator( 'DELETE' );
export const Options = createRouterDecorator( 'OPTIONS' );
export const Action = createRouterDecorator( '*' );
