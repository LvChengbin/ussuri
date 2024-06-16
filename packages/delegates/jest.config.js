/******************************************************************
 * Copyright (C) 2020 LvChengbin
 *
 * File: body/jest.config.js
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 12/09/2020
 * Description:
 ******************************************************************/

module.exports = {
    ...require( '../jest.base.config.js' ),
    rootDir : __dirname,
    name : '@ussuri/delegates',
    displayName : '@ussuri/delegates'
};
