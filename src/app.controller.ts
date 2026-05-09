import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Query, Req, Res, UsePipes } from '@nestjs/common';
import { AppService } from './app.service';
import { Request, Response } from 'express';
import { validationBodyDto, validationParamDto, validationQueryParamDto } from './modules/test-module/dto/validate.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}
}
