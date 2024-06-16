/******************************************************************
 * Copyright (C) 2022-2023 NextSeason
 *
 * @File: interfaces/controller.interface.ts
 *
 * This file is part of NextSeason projects.
 * Code in this file can not be copied and/or distributed without the
 * express permission of NextSeason. Inc
 ******************************************************************/

import { ClassProvider, Scope } from '@ussuri/injection';

export type ControllerClass = ClassProvider[ 'useClass' ];

export interface ControllerItem {
    useClass: ControllerClass;
    scope?: Scope;
}

export interface ControllerMetadata {
    scope?: Scope;
}
