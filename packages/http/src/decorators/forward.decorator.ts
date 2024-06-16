/******************************************************************
 * Copyright (C) 2022 LvChengbin
 *
 * File: decorators/forward.decorator.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 04/12/2022
 * Description:
 ******************************************************************/

import { InputMetadata } from '@ussuri/core';
import { createInputDecorator } from '@ussuri/core/decorator';
import { ForwardBroker } from '../brokers';


type Data = ConstructorParameters<typeof ForwardBroker>;

async function fn( metadata: InputMetadata ): Promise<unknown> {
    throw new ForwardBroker( ...( metadata.data as Data ) );
}

export function Forward( ...data: Data ): ClassDecorator & MethodDecorator {
    return createInputDecorator( fn, { data } );
}
