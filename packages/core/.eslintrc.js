/******************************************************************
 * Copyright (C) 2022 LvChengbin
 *
 * File: core/.eslintrc.js
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 04/09/2022
 * Description:
 ******************************************************************/

module.exports = {
    overrides : [ {
        files : [ '*.ts', '*.tsx' ],
        rules : {
            '@typescript-eslint/no-explicit-any' : 'off'
        }
    } ]
};
