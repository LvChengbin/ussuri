/******************************************************************
 * Copyright (C) 2022-2023 NextSeason
 *
 * @File: src/broker.ts
 *
 * This file is part of NextSeason projects.
 * Code in this file can not be copied and/or distributed without the
 * express permission of NextSeason. Inc
 ******************************************************************/

export class Broker<T> extends Error {
    constructor( public value: T ) {
        super();
    }
}
