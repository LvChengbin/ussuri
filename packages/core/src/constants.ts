/******************************************************************
 * Copyright (C) 2022 LvChengbin
 *
 * File: src/constants.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 02/08/2022
 * Description:
 ******************************************************************/

export const DEFAULT_CONTROLLER = 'index';

export const DEFAULT_ACTION = 'index';

/**
 * Metadata key for `Controller`s.
 */
export const CONTROLLER_METADATA_KEY = Symbol( 'controller#metadata#key' );

/**
 * Metadata key for `ACTION`s.
 */
export const ACTION_METADATA_KEY = Symbol( 'action#metadata#key' );

/**
 * Metadata key for `Module`s.
 */
export const MODULE_METADATA_KEY = Symbol( 'module#metadata#key' );

export const INJECTABLE_PIPE_METADATA_KEY = Symbol( 'injectable#pipe#metadata#key' );

export const DATACLASS_METADATA_KEY = Symbol( 'dataclass#metadata#key' );

export const CONTROLLER_ROUTING_METADATA_KEY = Symbol( 'controller#routing#metadata#key' );

export const ACTION_ROUTING_METADATA_KEY = Symbol( 'action#routing#metadata#key' );

export const DEFAULT_ROUTING_GROUP_NAME = Symbol( 'default#routing#group#name' );

export const MODULE_ROUTING_GROUP_NAME = Symbol( 'module#routing#group#name' );

export const DEFAULT_ROUTING_NAMESPACE = Symbol( 'default#routing#namespace' );

export const REGISTERED_SERVER_METADATA_KEY = Symbol( 'registered#server#metadata#key' );
