'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Award, BadgeCheck, BrainCircuit, Check, Crown, ExternalLink, GraduationCap, Loader2,
  Map, Mail, MessageSquare, Shield, Sparkles, Target, TrendingUp,
} from 'lucide-react';
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

  const { data: hub } = useQuery<ProfileOverview>({
    queryKey: ['profile-overview'],
    queryFn: async () => (await api.get('/profile/overview')).data,
  });

  const { data: subscription } = useQuery({
    queryKey: ['subscription'],
    queryFn: async () =>
      (await api.get('/subscription')).data as { plan: string; checkoutEnabled?: boolean; billingEnabled?: boolean },
  });
  const checkoutEnabled = Boolean(subscription?.checkoutEnabled);

  /** Refresh the JWT so it carries the updated plan (used by PlanGuard). */
  async function syncPlanFromServer(fallbackPlan?: string) {
    if (refreshToken) {
      const { data } = await api.post('/auth/refresh', { refreshToken });
      setTokens(data.tokens.accessToken, data.tokens.refreshToken);
      setUser({ plan: data.user.plan });
    } else if (fallbackPlan) {
      setUser({ plan: fallbackPlan as any });
    }
  }

  // Handle the return from Stripe Checkout: /profile?upgrade=success&session_id=...
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const upgrade = params.get('upgrade');
    if (!upgrade) return;
    const sessionId = params.get('session_id');
    const clean = () => window.history.replaceState({}, '', '/profile');
    if (upgrade === 'success' && sessionId) {
      (async () => {
        try {
          await api.post('/subscription/confirm', { sessionId });
          await syncPlanFromServer('PREMIUM');
          toast.success(t.pages.profile.successPremium);
        } catch (err) {
          toast.error(apiError(err, t.pages.profile.errorChangePlan));
        } finally {
          clean();
        }
      })();
    } else {
      clean();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function changePlan(plan: string) {
    if (plan === user?.plan) return;
    setLoading(plan);
    try {
      // Paid upgrade → hosted Stripe Checkout (redirects away and returns above).
      if (plan === 'PREMIUM' && checkoutEnabled) {
        const { data } = await api.post('/subscription/checkout', {});
        if (data?.url) {
          window.location.href = data.url;
          return;
        }
      }
      await api.post('/subscription/change', { plan });
      await syncPlanFromServer(plan);
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
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-display text-xl font-bold">{user?.name}</h2>
            {hub?.user?.emailVerified && (
              <span className="chip border-success/30 bg-success/10 text-success">
                <BadgeCheck className="h-3 w-3" /> {t.pages.profile.verified}
              </span>
            )}
            {hub?.user?.provider === 'google' && (
              <span className="chip border-border">Google</span>
            )}
          </div>
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

      {hub && <ProfileHub hub={hub} />}

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

interface ProfileOverview {
  user: { provider: string; emailVerified: boolean; avatarUrl: string | null } | null;
  careerProfile: { interests: string[]; experienceLevel: string } | null;
  psychResult: { profileCode: string; takenAt: string } | null;
  roadmaps: { id: string; targetRole: string; completion: number; status: string }[];
  activeRoadmap: { id: string; targetRole: string; completion: number } | null;
  certificates: { serial: string; role: string; score: number; issuedAt: string; roadmapId: string; verifyToken: string }[];
  recentActivity: { type: string; createdAt: string }[];
  stats: { roadmaps: number; certificates: number; completedNodes: number; chatSessions: number; assessmentsPassed: number };
}

/** F5: aggregated hub — stats, roadmaps, certificates, psych result, activity. */
function ProfileHub({ hub }: { hub: ProfileOverview }) {
  const { t } = useI18n();
  const tr = t.pages.profile;

  const stats = [
    { icon: Map, label: tr.statRoadmaps, value: hub.stats.roadmaps },
    { icon: Check, label: tr.statNodes, value: hub.stats.completedNodes },
    { icon: Award, label: tr.statCertificates, value: hub.stats.certificates },
    { icon: MessageSquare, label: tr.statChats, value: hub.stats.chatSessions },
  ];

  return (
    <div className="space-y-6">
      {/* stat grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="card flex flex-col items-center p-4 text-center"
          >
            <s.icon className="mb-1.5 h-5 w-5 text-primary" />
            <span className="font-display text-2xl font-bold tabular-nums">{s.value}</span>
            <span className="text-[11px] text-muted">{s.label}</span>
          </motion.div>
        ))}
      </div>

      {/* psych + active roadmap */}
      <div className="grid gap-4 md:grid-cols-2">
        {hub.psychResult && (
          <Link href="/psych-test" className="card group flex items-center gap-4 p-5 transition-all hover:border-primary/40">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
              <BrainCircuit className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{tr.psychResultTitle}</p>
              <p className="font-display text-2xl font-bold tracking-wide text-primary">{hub.psychResult.profileCode}</p>
            </div>
            <ExternalLink className="h-4 w-4 text-muted opacity-0 transition-opacity group-hover:opacity-100" />
          </Link>
        )}
        {hub.activeRoadmap && (
          <Link href="/roadmap" className="card group flex flex-col justify-center p-5 transition-all hover:border-primary/40">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">{tr.activeRoadmapTitle}</p>
              <span className="text-xs tabular-nums text-muted">{hub.activeRoadmap.completion}%</span>
            </div>
            <p className="mt-0.5 font-display font-semibold">{hub.activeRoadmap.targetRole}</p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-2">
              <div className="h-full rounded-full bg-primary" style={{ width: `${hub.activeRoadmap.completion}%` }} />
            </div>
          </Link>
        )}
      </div>

      {/* certificates */}
      {hub.certificates.length > 0 && (
        <div className="card p-6">
          <p className="mb-4 flex items-center gap-2 text-sm font-medium">
            <Award className="h-4 w-4 text-warning" /> {tr.certificatesTitle}
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {hub.certificates.map((c) => (
              <div key={c.serial} className="flex items-center justify-between rounded-xl border border-border bg-surface-2/40 p-3">
                <div className="min-w-0">
                  <p className="truncate font-medium">{c.role}</p>
                  <p className="font-mono text-[11px] text-muted">{c.serial} · {Math.round(c.score)}%</p>
                </div>
                <Link href={`/verify/${c.verifyToken}`} target="_blank" className="btn-ghost !px-2.5 !py-1.5 text-xs">
                  <BadgeCheck className="h-3.5 w-3.5" /> {tr.verifyLink}
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
