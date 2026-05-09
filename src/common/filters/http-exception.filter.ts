import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { AppResponseMessages } from '../constants/messages/common.message';
import { LocalizedMessage } from '../enum/localization.enum';
import { isLocalizedMessageObject } from '../utils/localization.util';

@Catch()
export class HttpExceptionsFilter implements ExceptionFilter {

    constructor() {}

    catch(exception: unknown, host: ArgumentsHost): void {
        const httpContext = host.switchToHttp();
        const httpResponse = httpContext.getResponse<Response>();

        const status =
            exception instanceof HttpException
                ? exception.getStatus()
                : HttpStatus.INTERNAL_SERVER_ERROR;
        const exceptionResponse = exception instanceof HttpException ? exception.getResponse() : null;

        const rawMessage = (exceptionResponse as Record<string, unknown>)?.message;

        let localizedMessage: LocalizedMessage;

        if (isLocalizedMessageObject(rawMessage)) {
            localizedMessage = rawMessage;
        } else if (Array.isArray(rawMessage)) {
            localizedMessage = {
                en: (rawMessage[0] as string) || AppResponseMessages.ERROR.UNKNOWN_ERROR.message.en,
                ar: AppResponseMessages.ERROR.UNKNOWN_ERROR.message.ar,
            };
        } else {
            localizedMessage = {
                en: (rawMessage as string) || AppResponseMessages.ERROR.UNKNOWN_ERROR.message.en,
                ar: AppResponseMessages.ERROR.UNKNOWN_ERROR.message.ar,
            };
        }

        httpResponse.status(status).json({
            message: localizedMessage
        })
    }
}