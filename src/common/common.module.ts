import { Module } from '@nestjs/common';
import { ValidationPipe } from './pipes/validation.pipe';
import { APP_PIPE } from '@nestjs/core';

@Module({
    imports: [],
    controllers: [],
    providers: [
        {
            provide: APP_PIPE,
            useClass: ValidationPipe,
        }
    ],
})
export class CommonModule { }
