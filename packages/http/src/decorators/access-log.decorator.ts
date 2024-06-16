/******************************************************************
 * Copyright (C) 2022-2023 NextSeason
 *
 * @File: decorators/access-log.decorator.ts
 *
 * This file is part of NextSeason projects.
 * Code in this file can not be copied and/or distributed without the
 * express permission of NextSeason. Inc
 ******************************************************************/

import { Morgan } from '@ussuri/morgan';
import { Context } from '../context';

export function AccessLog( tag = 'Ussuri' ): ClassDecorator & MethodDecorator {
    const format = ':tag :ip :time :method :protocol :host:url :status :length :headers.referer :headers.user-agent :age';
    return Morgan( format, {
        tokens : {
            protocol : ( context: Context ): string | null => {
                if( !context.request ) return 'Unknown';

                const { req } = context.request;

                if( req ) {
                    return context.protocol?.toUpperCase() + '/' + req.httpVersion;
                }
                return 'NPS';
            },
            time : ( { time }: Context ): string => {
                return '[' + ( time ?? new Date ).toString() + ']';
            },
            tag : () => '[' + tag + ']',
            ip : ( context: Context ): string => {
                return context.ip || '-';
            }
        }
    } );
}
