/******************************************************************
 * Copyright (C) 2022 LvChengbin
 *
 * File: interceptor/parameter.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 05/16/2022
 * Description:
 ******************************************************************/

import { createInterceptorParameter } from '@ussuri/method-interceptor';

export async function callParameterInterceptor( decorator: ParameterDecorator, context: any ): Promise<any> {

    class DecoratorParameterHelperClass {
        decoratorParameterHelperMethod( @decorator param: any ): any {
            return param;
        }
    }

    const parameter = createInterceptorParameter( DecoratorParameterHelperClass.prototype, 'decoratorParameterHelperMethod' );

    return parameter( context );
}
