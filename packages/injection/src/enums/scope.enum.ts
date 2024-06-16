/******************************************************************
 * Copyright (C) 2022 LvChengbin
 *
 * File: enums/scope.enum.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 02/06/2022
 * Description:
 ******************************************************************/

export enum Scope {

    GLOBAL,

    /**
     * The provider can be shared across multiple classes and the instance will be created at the service start.
     */
    DEFAULT,


    /**
     * The provider can be shared across multiple classes but the instance will not be creat ed at the serveice start, alternatively, it will be created at the first time of invoking the provider.
     */
    DEFERRED,

    /**
     * The provider can be shared across multiple classes and the instance will be created at the first time the provider been called.
     */
    REQUEST,

    /**
     * A new provite instance of the provider is instantiated for every use.
     */
    TRANSIENT
}
