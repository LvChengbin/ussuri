/******************************************************************
 * Copyright (C) 2022 LvChengbin
 *
 * File: interfaces/request-method.interface.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 05/08/2022
 * Description:
 ******************************************************************/

type UppercaseRequestMethod =
    | 'GET'
    | 'POST'
    | 'HEAD'
    | 'PUT'
    | 'DELETE'
    | 'PATCH'
    | 'OPTIONS'
    | 'PURGE'
    | 'LINK'
    | 'UNLINK';

export type RequestMethod =
    | Lowercase<UppercaseRequestMethod>
    | UppercaseRequestMethod;
