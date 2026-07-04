import { Injectable } from '@nestjs/common';
import { Plan } from '@careeros/shared';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SubscriptionService {
  constructor(private readonly prisma: PrismaService) {}

  async get(userId: string) {
    return this.prisma.subscription.upsert({
      where: { userId },
      update: {},
      create: { userId },
    });
  }

  /** Mock billing — flips the plan with no real payment provider. */
  async changePlan(userId: string, plan: Plan) {
    const [subscription] = await this.prisma.$transaction([
      this.prisma.subscription.upsert({
        where: { userId },
        update: { plan, status: 'ACTIVE' },
        create: { userId, plan, status: 'ACTIVE' },
      }),
      this.prisma.user.update({ where: { id: userId }, data: { plan } }),
    ]);
    return subscription;
  }
}
