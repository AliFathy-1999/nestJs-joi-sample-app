import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { AppService } from './app.service';
import { CommonResponseMessages } from './common/constants/messages/common.message';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  @HttpCode(HttpStatus.OK)
  getHealth() {
    return CommonResponseMessages.SUCCESS.SERVICE_IS_RUNNING;
  }
}
