import { HttpException, HttpStatus } from '@nestjs/common';

interface LocalizedMessage {
    en: string;
    ar: string;
}

export class CustomException extends HttpException {
    constructor({
        message,
        status = HttpStatus.INTERNAL_SERVER_ERROR,
    }: {
        message: LocalizedMessage;
        status?: HttpStatus;
    }) {
        super({ message }, status);
    }
}

