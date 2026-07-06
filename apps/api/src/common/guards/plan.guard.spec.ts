import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Plan } from '@careeros/shared';
import { PlanGuard } from './plan.guard';
import { computeJobReadinessScore } from '../../modules/career/job-readiness.util';

function ctx(user: { plan?: string; role?: string }): ExecutionContext {
  return {
    switchToHttp: () => ({ getRequest: () => ({ user }) }),
    getHandler: () => null,
    getClass: () => null,
  } as unknown as ExecutionContext;
}

describe('PlanGuard', () => {
  const make = (required: Plan | undefined) => {
    const reflector = { getAllAndOverride: () => required } as unknown as Reflector;
    return new PlanGuard(reflector);
  };

  // Gating behavior is only active when billing is enabled.
  beforeEach(() => {
    process.env.BILLING_ENABLED = 'true';
  });
  afterAll(() => {
    delete process.env.BILLING_ENABLED;
  });

  it('bypasses all gating when BILLING_ENABLED is false (free-first)', () => {
    process.env.BILLING_ENABLED = 'false';
    expect(make(Plan.PREMIUM).canActivate(ctx({ plan: 'FREE', role: 'STUDENT' }))).toBe(true);
  });

  it('allows when no plan is required', () => {
    expect(make(undefined).canActivate(ctx({ plan: 'FREE' }))).toBe(true);
  });

  it('blocks FREE users from PREMIUM routes', () => {
    expect(() => make(Plan.PREMIUM).canActivate(ctx({ plan: 'FREE', role: 'STUDENT' }))).toThrow(
      ForbiddenException,
    );
  });

  it('allows PREMIUM users', () => {
    expect(make(Plan.PREMIUM).canActivate(ctx({ plan: 'PREMIUM', role: 'STUDENT' }))).toBe(true);
  });

  it('always allows ADMIN', () => {
    expect(make(Plan.PREMIUM).canActivate(ctx({ plan: 'FREE', role: 'ADMIN' }))).toBe(true);
  });
});

describe('job readiness scoring', () => {
  it('weights components correctly', () => {
    expect(
      computeJobReadinessScore({
        skillsCoverage: 100,
        roadmapProgress: 100,
        resumeScore: 100,
        interviewScore: 100,
      }),
    ).toBe(100);
  });

  it('returns 0 for an empty profile', () => {
    expect(
      computeJobReadinessScore({
        skillsCoverage: 0,
        roadmapProgress: 0,
        resumeScore: 0,
        interviewScore: 0,
      }),
    ).toBe(0);
  });

  it('applies the documented weights', () => {
    // 0.35*80 + 0.25*40 + 0.2*60 + 0.2*50 = 28 + 10 + 12 + 10 = 60
    expect(
      computeJobReadinessScore({
        skillsCoverage: 80,
        roadmapProgress: 40,
        resumeScore: 60,
        interviewScore: 50,
      }),
    ).toBe(60);
  });
});
