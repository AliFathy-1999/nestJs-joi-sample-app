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

/**
 * HttpExceptionsFilter: Catches all exceptions and formats HTTP responses.
 *
 * - Extracts status and message from HttpExceptions
 * - Handles localized messages (objects with en/ar keys)
 * - Falls back to default error messages for non-localized cases
 * - Returns JSON responses with localized message objects
 */
@Catch()
export class HttpExceptionsFilter implements ExceptionFilter {
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

        // If message is already localized (has en/ar keys)
        if (isLocalizedMessageObject(rawMessage)) {
            localizedMessage = rawMessage;
        } else if (Array.isArray(rawMessage)) {
            // Handle array messages (e.g., from class-validator)
            localizedMessage = {
                en: (rawMessage[0] as string) || AppResponseMessages.ERROR.UNKNOWN_ERROR.message.en,
                ar: AppResponseMessages.ERROR.UNKNOWN_ERROR.message.ar,
            };
        } else {
            // Handle string messages
            localizedMessage = {
                en: (rawMessage as string) || AppResponseMessages.ERROR.UNKNOWN_ERROR.message.en,
                ar: AppResponseMessages.ERROR.UNKNOWN_ERROR.message.ar,
            };
        }

        httpResponse.status(status).json({
            message: localizedMessage
        });
    }
}