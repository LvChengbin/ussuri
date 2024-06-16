/******************************************************************
 * Copyright (C) 2022-2023 NextSeason
 *
 * @File: utils/compose.ts
 *
 * This file is part of NextSeason projects.
 * Code in this file can not be copied and/or distributed without the
 * express permission of NextSeason. Inc
 ******************************************************************/

import { Constructor } from 'type-fest';
import { Application } from '../application';
import { createConstructorInterceptors } from './create-constructor-interceptors';

export interface ComposeOptions<T = any, R = any> {
    interceptors?: {
        input?: ( context: T, application: Application<T> ) => T | Promise<T>;
        output?: ( output: any, context: T, application: Application<T> ) => R | Promise<R>;
        exception?: ( e: unknown, context: T, application: Application<T> ) => R | Promise<R>;
        finally?: ( context: T, application: Application<T> ) => any;
    };
}

/**
 * Support adding interceptors while calling compose method
 *
 * In a normal process the execution order is:
 *
 * 1. options?.interceptors?.input?.( context )
 * 2. application before interceptors
 * 3. module before interceptors (if exists)
 * 4. callback function
 * 5. module after interceptors (if exists)
 * 6. module finally interceptors (if exists)
 * 7. application after interceptors
 * 8. options?.interceptors.output?.( output, context )
 * 9. application finally interceptors
 * 10. options?.interceptors?.finally?.( context )
 *
 * If an exception is thrown to the application,
 * the `options?.interceptors?.exception` will be called after application exception interceptors.
 *
 * In one word, `options.interceptors` is executed before enter the lifecycle
 * and after exist from the lifecycle.
 */
export async function compose<T = any, R = any>(
    application: Application<T>,
    context: T,
    callback: ( context: T ) => R | Promise<R>,
    options: ComposeOptions<T, R> = {}
): Promise<R> {
    const { interceptors } = options;
    const applicationInterceptors = createConstructorInterceptors( application.constructor as Constructor<unknown> );
    const moduleInterceptors = application.module ? createConstructorInterceptors( application.module as Constructor<unknown> ) : null;

    let output;

    try {
        if( interceptors?.input ) {
            context = await interceptors.input( context, application );
        }
        await applicationInterceptors.before( context, application );
        if( !moduleInterceptors ) {
            output = callback( context );
        } else {
            try {
                await moduleInterceptors.before( context, application );
                output = await callback( context );
                output = moduleInterceptors.after( output, context, application );
            } catch( e: unknown ) {
                output = moduleInterceptors.exception( e, context, application );
            } finally {
                await moduleInterceptors.finally( context, application );
            }
        }

        output = await applicationInterceptors.after( output, context, application );
        if( interceptors?.output ) {
            output = interceptors.output( output, context, application );
        }
    } catch( e: unknown ) {
        try {
            output = await applicationInterceptors.exception( e, context, application );
        } catch( e: unknown ) {
            if( interceptors?.exception ) {
                output = interceptors.exception( e, context, application );
            }
        }
    } finally {
        await applicationInterceptors.finally( context, application );

        if( interceptors?.finally ) {
            await interceptors.finally( context, application );
        }
    }

    return output as R;
}
