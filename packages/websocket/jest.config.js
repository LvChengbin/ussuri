/******************************************************************
 * Copyright (C) 2022-2023 NextSeason
 *
 * @File: websocket/jest.config.js
 *
 * This file is part of NextSeason projects.
 * Code in this file can not be copied and/or distributed without the
 * express permission of NextSeason. Inc
 ******************************************************************/

const { name } = require( './package.json' );

module.exports = {
    ...require( '../jest.base.config.js' ),
    setupFilesAfterEnv : [ 'jest-extended/all' ],
    rootDir : __dirname,
    displayName : name,
    id : name
};
