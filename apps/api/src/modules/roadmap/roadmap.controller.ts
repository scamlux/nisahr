import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  addTaskSchema,
  AddTaskDto,
  generateRoadmapSchema,
  GenerateRoadmapDto,
  SkillStatus,
  StageStatus,
  updateStageStatusSchema,
} from '@careeros/shared';
import { RoadmapService } from './roadmap.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { CurrentUser, JwtUser } from '../../common/decorators/current-user.decorator';

@ApiTags('roadmaps')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('roadmaps')
export class RoadmapController {
  constructor(private readonly roadmap: RoadmapService) {}

  @Post('generate')
  generate(
    @CurrentUser() user: JwtUser,
    @Body(new ZodValidationPipe(generateRoadmapSchema)) dto: GenerateRoadmapDto,
  ) {
    return this.roadmap.generate(user.userId, dto, user.plan, user.role);
  }

  @Get()
  list(@CurrentUser() user: JwtUser) {
    return this.roadmap.list(user.userId);
  }

  @Get(':id')
  get(@CurrentUser() user: JwtUser, @Param('id') id: string) {
    return this.roadmap.get(user.userId, id);
  }

  @Patch(':id/stages/:stageId/status')
  setStageStatus(
    @CurrentUser() user: JwtUser,
    @Param('id') id: string,
    @Param('stageId') stageId: string,
    @Body(new ZodValidationPipe(updateStageStatusSchema)) dto: { status: StageStatus },
  ) {
    return this.roadmap.setStageStatus(user.userId, id, stageId, dto.status);
  }

  @Patch(':id/skills/:stageSkillId/status')
  setSkillStatus(
    @CurrentUser() user: JwtUser,
    @Param('id') id: string,
    @Param('stageSkillId') stageSkillId: string,
    @Body(new ZodValidationPipe(updateStageStatusSchema)) dto: { status: SkillStatus },
  ) {
    return this.roadmap.setSkillStatus(user.userId, id, stageSkillId, dto.status);
  }

  @Patch(':id/tasks/:taskId/toggle')
  toggleTask(
    @CurrentUser() user: JwtUser,
    @Param('id') id: string,
    @Param('taskId') taskId: string,
  ) {
    return this.roadmap.toggleTask(user.userId, id, taskId);
  }

  @Post(':id/stages/:stageId/tasks')
  addTask(
    @CurrentUser() user: JwtUser,
    @Param('id') id: string,
    @Param('stageId') stageId: string,
    @Body(new ZodValidationPipe(addTaskSchema)) dto: AddTaskDto,
  ) {
    return this.roadmap.addTask(user.userId, id, stageId, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: JwtUser, @Param('id') id: string) {
    return this.roadmap.remove(user.userId, id);
  }
}
