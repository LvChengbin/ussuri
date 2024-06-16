/******************************************************************
 * Copyright (C) 2022 LvChengbin
 *
 * File: interceptor/before.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 05/11/2022
 * Description:
 ******************************************************************/

import { createInterceptorBefore } from '@ussuri/method-interceptor';

export async function callClassBeforeInterceptor( decorator: ClassDecorator, context: any ): Promise<any> {
    @decorator
    class DecoratorBeforeHelperClass {}
    const before = createInterceptorBefore( DecoratorBeforeHelperClass );
    return before( context );
}

export async function callMethodBeforeInterceptor( decorator: MethodDecorator, context: any ): Promise<any> {
    class DecoratorBeforeHelperClass {
        @decorator
        decoratorBeforeHelperMethod(): void {}
    }
    const descriptor = Object.getOwnPropertyDescriptor( DecoratorBeforeHelperClass.prototype, 'decoratorBeforeHelperMethod' ) as PropertyDescriptor;
    const before = createInterceptorBefore( descriptor );
    return before( context );
}
