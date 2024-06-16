/******************************************************************
 * Copyright (C) 2022 LvChengbin
 *
 * File: interfaces/request.interface.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 06/11/2022
 * Description:
 ******************************************************************/

import { AxiosRequestConfig } from 'axios';
import { Application } from '@ussuri/core';

export type ResponseType =
  | 'arraybuffer'
  | 'blob'
  | 'document'
  | 'json'
  | 'text'
  | 'stream';

export interface RequestOptions<D = any> extends AxiosRequestConfig<D> {
    service?: string | Application;
    path?: string;
    query?: any;
    headers?: Record<string, string>;
    payload?: any;
    interceptors?: {
        request?: ( options: RequestOptions<D> ) => RequestOptions<D>;
    };
}
