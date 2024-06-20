import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Query, Req, Res, UsePipes } from '@nestjs/common';
import { AppService } from './app.service';
import { Request, Response } from 'express';
import { validationBodyDto, validationParamDto, validationQueryParamDto } from './validate.dto';
import { ValidationPipe } from './validation.pipe';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('/testBody')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe())
  testJoiValidation(@Body() reqBody: validationBodyDto, @Res() res: Response) {
    const data = reqBody;
    res.json(data);
  }

  @Get('/testParams/:category')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe())
  testJoiValidationParam(
    @Param() category: validationParamDto,
    @Query() limitAndPageSize: validationQueryParamDto,
    @Res() res: Response
  ) {
    res.json({
      category,
      limitAndPageSize
    });
  }
}
