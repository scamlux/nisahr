import { Module } from '@nestjs/common';
import { AssessmentController, VerifyController } from './assessment.controller';
import { AssessmentService } from './assessment.service';

@Module({
  controllers: [AssessmentController, VerifyController],
  providers: [AssessmentService],
  exports: [AssessmentService],
})
export class AssessmentModule {}
