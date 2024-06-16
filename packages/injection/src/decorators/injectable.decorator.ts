/******************************************************************
 * Copyright (C) 2022 LvChengbin
 *
 * File: decorators/injectable.decorator.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 02/12/2022
 * Description:
 ******************************************************************/

import { Injection } from '../injection';
import { InjectableOptions } from '../interfaces';

export function Injectable( options: InjectableOptions = {} ): ClassDecorator {
    return ( target: any ): void => {
        Injection.defineInjectableMetadata( target, options );
    };
}
