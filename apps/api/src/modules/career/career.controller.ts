import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  careerProfileSchema,
  CareerProfileDto,
  Plan,
  recommendationsRequestSchema,
} from '@careeros/shared';
import { CareerService } from './career.service';
import { JobReadinessService } from './job-readiness.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PlanGuard } from '../../common/guards/plan.guard';
import { RequirePlan } from '../../common/decorators/plan.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { CurrentUser, JwtUser } from '../../common/decorators/current-user.decorator';

@ApiTags('career')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PlanGuard)
@Controller('career')
export class CareerController {
  constructor(
    private readonly career: CareerService,
    private readonly jobReadiness: JobReadinessService,
  ) {}

  @Get('profile')
  getProfile(@CurrentUser() user: JwtUser) {
    return this.career.getProfile(user.userId);
  }

  @Post('profile')
  saveProfile(
    @CurrentUser() user: JwtUser,
    @Body(new ZodValidationPipe(careerProfileSchema)) dto: CareerProfileDto,
  ) {
    return this.career.saveProfile(user.userId, dto);
  }

  @Get('recommendations')
  listRecommendations(@CurrentUser() user: JwtUser) {
    return this.career.listRecommendations(user.userId);
  }

  @Post('recommendations')
  generateRecommendations(
    @CurrentUser() user: JwtUser,
    @Body(new ZodValidationPipe(recommendationsRequestSchema))
    dto: { limit: number; locale: 'en' | 'ru' | 'uz' },
  ) {
    return this.career.generateRecommendations(user.userId, dto.limit, dto.locale);
  }

  @Get('skill-gaps')
  skillGaps(@CurrentUser() user: JwtUser) {
    return this.career.skillGaps(user.userId);
  }

  @Get('job-readiness')
  @RequirePlan(Plan.PREMIUM)
  jobReadinessScore(@CurrentUser() user: JwtUser, @Query('role') role = 'Frontend Developer') {
    return this.jobReadiness.compute(user.userId, role);
  }
}
