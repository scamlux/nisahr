import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { Plan } from '@careeros/shared';
import { PrismaService } from '../../prisma/prisma.service';
import { createPremiumCheckout, retrieveCheckoutSession, stripeConfigured } from '../../config/stripe';

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

  /** Persist the plan on both the subscription and the user in one transaction. */
  private async applyPlan(userId: string, plan: Plan) {
    const status = plan === Plan.FREE ? 'CANCELED' : 'ACTIVE';
    const [subscription] = await this.prisma.$transaction([
      this.prisma.subscription.upsert({
        where: { userId },
        update: { plan, status },
        create: { userId, plan, status },
      }),
      this.prisma.user.update({ where: { id: userId }, data: { plan } }),
    ]);
    return subscription;
  }

  /**
   * Change the plan directly.
   * - With Stripe configured, upgrades to PREMIUM must go through paid checkout,
   *   so a direct upgrade is refused (prevents a free-upgrade bypass). Downgrades
   *   to FREE are always allowed (self-service cancel).
   * - Without Stripe (zero-key/demo), this flips the plan for free as before.
   */
  async changePlan(userId: string, plan: Plan) {
    if (stripeConfigured() && plan === Plan.PREMIUM) {
      throw new ForbiddenException({
        message: 'Upgrading to PREMIUM requires checkout',
        code: 'CHECKOUT_REQUIRED',
      });
    }
    return this.applyPlan(userId, plan);
  }

  /** Start a Stripe Checkout for a PREMIUM upgrade; returns the redirect URL. */
  async createCheckout(userId: string): Promise<{ url: string }> {
    if (!stripeConfigured()) {
      throw new BadRequestException('Billing is not configured');
    }
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new BadRequestException('User not found');
    if (user.plan === Plan.PREMIUM) {
      throw new BadRequestException('You are already on the PREMIUM plan');
    }
    const session = await createPremiumCheckout(userId, user.email);
    if (!session.url) throw new BadRequestException('Failed to create checkout session');
    return { url: session.url };
  }

  /**
   * Confirm a completed Checkout Session on the return redirect and activate the
   * plan. Server-side verification against Stripe — cannot be spoofed by the
   * client because the session is fetched with our secret key.
   */
  async confirmCheckout(userId: string, sessionId: string) {
    if (!stripeConfigured()) throw new BadRequestException('Billing is not configured');
    const session = await retrieveCheckoutSession(sessionId);

    if (session.client_reference_id !== userId) {
      throw new ForbiddenException('This checkout session does not belong to you');
    }
    const paid = session.status === 'complete' || session.payment_status === 'paid';
    if (!paid) throw new BadRequestException('Payment is not complete');

    const plan = (session.metadata?.plan as Plan) ?? Plan.PREMIUM;
    return this.applyPlan(userId, plan);
  }
}
