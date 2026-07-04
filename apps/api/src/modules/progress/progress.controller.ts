import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Plan } from '@careeros/shared';
import { ProgressService } from './progress.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PlanGuard } from '../../common/guards/plan.guard';
import { RequirePlan } from '../../common/decorators/plan.decorator';
import { CurrentUser, JwtUser } from '../../common/decorators/current-user.decorator';

@ApiTags('progress')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PlanGuard)
@Controller('progress')
export class ProgressController {
  constructor(private readonly progress: ProgressService) {}

  @Get('dashboard')
  dashboard(@CurrentUser() user: JwtUser) {
    return this.progress.dashboard(user.userId);
  }

  @Get('insights')
  @RequirePlan(Plan.PREMIUM)
  insights(@CurrentUser() user: JwtUser) {
    return this.progress.insights(user.userId);
  }
}
