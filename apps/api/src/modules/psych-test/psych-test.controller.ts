import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { submitPsychTestSchema, SubmitPsychTestDto } from '@careeros/shared';
import { PsychTestService } from './psych-test.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { CurrentUser, JwtUser } from '../../common/decorators/current-user.decorator';

@ApiTags('psych-test')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('psych-test')
export class PsychTestController {
  constructor(private readonly psychTest: PsychTestService) {}

  @Get()
  @ApiOperation({ summary: 'Versioned RIASEC question set (uz/ru/en)' })
  getTest() {
    return this.psychTest.getTest();
  }

  @Post('submit')
  @ApiOperation({ summary: 'Deterministic scoring → RIASEC profile' })
  submit(
    @CurrentUser() user: JwtUser,
    @Body(new ZodValidationPipe(submitPsychTestSchema)) dto: SubmitPsychTestDto,
  ) {
    return this.psychTest.submit(user.userId, dto.version, dto.answers);
  }

  @Get('result')
  @ApiOperation({ summary: 'Latest RIASEC result for the current user' })
  result(@CurrentUser() user: JwtUser) {
    return this.psychTest.latest(user.userId);
  }
}
