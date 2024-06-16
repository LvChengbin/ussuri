/******************************************************************
 * Copyright (C) 2021 LvChengbin
 *
 * File: ussuri/jest.base.config.js
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 11/24/2021
 * Description:
 ******************************************************************/

module.exports = {
    ...require( '../../jest.base.config' ),
    setupFilesAfterEnv : [ 'jest-extended/all' ]
};
