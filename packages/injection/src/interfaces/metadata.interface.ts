/******************************************************************
 * Copyright (C) 2022 LvChengbin
 *
 * File: interfaces/metadata.interface.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 02/24/2022
 * Description:
 ******************************************************************/

import { Provider } from './provider.interface';

export interface ExtraDependenciesMetadata {
    provider: Provider;
}
