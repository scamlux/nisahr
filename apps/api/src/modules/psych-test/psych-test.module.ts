import { Module } from '@nestjs/common';
import { PsychTestService } from './psych-test.service';
import { PsychTestController } from './psych-test.controller';

@Module({
  controllers: [PsychTestController],
  providers: [PsychTestService],
  exports: [PsychTestService],
})
export class PsychTestModule {}
