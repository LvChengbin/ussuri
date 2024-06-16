/******************************************************************
 * Copyright (C) 2022-2023 NextSeason
 *
 * @File: brokers/forward.broker.ts
 *
 * This file is part of NextSeason projects.
 * Code in this file can not be copied and/or distributed without the
 * express permission of NextSeason. Inc
 ******************************************************************/

import { Broker } from '@ussuri/method-interceptor';
import { Context } from '../context';
import { Application } from '../application';

export interface ForwardBrokerHandler<C extends Context, A extends Application<C>> {
    ( context: C, application: A ): C;
}

export interface ForwardBrokerValue<C extends Context, A extends Application<C>> {
    path: string;
    handler?: ForwardBrokerHandler<C, A>;
}

export class ForwardBroker<C extends Context, A extends Application<C>> extends Broker<ForwardBrokerValue<C, A>> {
    constructor( path: string, handler?: ForwardBrokerHandler<C, A> ) {
        super( { path, handler } );
    }
}
