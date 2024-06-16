/******************************************************************
 * Copyright (C) 2022-2023 NextSeason
 *
 * @File: src/controller.ts
 *
 * This file is part of NextSeason projects.
 * Code in this file can not be copied and/or distributed without the
 * express permission of NextSeason. Inc
 ******************************************************************/

import { Merge } from 'type-fest';
import { Injection } from '@ussuri/injection';
import { CONTROLLER_METADATA_KEY, CONTROLLER_ROUTING_METADATA_KEY, DEFAULT_ROUTING_GROUP_NAME } from './constants';
import { ControllerMetadata } from './interfaces';
import { RouterRule, RouterPatternItem } from './router';

export type ControllerRoutingOptions<T = any> = Partial<
    Merge<RouterRule<T>, {
        pattern: RouterPatternItem;
    }>
>;

export interface ControllerRoutingMetadata<T = any> {
    rules: Record<string | symbol, ControllerRoutingOptions<T>[]>;
}

export function defineControllerRoutingMetadata<T>(
    target: object,
    metadata: ControllerRoutingMetadata<T>
): void {
    Reflect.defineMetadata( CONTROLLER_ROUTING_METADATA_KEY, metadata, target );
}

export function getControllerRoutingMetadata<T>(
    target: object
): ControllerRoutingMetadata<T> | undefined {
    return Reflect.getMetadata( CONTROLLER_ROUTING_METADATA_KEY, target );
}

export function addControllerRoutingRule<T>(
    controller: object,
    group: string | symbol,
    rule: ControllerRoutingOptions<T>
): void {
    const exists: ControllerRoutingMetadata<T> = getControllerRoutingMetadata( controller ) ?? { rules : {} };
    exists.rules ??= {};
    exists.rules[ group ] ??= [];
    exists.rules[ group ].push( rule );
    defineControllerRoutingMetadata( controller, exists );
}

export function defineControllerMetadata(
    target: object,
    metadata: ControllerMetadata
): void {
    Reflect.defineMetadata( CONTROLLER_METADATA_KEY, metadata, target );
}

export function getControllerMetadata(
    target: object
): ControllerMetadata | undefined {
    return Reflect.getMetadata( CONTROLLER_METADATA_KEY, target );
}

export type ControllerOptions<T = any> =
    & ControllerMetadata
    & { routing?:
        | ControllerRoutingOptions<T>
        | ControllerRoutingOptions<T>[];
    };

/**
 *
 * @example:
 *
 * ```ts
 * @Controller()
 *
 * @Controller( {
 *     scope : Scope.REQUEST
 * } )
 *
 * @Controller( '/' )
 *
 * @Controller( [ '/a', '/b' ] )
 *
 * @Controller( [ {
 *     namespace : 'GET',
 *     group : 'http',
 *     path : '/a'
 * }, {
 *     namespace : 'HEAD',
 *     group : 'http',
 *     path : '/a'
 * } ] )
 *
 * @Controller( {
 *     scope : Scope.REQUEST,
 *     routing : {}
 * } )
 *
 * @Controller( {
 *     scope : Scope.REQUEST,
 *     routing : []
 * } )
 * ```
 */
export function Controller(
    options?:
        | string
        | RegExp
        | ( string | RegExp | ControllerRoutingOptions )[]
        | ControllerOptions
): ClassDecorator {
    return ( target ): void => {

        let routing: ( string | RegExp | ControllerRoutingOptions )[] = [];
        const controllerMetadata: ControllerMetadata = {};
        const name = target.name.replace( /Controller$/, '' ).toLowerCase();

        /**
         * Get a ControllerOptions
         */
        if(
            options
            && typeof options === 'object'
            && !Array.isArray( options )
            && !( options instanceof RegExp )
        ) {
            const { routing : r, ...opts } = options;
            r && ( routing = Array.isArray( r ) ? r : [ r ] );
            Object.assign( controllerMetadata, opts );
        } else if( typeof options === 'string' || options instanceof RegExp ) {
            routing = [ { pattern : options } ];
        } else if( !options ) {
            /**
             * Using controller name as routing pattern
             */
            routing = [ { pattern : name } ];
        } else {
            routing = options;
        }

        for( const item of routing ) {

            if( typeof item === 'string' || item instanceof RegExp ) {
                addControllerRoutingRule(
                    target,
                    DEFAULT_ROUTING_GROUP_NAME,
                    { pattern : item }
                );
                continue;
            }

            const {
                group = DEFAULT_ROUTING_GROUP_NAME,
                ...rest
            } = item;

            addControllerRoutingRule( target, group, {
                pattern : name,
                ...rest
            } );
        }

        defineControllerMetadata( target, controllerMetadata );
        Injection.defineInjectableMetadata( target, controllerMetadata );
    };
}
