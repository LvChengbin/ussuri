/******************************************************************
 * Copyright (C) 2021 LvChengbin
 *
 * File: src/index.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 07/14/2021
 * Description:
 ******************************************************************/

import defineProperty, { DefinePropertyOptions } from './define-property';
import createDelegate from './create-delegate';

export interface DelegateMethod {
    ( property: string, method: string ): PropertyDecorator;
}

export interface DelegatesInterface extends DelegateMethod {
    Method: DelegateMethod;
    Getter: DelegateMethod;
    Setter: DelegateMethod;
    Access: DelegateMethod;
    Fluent: DelegateMethod;
}

/**
 * Typescript doesn't support partial optional generic parameters, and it makes you must pass more generic arguments like `Delegates.Method<Context, 'response'>( 'response' )`.
 * @see https://github.com/microsoft/TypeScript/issues/10571
 */

/**
 * @example
 *
 * ```ts
 * @Delegate<Context, 'property'>( Something.prototype, 'property' )
 * class Test {
 *     property = new Something();
 * }
 * ```
 */
export function Delegates<T, M extends keyof T>( targetProto: T[ M ], targetProperty: M, properties?: ( keyof T[ M ] )[] ): ClassDecorator {

    return ( constructor: Function ): void => {

        const proto = constructor.prototype;
        properties ??= Object.getOwnPropertyNames( targetProto ) as ( keyof T[ M ] )[];

        for( const property of properties ) {

            if( property === 'constructor' ) continue;

            const descriptor = Object.getOwnPropertyDescriptor( targetProto, property );

            if( !descriptor ) continue;

            const options: DefinePropertyOptions = {};
            descriptor.set && ( options.setter = true );
            descriptor.get && ( options.getter = true );

            if( descriptor.hasOwnProperty( 'value' ) ) { // eslint-disable-line no-prototype-builtins
                if( descriptor.value instanceof Function ) {
                    options.method = true;
                } else {
                    options.getter = true;
                    descriptor.writable && ( options.setter = true );
                }
            }

            defineProperty<T, M>( proto, property, targetProperty, property, options );
        }
    };
};

/**
 *
 * @example
 *
 * ```ts
 * class Test {
 *     property = new Something();
 *
 *     @Delegates.Method<Test, 'property'>( 'property', 'id' )
 *     id: string;
 *
 *     @Delegates.Method<Test, 'property'>( 'property' )
 *     name: string;
 * }
 * ```
 */
Delegates.Method = createDelegate( { method : true } );

/**
 * Create a getter for the property with the given name on the delegated object
 *
 * @example
 *
 * ```ts
 * class Test {
 *     property = new Something();
 *
 *     @Delegates.Getter<Test, 'property'>( 'property', 'id' )
 *     id: string;
 *
 *     @Delegates.Getter<Test, 'property'>( 'property' )
 *     name: string;
 * }
 * ```
 */
Delegates.Getter = createDelegate( { getter : true } );

Delegates.Setter = createDelegate( { setter : true } );

Delegates.Access = createDelegate( { setter : true, getter : true } );

// Delegates.Fluent = <T, M extends keyof T>( property: M, name?: keyof T[ M ] ): PropertyDecorator => {
//     return ( target: any, key: PropertyKey ): void => {

//         target[ key ] = function( this: T, val: any ): val extends undefined ? T[ M ] T => {
//             if( val !== undefined ) {
//                 this[ property ][ name ] = val;
//                 return this;
//             }
//             return this[ property ][ name ];
//         };
//     };
// };
