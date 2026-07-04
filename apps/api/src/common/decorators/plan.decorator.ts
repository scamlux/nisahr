import { SetMetadata } from '@nestjs/common';
import { Plan } from '@careeros/shared';

export const PLAN_KEY = 'plan';
/** Mark a route as requiring a minimum plan (e.g. PREMIUM). */
export const RequirePlan = (plan: Plan) => SetMetadata(PLAN_KEY, plan);
