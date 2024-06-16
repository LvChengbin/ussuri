/******************************************************************
 * Copyright (C) 2022 LvChengbin
 *
 * File: decorators/inject.decorator.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 02/12/2022
 * Description:
 ******************************************************************/

import { saveMetadataParameter } from '@ussuri/method-interceptor';
import { InjectionParam } from '../injection-param';
import { InjectionToken } from '../interfaces';
import { INJECT_PROPERTY_METADATA_KEY } from '../constants';

/**
 * Parameter decorator @Inject()
 *
 * @example
 *
 * ```ts
 * class Example {
 *     constructor(
 *         @Inject( 'DB' ) private connection: Connection
 *     ) {}
 * }
 * ```
 */
export function Inject( token: InjectionToken ): ParameterDecorator;

/**
 * Property decorator @Inject()
 *
 * @example
 *
 * ```ts
 * class Example {
 *     @Inject( 'DB' ) private connection: Connection;
 * }
 * ```
 */
export function Inject( token: InjectionToken ): PropertyDecorator;

export function Inject( token: InjectionToken ): PropertyDecorator | ParameterDecorator {
    return ( target: any, key: string | symbol, i?: number ) => {
        if( i === undefined ) {
            // Being used as a property decorator
            let metadata: Record<string | symbol, InjectionParam> = Reflect.getMetadata( INJECT_PROPERTY_METADATA_KEY, target );

            if( metadata?.[ key ] ) {
                metadata[ key ].token = token;
                return;
            }

            const injectionParam = new InjectionParam( { token } );

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
                value.token = token;
                return value;
            }
            return new InjectionParam( { token } );
        } );
    };
}
