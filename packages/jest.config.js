/******************************************************************
 * Copyright (C) 2021 LvChengbin
 *
 * File: kickoff/jest.config.js
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 06/09/2021
 * Description:
 ******************************************************************/

module.exports = {
    projects : [
        // workspaces of ussuri
        '<rootDir>/core',
        '<rootDir>/delegates',
        '<rootDir>/http',
        '<rootDir>/injection',
        '<rootDir>/method-interceptor',
        '<rootDir>/testing'
    ]
};
