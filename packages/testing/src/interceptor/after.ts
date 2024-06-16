/******************************************************************
 * Copyright (C) 2022 LvChengbin
 *
 * File: interceptor/after.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 10/29/2022
 * Description:
 ******************************************************************/

import { createInterceptorAfter } from '@ussuri/method-interceptor';

export async function callClassAfterInterceptor( decorator: ClassDecorator, value: any, context: any ): Promise<any> {
    @decorator
    class DecoratorAfterHelperClass {}
    const after = createInterceptorAfter( DecoratorAfterHelperClass );
    return after( context );
}

export async function callMethodAfterInterceptor( decorator: MethodDecorator, value: any, context: any ): Promise<any> {
    class DecoratorAfterHelperClass {
        @decorator
        decoratorAfterHelperMethod(): void {}
    }
    const descriptor = Object.getOwnPropertyDescriptor( DecoratorAfterHelperClass.prototype, 'decoratorAfterHelperMethod' ) as PropertyDescriptor;
    const after = createInterceptorAfter( descriptor );
    return after( value, context );
}
