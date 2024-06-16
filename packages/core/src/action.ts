/******************************************************************
 * Copyright (C) 2022-2023 NextSeason
 *
 * @File: src/action.ts
 *
 * This file is part of NextSeason projects.
 * Code in this file can not be copied and/or distributed without the
 * express permission of NextSeason. Inc
 ******************************************************************/

import { Merge } from 'type-fest';
import { ACTION_METADATA_KEY, ACTION_ROUTING_METADATA_KEY, DEFAULT_ROUTING_GROUP_NAME } from './constants';
import { ActionMetadata } from './interfaces';
import { RouterRule, RouterPatternItem } from './router';

export type ActionRoutingOptions<T = any> = Partial<
    Merge<RouterRule<T>, {
        pattern: RouterPatternItem;
    }>
>;

export type ActionRoutingMetadata<T = any> = {
    rules: Record<string | symbol, ActionRoutingOptions<T>[]>;
};

export function getActionRoutingMetadata<T>(
    target: object
): Record<string | symbol, ActionRoutingMetadata<T>> | undefined;

export function getActionRoutingMetadata<T>(
    target: object,
    action: string | symbol
): ActionRoutingMetadata<T> | undefined;

export function getActionRoutingMetadata<T>(
    target: object,
    action?: string | symbol
): Record<string | symbol, ActionRoutingMetadata<T>> | ActionRoutingMetadata<T> | undefined {
    const metadata = Reflect.getOwnMetadata( ACTION_ROUTING_METADATA_KEY, target );
    return action ? metadata?.[ action ] : metadata;
}

export function defineActionRoutingMetadata<T>(
    target: object,
    action: string | symbol,
    metadata: ActionRoutingMetadata<T>
): void {
    const exists: Record<string | symbol, ActionRoutingMetadata<T>> = getActionRoutingMetadata( target ) ?? {};
    exists[ action ] = metadata;
    Reflect.defineMetadata( ACTION_ROUTING_METADATA_KEY, exists, target );
}

export function addActionRoutingRule<T = any>(
    controller: object,
    action: string | symbol,
    group: string | symbol,
    rule: ActionRoutingOptions<T>
): void {
    const exists: ActionRoutingMetadata<T> = getActionRoutingMetadata( controller, action ) ?? { rules : {} };
    exists.rules ??= {};
    exists.rules[ group ] ??= [];
    exists.rules[ group ].push( rule );

    defineActionRoutingMetadata( controller, action, exists );
}

export function defineActionMetadata( target: object, action: string | symbol, metadata: ActionMetadata ): void {
    const exists = Reflect.getOwnMetadata( ACTION_METADATA_KEY, target ) ?? {};
    exists[ action ] = metadata;
    Reflect.defineMetadata( ACTION_METADATA_KEY, exists, target );
}

/**
 * Get action metadatas of given controller.
 */
export function getActionMetadatas<T extends object>( target: T ): Partial<Record< keyof T, ActionMetadata>> {
    return Reflect.getOwnMetadata( ACTION_METADATA_KEY, target );
}

export type ActionOptions<T = any> =
    & ActionMetadata
    & { routing?: ActionRoutingOptions<T> | ActionRoutingOptions<T>[] };

/**
 * @example
 *
 * ```ts
 * @Action()
 *
 * @Action( 'a' )
 *
 * @Action( [ 'a', 'b' ] )
 *
 * @Action( [ {}, {} ] )
 *
 * @Action( {
 *     routing : {
 *         namespace : 'GET',
 *         group : 'http',
 *         path : 'a'
 *     }
 * } )
 *
 * ```
 */
export function Action<T = any>(
    options: string | ( string | ActionRoutingOptions<T> )[] | ActionOptions<T>
): MethodDecorator {
    return ( target, key: string | symbol ): void => {

        let routing: ( string | RegExp | ActionRoutingOptions )[] = [];
        const actionMetadata: ActionMetadata = {};

        if(
            options
            && typeof options === 'object'
            && !Array.isArray( options )
            && !( options instanceof RegExp )
        ) {
            const { routing : r, ...opts } = options;
            r && ( routing = Array.isArray( r ) ? r : [ r ] );
            Object.assign( actionMetadata, opts );
        } else if( typeof options === 'string' || options instanceof RegExp ) {
            routing = [ { pattern : options } ];
        } else if( !options ) {
            /**
             * Using action name as routing pattern
             */
            routing = [ { pattern : String( key ) } ];
        } else {
            routing = options;
        }

        for( const item of routing ) {
            if( typeof item === 'string' || item instanceof RegExp ) {
                addActionRoutingRule<T>(
                    target,
                    key,
                    DEFAULT_ROUTING_GROUP_NAME,
                    { pattern : item }
                );
                continue;
            }

            const {
                group = DEFAULT_ROUTING_GROUP_NAME,
                ...rest
            } = item;

            addActionRoutingRule<T>( target, key, group, {
                pattern : String( key ),
                ...rest
            } );
        }

        defineActionMetadata( target, key, actionMetadata );
    };
}
