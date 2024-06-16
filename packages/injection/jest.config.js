/******************************************************************
 * Copyright (C) 2022 LvChengbin
 *
 * File: injection/jest.config.js
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 02/13/2022
 * Description:
 ******************************************************************/

const { name } = require( './package.json' );

module.exports = {
    ...require( '../jest.base.config.js' ),
    rootDir : __dirname,
    displayName : name,
    id : name
};
