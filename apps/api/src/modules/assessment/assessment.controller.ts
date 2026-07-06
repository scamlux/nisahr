import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  startAssessmentSchema,
  StartAssessmentDto,
  submitAssessmentSchema,
  SubmitAssessmentDto,
} from '@careeros/shared';
import { AssessmentService } from './assessment.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { CurrentUser, JwtUser } from '../../common/decorators/current-user.decorator';

@ApiTags('assessment')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('assessments')
export class AssessmentController {
  constructor(private readonly assessment: AssessmentService) {}

  @Post('start')
  @ApiOperation({ summary: 'Start or resume the final assessment for a roadmap' })
  start(
    @CurrentUser() user: JwtUser,
    @Body(new ZodValidationPipe(startAssessmentSchema)) dto: StartAssessmentDto,
  ) {
    return this.assessment.start(user.userId, dto.roadmapId);
  }

  @Post(':attemptId/submit')
  @ApiOperation({ summary: 'Submit answers; issues a certificate on pass' })
  submit(
    @CurrentUser() user: JwtUser,
    @Param('attemptId') attemptId: string,
    @Body(new ZodValidationPipe(submitAssessmentSchema)) dto: SubmitAssessmentDto,
  ) {
    return this.assessment.submit(user.userId, attemptId, dto.answers);
  }

  @Get('status/:roadmapId')
  @ApiOperation({ summary: 'Latest attempt + certificate state for a roadmap' })
  status(@CurrentUser() user: JwtUser, @Param('roadmapId') roadmapId: string) {
    return this.assessment.statusFor(user.userId, roadmapId);
  }

  @Get('certificate/:roadmapId')
  @ApiOperation({ summary: 'Owner certificate for a roadmap (includes verify token)' })
  certificate(@CurrentUser() user: JwtUser, @Param('roadmapId') roadmapId: string) {
    return this.assessment.getCertificate(user.userId, roadmapId);
  }
}

/** Public, unauthenticated certificate verification (F6). Leaks no PII. */
@ApiTags('verify')
@Controller('verify')
export class VerifyController {
  constructor(private readonly assessment: AssessmentService) {}

  @Get(':token')
  @ApiOperation({ summary: 'Publicly verify a certificate by its token' })
  verify(@Param('token') token: string) {
    return this.assessment.verify(token);
  }
}
