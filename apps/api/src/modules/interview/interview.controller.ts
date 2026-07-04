import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  interviewAnswerSchema,
  InterviewAnswerDto,
  Plan,
  startInterviewSchema,
  StartInterviewDto,
} from '@careeros/shared';
import { InterviewService } from './interview.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PlanGuard } from '../../common/guards/plan.guard';
import { RequirePlan } from '../../common/decorators/plan.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { CurrentUser, JwtUser } from '../../common/decorators/current-user.decorator';

@ApiTags('interview')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PlanGuard)
@RequirePlan(Plan.PREMIUM)
@Controller('interview')
export class InterviewController {
  constructor(private readonly interview: InterviewService) {}

  @Post('mock')
  start(
    @CurrentUser() user: JwtUser,
    @Body(new ZodValidationPipe(startInterviewSchema)) dto: StartInterviewDto,
  ) {
    return this.interview.start(user.userId, dto);
  }

  @Post('answer')
  answer(
    @CurrentUser() user: JwtUser,
    @Body(new ZodValidationPipe(interviewAnswerSchema)) dto: InterviewAnswerDto,
  ) {
    return this.interview.answer(user.userId, dto.interviewId, dto.answer);
  }

  @Get('history')
  history(@CurrentUser() user: JwtUser) {
    return this.interview.history(user.userId);
  }

  @Get(':id')
  report(@CurrentUser() user: JwtUser, @Param('id') id: string) {
    return this.interview.getReport(user.userId, id);
  }
}
