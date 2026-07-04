import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { submitQuizSchema, SubmitQuizDto } from '@careeros/shared';
import { LearningService } from './learning.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { CurrentUser, JwtUser } from '../../common/decorators/current-user.decorator';

@ApiTags('learning')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('learning')
export class LearningController {
  constructor(private readonly learning: LearningService) {}

  @Get('resources')
  resources(@Query('skillId') skillId?: string) {
    return this.learning.resources(skillId);
  }

  @Get('courses')
  catalog() {
    return this.learning.catalog();
  }

  @Get('courses/:id')
  course(@Param('id') id: string) {
    return this.learning.course(id);
  }

  @Post('courses/:id/enroll')
  enroll(@CurrentUser() user: JwtUser, @Param('id') id: string) {
    return this.learning.enroll(user.userId, id);
  }

  @Get('enrollments')
  myEnrollments(@CurrentUser() user: JwtUser) {
    return this.learning.myEnrollments(user.userId);
  }

  @Post('courses/:id/lessons/:lessonId/complete')
  completeLesson(
    @CurrentUser() user: JwtUser,
    @Param('id') id: string,
    @Param('lessonId') lessonId: string,
  ) {
    return this.learning.completeLesson(user.userId, id, lessonId);
  }

  @Post('quizzes/:quizId/submit')
  submitQuiz(
    @CurrentUser() user: JwtUser,
    @Param('quizId') quizId: string,
    @Body(new ZodValidationPipe(submitQuizSchema)) dto: SubmitQuizDto,
  ) {
    return this.learning.submitQuiz(user.userId, quizId, dto);
  }

  @Get('certificates')
  myCertificates(@CurrentUser() user: JwtUser) {
    return this.learning.myCertificates(user.userId);
  }
}
