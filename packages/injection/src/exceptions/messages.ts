/******************************************************************
 * Copyright (C) 2022 LvChengbin
 *
 * File: exceptions/messages.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 02/09/2022
 * Description:
 ******************************************************************/

import { InjectionToken } from '../interfaces';

function tokenToString( token: InjectionToken ): string {
    return typeof token === 'function' ? token.name : String( token );
}

export function unknownDependencyMessage( token: InjectionToken, index: number, dependency: InjectionToken ): string {
    return `
Cannot resolve dependency of the ${tokenToString( token )}.
Please make sure the argument ${tokenToString( dependency )} at [${index}] is available.
    `;
}

export function unknownPropertyDependencyMessage( token: InjectionToken, key: string | symbol, dependency: InjectionToken ): string {
    return `
Cannot resolve dependency of the ${tokenToString( token )}.
Please make sure the property ${tokenToString( dependency )} named ${key.toString()} is avaliable.
    `;
}

export function undefinedDependencyMessage( token: InjectionToken ): string {
    return `
Cannot instantiate ${tokenToString( token )} because it's not defined.
    `;
}

export function circularDependencyMessage( token: InjectionToken, circlePath: InjectionToken[] ): string {
    const path: string[] = [ ...circlePath, token ].map( ( item: InjectionToken ) => tokenToString( item ) );
    return `
Dependency circle found in path: ${path.join( ' -> ' )}.
    `;
}

export function duplicateDependenciesMessage( token: InjectionToken ): string {
    return `
Duplicate provider token ${tokenToString( token )}
    `;
}

