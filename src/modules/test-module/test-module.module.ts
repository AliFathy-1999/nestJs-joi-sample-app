import { Module } from '@nestjs/common';
import { TestModuleController } from './test-module.controller';

@Module({
  controllers: [TestModuleController],
  providers: [],
})
export class TestModuleModule {}
