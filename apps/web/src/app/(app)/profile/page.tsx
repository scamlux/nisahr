'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Award, BadgeCheck, BrainCircuit, Check, ExternalLink, Map, Mail,
  MessageSquare, Shield,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/store';
import { PageHeader } from '@/components/app/page-header';
import { initials } from '@/lib/utils';
import { useI18n } from '@/lib/i18n';

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

export default function ProfilePage() {
  const { t } = useI18n();
  const { user } = useAuth();

  const { data: hub } = useQuery<ProfileOverview>({
    queryKey: ['profile-overview'],
    queryFn: async () => (await api.get('/profile/overview')).data,
  });

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
            {hub?.user?.provider === 'google' && <span className="chip border-border">Google</span>}
          </div>
          <div className="mt-1 flex flex-wrap gap-3 text-sm text-muted">
            <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> {user?.email}</span>
            <span className="flex items-center gap-1.5"><Shield className="h-3.5 w-3.5" /> {user?.role}</span>
          </div>
        </div>
      </motion.div>

      {hub && <ProfileHub hub={hub} />}
    </div>
  );
}

/** F5: aggregated hub — stats, psych result, active roadmap, certificates. */
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

      {/* psych result + active roadmap */}
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
