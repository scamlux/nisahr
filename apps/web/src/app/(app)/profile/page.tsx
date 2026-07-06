'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Check, Crown, Loader2, Mail, Shield, Sparkles, Target } from 'lucide-react';
import { BILLING_ENABLED } from '@/lib/billing';
import { api, apiError } from '@/lib/api';
import { useAuth } from '@/lib/store';
import { PageHeader } from '@/components/app/page-header';
import { toast } from '@/components/ui/toast';
import { cn, initials } from '@/lib/utils';
import { useI18n } from '@/lib/i18n';

export default function ProfilePage() {
  const { t } = useI18n();
  const { user, setUser, setTokens, refreshToken } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);

  const PLANS = [
    { id: 'FREE', name: t.pages.profile.planFreeName, price: '$0', features: [t.pages.profile.freeFeatureChat, t.pages.profile.freeFeatureRoadmap, t.pages.profile.freeFeatureLearningHub, t.pages.profile.freeFeatureTracker] },
    { id: 'PREMIUM', name: t.pages.profile.planPremiumName, price: '$12', features: [t.pages.profile.premiumFeatureRoadmaps, t.pages.profile.premiumFeatureInterviews, t.pages.profile.premiumFeatureSkillAnalysis, t.pages.profile.premiumFeatureInsights, t.pages.profile.premiumFeatureResume, t.pages.profile.premiumFeatureCertificates] },
  ];

  const { data: recs } = useQuery({
    queryKey: ['recommendations'],
    queryFn: async () => (await api.get('/career/recommendations')).data,
  });

  async function changePlan(plan: string) {
    if (plan === user?.plan) return;
    setLoading(plan);
    try {
      await api.post('/subscription/change', { plan });
      // Refresh tokens so the JWT carries the new plan (used by PlanGuard).
      if (refreshToken) {
        const { data } = await api.post('/auth/refresh', { refreshToken });
        setTokens(data.tokens.accessToken, data.tokens.refreshToken);
        setUser({ plan: data.user.plan });
      } else {
        setUser({ plan: plan as any });
      }
      toast.success(plan === 'PREMIUM' ? t.pages.profile.successPremium : t.pages.profile.successFree);
    } catch (err) {
      toast.error(apiError(err, t.pages.profile.errorChangePlan));
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 lg:px-8">
      <PageHeader title={t.pages.profile.title} subtitle={t.pages.profile.subtitle} />

      {/* identity */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card mb-6 flex items-center gap-4 p-6">
        <div className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-primary to-accent text-xl font-bold text-primary-fg">
          {user ? initials(user.name) : '?'}
        </div>
        <div className="flex-1">
          <h2 className="font-display text-xl font-bold">{user?.name}</h2>
          <div className="mt-1 flex flex-wrap gap-3 text-sm text-muted">
            <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> {user?.email}</span>
            <span className="flex items-center gap-1.5"><Shield className="h-3.5 w-3.5" /> {user?.role}</span>
            <span className="flex items-center gap-1.5">
              {!BILLING_ENABLED
                ? <><Sparkles className="h-3.5 w-3.5 text-primary" /> {t.pages.profile.freeChip}</>
                : user?.plan === 'PREMIUM'
                  ? <><Crown className="h-3.5 w-3.5 text-warning" /> {t.pages.profile.premium}</>
                  : t.pages.profile.freePlan}
            </span>
          </div>
        </div>
      </motion.div>

      {/* free-first notice (billing disabled) */}
      {!BILLING_ENABLED && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="card relative mb-6 overflow-hidden p-7"
        >
          <div className="aurora-blob left-1/2 top-0 h-40 w-40 -translate-x-1/2 bg-primary/20" />
          <div className="relative flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="flex items-center gap-2 font-display text-2xl font-bold">
                <Sparkles className="h-5 w-5 text-primary" /> {t.pages.profile.freeTitle}
              </h3>
              <p className="mt-2 max-w-xl text-sm text-muted">{t.pages.profile.freeBody}</p>
            </div>
            <span className="chip border-success/30 bg-success/10 text-success">
              {t.pages.profile.freeChip}
            </span>
          </div>
        </motion.div>
      )}

      {/* pricing (kept behind the billing flag, not deleted) */}
      {BILLING_ENABLED && (
      <div className="mb-6 grid gap-5 md:grid-cols-2">
        {PLANS.map((plan) => {
          const current = user?.plan === plan.id;
          const premium = plan.id === 'PREMIUM';
          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn('card relative overflow-hidden p-7', premium && 'border-primary/40 shadow-glow')}
            >
              {premium && <div className="aurora-blob left-1/2 top-0 h-40 w-40 -translate-x-1/2 bg-primary/20" />}
              <div className="relative">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-2xl font-bold">{plan.name}</h3>
                  {current && <span className="chip border-success/30 bg-success/10 text-success">{t.pages.profile.current}</span>}
                </div>
                <div className="mt-2 flex items-end gap-1">
                  <span className="font-display text-4xl font-bold">{plan.price}</span>
                  <span className="mb-1 text-muted">{t.pages.profile.perMonth}</span>
                </div>
                <ul className="mt-5 space-y-2.5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 shrink-0 text-success" /> {f}
                    </li>
                  ))}
                </ul>
                <button
                  className={cn('mt-6 w-full py-3', premium ? 'btn-primary' : 'btn-ghost', current && 'opacity-50')}
                  disabled={current || loading !== null}
                  onClick={() => changePlan(plan.id)}
                >
                  {loading === plan.id ? <Loader2 className="h-4 w-4 animate-spin" /> : current ? t.pages.profile.activePlan : premium ? <><Crown className="h-4 w-4" /> {t.pages.profile.upgrade}</> : t.pages.profile.downgrade}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
      )}

      {/* recommendations */}
      {recs?.length > 0 && (
        <div className="card p-6">
          <p className="mb-4 flex items-center gap-2 text-sm font-medium"><Target className="h-4 w-4 text-primary" /> {t.pages.profile.recommendationsTitle}</p>
          <div className="space-y-2">
            {recs.map((r: any) => (
              <div key={r.id} className="flex items-center justify-between rounded-xl border border-border bg-surface-2/40 p-3">
                <div>
                  <p className="font-medium">{r.title}</p>
                  <p className="text-xs text-muted">{r.reason}</p>
                </div>
                <span className="chip border-primary/30 bg-primary/10 text-primary">{Math.round(r.score)}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
