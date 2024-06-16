/******************************************************************
 * Copyright (C) 2022 LvChengbin
 *
 * File: decorators/optional.decorator.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 02/13/2022
 * Description:
 ******************************************************************/

import { saveMetadataParameter } from '@ussuri/method-interceptor';
import { InjectionParam } from '../injection-param';
import { INJECT_PROPERTY_METADATA_KEY } from '../constants';

/**
 * Parameter decorator @Optional()
 *
 * @example
 *
 * ```ts
 * class Example {
 *     constructor(
 *         @Optional() @Inject( 'DB' ) private connection: Connection,
 *         @Optional() private service: Service
 *     ) {}
 * }
 * ```
 */
export function Optional( defaultValue?: any ): ParameterDecorator;

/**
 * Property decorator @Optional()
 *
 * @example
 *
 * ```ts
 * class Example {
 *     @Optional() @Inject( 'DB' ) private connection: Connection;
 *     @Optional() private service: Service;
 * }
 * ```
 */
export function Optional( defaultValue?: any ): PropertyDecorator;

export function Optional( defaultValue?: any ): PropertyDecorator | ParameterDecorator {
    return ( target: any, key: string | symbol, i?: number ) => {
        if( i === undefined ) {
            // Being used as a propety decorator
            let metadata: Record<string | symbol, InjectionParam> = Reflect.getMetadata( INJECT_PROPERTY_METADATA_KEY, target );

            if( metadata?.[ key ] ) {
                metadata[ key ].optional = true;
                defaultValue !== undefined && ( metadata[ key ].defaultValue = defaultValue );
                return;
            }

            const injectionParam = new InjectionParam( { optional : true, defaultValue } );

            if( !metadata ) {
                metadata = { [ key ] : injectionParam };
                Reflect.defineMetadata( INJECT_PROPERTY_METADATA_KEY, metadata, target );
                return;
            }

            metadata[ key ] = injectionParam;
            return;
        }

        // Being used as a parameter decorator
        saveMetadataParameter( target, key, i, ( metadata, value ) => {
            if( value instanceof InjectionParam ) {
                value.optional = true;
                defaultValue !== undefined && ( value.defaultValue = defaultValue );
                return value;
            }
            return new InjectionParam( { optional : true, defaultValue } );
        } );
    };
}
