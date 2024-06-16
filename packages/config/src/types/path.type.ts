/******************************************************************
 * Copyright (C) 2022 LvChengbin
 *
 * File: types/path.type.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 06/05/2022
 * Description:
 ******************************************************************/


/**
 * Detect if `T` is `any.
 *
 * only `any` and `unknown` is assignable to `unknown`.
 * `keyof unknown` is `never`.
 */
type IsAny<T> = unknown extends T
    ? keyof T extends never
        ? false
        : true
    : false;

/**
 * List all avalible paths of an interface and stop checking after meeting an `any` type.
 */
type Paths<T, K extends keyof T, F = true> =
    | ( F extends true ? keyof T & string : never )
    | (
        K extends string
            ? IsAny<T[ K ]> extends true
                ? `${K}.${string}`
                : T[ K ] extends Record<string, any>
                    ?
                        | `${K}.${Paths<T[ K ], Exclude<keyof T[ K ], keyof any[]>, false> & string}`
                        | `${K}.${Exclude<keyof T[ K ], keyof any[]> & string}`
                    : never
                :never
    );

export type Path<T> =
    IsAny<T> extends true
        ? string
        : keyof T extends string
            ? Paths<T, keyof T>
            : never;

/**
 * Evaluates value of a type with it's path
 *
 * @example
 *
 * ```ts
 * Value<{ database: { host: string } }, 'database.host'> // string
 * ```
 */
export type Value<T, P extends Path<T>> =
    P extends keyof T
        ? T[ P ]
        : P extends `${infer K}.${infer R}`
            ? K extends keyof T
                ? R extends Path<T[ K ]>
                    ? Value<T[ K ], R>
                    : never
                : never
            : P extends keyof T
                ? T[ P ]
                : never;
