import { Module } from '@nestjs/common';
import { ValidationPipe } from './pipes/validation.pipe';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';
import { HttpExceptionsFilter } from './filters/http-exception.filter';

@Module({
    imports: [],
    controllers: [],
    providers: [
        {
            provide: APP_PIPE,
            useClass: ValidationPipe,
        },
        {
            provide: APP_FILTER,
            useClass: HttpExceptionsFilter,
        }
    ],
})
export class CommonModule { }
