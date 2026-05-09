import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, Res, Query, Version } from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { validationBodyDto, validationParamDto, validationQueryParamDto } from './dto/validate.dto';

@ApiTags('test-module')
@Controller({ path: 'test-module', version: '1' })
export class TestModuleController {
  constructor() {}

  @Post('/testBody')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Test Joi validation for request body' })
  @ApiResponse({ status: 200, description: 'Validation successful', type: validationBodyDto })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  testJoiValidation(@Body() reqBody: validationBodyDto, @Res() res: Response) {
    const data = reqBody;
    res.json(data);
  }

  @Get('/testParams/:category')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Test Joi validation for params and query' })
  @ApiResponse({ status: 200, description: 'Validation successful' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
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
