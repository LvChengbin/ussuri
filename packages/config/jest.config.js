/******************************************************************
 * Copyright (C) 2021 LvChengbin
 *
 * File: core/jest.config.js
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 04/07/2021
 * Description:
 ******************************************************************/

const { name } = require( './package.json' );

module.exports = {
    ...require( '../jest.base.config.js' ),
    rootDir : __dirname,
    displayName : name,
    id : name
};
