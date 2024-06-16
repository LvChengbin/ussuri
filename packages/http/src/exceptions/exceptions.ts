/******************************************************************
 * Copyright (C) 2022 LvChengbin
 *
 * File: exceptions/exceptions.ts
 * Author: LvChengbin<lvchengbin59@gmail.com>
 * Time: 06/12/2022
 * Description:
 ******************************************************************/

import { HttpStatus } from '../enums';
import { BadGatewayException } from './bad-gateway.exception';
import { BadRequestException } from './bad-request.exception';
import { ConflictException } from './conflict.exception';
import { ForbiddenException } from './forbidden.exception';
import { HttpVersionNotSupportedException } from './http-version-not-supported.exception';
import { InternalServerErrorException } from './internal-server-error.exception';
import { MethodNotAllowedException } from './method-not-allowed.exception';
import { NotAcceptableException } from './not-acceptable.exception';
import { NotFoundException } from './not-found.exception';
import { PayloadTooLargeException } from './payload-too-large.exception';
import { RequestTimeoutException } from './request-timeout.exception';
import { ServiceUnavailableException } from './service-unavailable.exception';
import { TooManyRequestsException } from './too-many-requests.exception';
import { UnauthorizedException } from './unauthorized.exception';
import { UnsupportedMediaTypeException } from './unsupported-media-type.exception';
import { UriTooLongException } from './uri-too-long.exception';

export const exceptions = {
    [ HttpStatus.BAD_GATEWAY ] : BadGatewayException,
    [ HttpStatus.BAD_REQUEST ] : BadRequestException,
    [ HttpStatus.CONFLICT ] : ConflictException,
    [ HttpStatus.FORBIDDEN ] : ForbiddenException,
    [ HttpStatus.HTTP_VERSION_NOT_SUPPORTED ] : HttpVersionNotSupportedException,
    [ HttpStatus.INTERNAL_SERVER_ERROR ] : InternalServerErrorException,
    [ HttpStatus.METHOD_NOT_ALLOWED ] : MethodNotAllowedException,
    [ HttpStatus.NOT_ACCEPTABLE ] : NotAcceptableException,
    [ HttpStatus.NOT_FOUND ] : NotFoundException,
    [ HttpStatus.PAYLOAD_TOO_LARGE ] : PayloadTooLargeException,
    [ HttpStatus.REQUEST_TIMEOUT ] : RequestTimeoutException,
    [ HttpStatus.SERVICE_UNAVAILABLE ] : ServiceUnavailableException,
    [ HttpStatus.TOO_MANY_REQUESTS ] : TooManyRequestsException,
    [ HttpStatus.UNAUTHORIZED ] : UnauthorizedException,
    [ HttpStatus.UNSUPPORTED_MEDIA_TYPE ] : UnsupportedMediaTypeException,
    [ HttpStatus.URI_TOO_LONG ] : UriTooLongException
};
