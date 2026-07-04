import { Module } from '@nestjs/common';
import { CareerService } from './career.service';
import { CareerController } from './career.controller';
import { JobReadinessService } from './job-readiness.service';

@Module({
  providers: [CareerService, JobReadinessService],
  controllers: [CareerController],
  exports: [CareerService],
})
export class CareerModule {}
