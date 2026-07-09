'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Award, BadgeCheck, BrainCircuit, Check, Crown, ExternalLink, GraduationCap, Loader2,
  Map, Mail, MessageSquare, Pencil, Shield, Sparkles, Target, LogOut, X,
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
  const router = useRouter();
  const qc = useQueryClient();
  const { user, setUser, setTokens, refreshToken, logout } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);

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
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card mb-6 p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-accent text-xl font-bold text-primary-fg">
            {user?.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.avatarUrl} alt={user.name} className="h-full w-full object-cover" />
            ) : (
              user ? initials(user.name) : '?'
            )}
          </div>
          <div className="min-w-0 flex-1">
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
            <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-sm text-muted">
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
            {hub?.careerProfile?.bio && (
              <p className="mt-2 whitespace-pre-line text-sm text-fg/90">{hub.careerProfile.bio}</p>
            )}
            {hub?.careerProfile?.interests && hub.careerProfile.interests.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {hub.careerProfile.interests.map((it) => (
                  <span key={it} className="chip border-primary/20 bg-primary/5 text-primary">{it}</span>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2 border-t border-border/60 pt-4">
          <button className="btn-ghost !py-2 text-sm" onClick={() => setEditing(true)}>
            <Pencil className="h-4 w-4" /> {t.pages.profile.editProfile}
          </button>
          <button
            className="btn-ghost !py-2 text-sm text-muted hover:text-danger"
            onClick={() => { logout(); router.push('/login'); }}
          >
            <LogOut className="h-4 w-4" /> {t.pages.profile.signOut}
          </button>
        </div>
      </motion.div>

      <AnimatePresence>
        {editing && (
          <EditProfileModal
            initial={{
              name: user?.name ?? '',
              avatarUrl: user?.avatarUrl ?? '',
              bio: hub?.careerProfile?.bio ?? '',
              interests: hub?.careerProfile?.interests ?? [],
            }}
            onClose={() => setEditing(false)}
            onSaved={(u) => {
              setUser({ name: u.user.name, avatarUrl: u.user.avatarUrl });
              qc.invalidateQueries({ queryKey: ['profile-overview'] });
              setEditing(false);
              toast.success(t.pages.profile.profileSaved);
            }}
          />
        )}
      </AnimatePresence>

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
  careerProfile: { interests: string[]; experienceLevel: string; bio?: string } | null;
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

/** F5: edit identity + mini-resume (name, avatar, bio, interests). */
function EditProfileModal({
  initial, onClose, onSaved,
}: {
  initial: { name: string; avatarUrl: string; bio: string; interests: string[] };
  onClose: () => void;
  onSaved: (data: { user: { name: string; avatarUrl: string | null } }) => void;
}) {
  const { t } = useI18n();
  const tr = t.pages.profile;
  const [name, setName] = useState(initial.name);
  const [avatarUrl, setAvatarUrl] = useState(initial.avatarUrl);
  const [bio, setBio] = useState(initial.bio);
  const [interests, setInterests] = useState(initial.interests.join(', '));
  const [saving, setSaving] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.patch('/profile', {
        name: name.trim(),
        avatarUrl: avatarUrl.trim(),
        bio,
        interests: interests.split(',').map((s) => s.trim()).filter(Boolean),
      });
      onSaved(data);
    } catch (err) {
      toast.error(apiError(err, tr.profileSaveError));
    } finally {
      setSaving(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[80] grid place-items-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="glass max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl p-6"
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-xl font-bold">{tr.editProfile}</h2>
          <button type="button" onClick={onClose} className="text-muted hover:text-fg"><X className="h-5 w-5" /></button>
        </div>

        {/* live avatar preview */}
        <div className="mb-5 flex items-center gap-3">
          <div className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-accent text-lg font-bold text-primary-fg">
            {avatarUrl.trim()
              // eslint-disable-next-line @next/next/no-img-element
              ? <img src={avatarUrl} alt="" className="h-full w-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              : (name ? initials(name) : '?')}
          </div>
          <p className="text-xs text-muted">{tr.avatarHint}</p>
        </div>

        <form onSubmit={save} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium">{tr.fieldName}</label>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} minLength={2} required />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">{tr.fieldAvatar}</label>
            <input className="input" type="url" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} placeholder="https://…" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">{tr.fieldBio}</label>
            <textarea className="input min-h-[96px] resize-y" value={bio} onChange={(e) => setBio(e.target.value)} maxLength={2000} placeholder={tr.bioPlaceholder} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">{tr.fieldInterests}</label>
            <input className="input" value={interests} onChange={(e) => setInterests(e.target.value)} placeholder={tr.interestsPlaceholder} />
          </div>
          <div className="flex gap-2 pt-1">
            <button type="button" className="btn-ghost flex-1 py-3" onClick={onClose}>{tr.cancel}</button>
            <button className="btn-primary flex-1 py-3" disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : tr.save}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
