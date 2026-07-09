import { Body, Controller, Get, Patch, UseGuards, UsePipes } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { updateProfileSchema, UpdateProfileDto } from '@careeros/shared';
import { ProfileService } from './profile.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { CurrentUser, JwtUser } from '../../common/decorators/current-user.decorator';

@ApiTags('profile')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('profile')
export class ProfileController {
  constructor(private readonly profile: ProfileService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Aggregated profile hub (F5): identity, career, psych, roadmaps, certificates, activity' })
  overview(@CurrentUser() user: JwtUser) {
    return this.profile.overview(user.userId);
  }

  @Patch()
  @ApiOperation({ summary: 'Edit profile (F5): name, avatar, mini-resume, interests' })
  @UsePipes(new ZodValidationPipe(updateProfileSchema))
  update(@CurrentUser() user: JwtUser, @Body() dto: UpdateProfileDto) {
    return this.profile.update(user.userId, dto);
  }
}
