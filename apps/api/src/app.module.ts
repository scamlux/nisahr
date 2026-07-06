import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { SearchModule } from './modules/search/search.module';
import { AssessmentModule } from './modules/assessment/assessment.module';
import { AiModule } from './modules/ai/ai.module';
import { CareerModule } from './modules/career/career.module';
import { ChatModule } from './modules/chat/chat.module';
import { RoadmapModule } from './modules/roadmap/roadmap.module';
import { LearningModule } from './modules/learning/learning.module';
import { ProgressModule } from './modules/progress/progress.module';
import { InterviewModule } from './modules/interview/interview.module';
import { PsychTestModule } from './modules/psych-test/psych-test.module';
import { SubscriptionModule } from './modules/subscription/subscription.module';
import { ResumeModule } from './modules/resume/resume.module';
import { HealthController } from './health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    SearchModule,
    AssessmentModule,
    AiModule,
    AuthModule,
    UsersModule,
    CareerModule,
    ChatModule,
    RoadmapModule,
    LearningModule,
    ProgressModule,
    InterviewModule,
    ResumeModule,
    SubscriptionModule,
    PsychTestModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
