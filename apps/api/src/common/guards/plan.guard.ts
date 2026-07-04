import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Plan } from '@careeros/shared';
import { PLAN_KEY } from '../decorators/plan.decorator';

/** PREMIUM-gates routes. ADMIN always passes. */
@Injectable()
export class PlanGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<Plan>(PLAN_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required || required === Plan.FREE) return true;

    const { user } = context.switchToHttp().getRequest();
    if (user?.role === 'ADMIN') return true;
    if (user?.plan !== Plan.PREMIUM) {
      throw new ForbiddenException({
        message: 'This feature requires a PREMIUM plan',
        code: 'UPGRADE_REQUIRED',
      });
    }
    return true;
  }
}
