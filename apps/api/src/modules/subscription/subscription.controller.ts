import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { changePlanSchema, ChangePlanDto, Plan } from '@careeros/shared';
import { SubscriptionService } from './subscription.service';
import { billingEnabled } from '../../common/guards/plan.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { CurrentUser, JwtUser } from '../../common/decorators/current-user.decorator';

@ApiTags('subscription')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('subscription')
export class SubscriptionController {
  constructor(private readonly subscription: SubscriptionService) {}

  @Get()
  async get(@CurrentUser() user: JwtUser) {
    const subscription = await this.subscription.get(user.userId);
    return { ...subscription, billingEnabled: billingEnabled() };
  }

  @Post('change')
  change(
    @CurrentUser() user: JwtUser,
    @Body(new ZodValidationPipe(changePlanSchema)) dto: ChangePlanDto,
  ) {
    return this.subscription.changePlan(user.userId, dto.plan as Plan);
  }
}
