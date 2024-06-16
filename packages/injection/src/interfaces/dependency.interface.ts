/******************************************************************
 * Copyright (C) 2022-2023 NextSeason
 *
 * @File: interfaces/dependency.inerface.ts
 *
 * This file is part of NextSeason projects.
 * Code in this file can not be copied and/or distributed without the
 * express permission of NextSeason. Inc
 ******************************************************************/

import { InjectionToken } from './injection.interface';

export interface OptionalFactoryDependency {
    token: InjectionToken;
    optional?: boolean;
}
