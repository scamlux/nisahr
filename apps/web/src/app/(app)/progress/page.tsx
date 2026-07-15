'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Area, AreaChart, Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { Flame, Clock, GraduationCap, Award, Sparkles, TrendingUp, Brain } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/store';
import { BILLING_ENABLED } from '@/lib/billing';
import { useI18n } from '@/lib/i18n';
import { PageHeader } from '@/components/app/page-header';
import { ProgressRing } from '@/components/ui/progress-ring';
import { AnimatedNumber } from '@/components/ui/animated-number';
import { CardSkeleton } from '@/components/ui/skeleton';
import { PremiumGate } from '@/components/app/premium-gate';
import type { ProgressDashboard } from '@careeros/shared';

function ChartTooltip({ active, payload, label, unit = 'h' }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass rounded-lg px-3 py-2 text-xs">
      <p className="text-muted">{label}</p>
      <p className="font-semibold text-fg">{payload[0].value}{unit}</p>
    </div>
  );
}

export default function ProgressPage() {
  const { t } = useI18n();
  const user = useAuth((s) => s.user);
  const isPremium = !BILLING_ENABLED || user?.plan === 'PREMIUM';

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => (await api.get('/progress/dashboard')).data as ProgressDashboard,
  });

  const { data: insights } = useQuery({
    queryKey: ['insights'],
    queryFn: async () => (await api.get('/progress/insights')).data,
    enabled: isPremium,
  });

  if (isLoading || !data) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 lg:px-8">
        <PageHeader title={t.pages.progress.loadingTitle} subtitle={t.pages.progress.loadingSubtitle} />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><CardSkeleton /><CardSkeleton /><CardSkeleton /><CardSkeleton /></div>
      </div>
    );
  }

  const kpis = [
    { icon: Flame, label: t.pages.progress.kpiStreak, value: data.streakDays, color: 'text-warning', suffix: '' },
    { icon: Clock, label: t.pages.progress.kpiWeeklyHours, value: data.weeklyHours, color: 'text-primary', suffix: t.pages.progress.hoursUnit, decimals: 1 },
    { icon: GraduationCap, label: t.pages.progress.kpiSkillsCompleted, value: data.completedSkills, color: 'text-accent', suffix: '' },
    { icon: Award, label: t.pages.progress.kpiCoursesDone, value: data.completedCourses, color: 'text-success', suffix: '' },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 lg:px-8">
      <PageHeader title={t.pages.progress.title} subtitle={t.pages.progress.subtitle} />

      {/* KPIs */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k, i) => (
          <motion.div key={k.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className="card p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted">{k.label}</span>
              <k.icon className={`h-5 w-5 ${k.color}`} />
            </div>
            <p className="mt-2 font-display text-3xl font-bold">
              <AnimatedNumber value={k.value} suffix={k.suffix} decimals={k.decimals ?? 0} />
            </p>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* weekly hours area chart */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card p-5 lg:col-span-2">
          <p className="mb-4 flex items-center gap-2 text-sm font-medium"><TrendingUp className="h-4 w-4 text-primary" /> {t.pages.progress.weeklyHoursChartTitle}</p>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={data.weeklySeries}>
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgb(var(--primary))" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="rgb(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="week" stroke="rgb(var(--muted))" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="rgb(var(--muted))" fontSize={12} tickLine={false} axisLine={false} width={28} />
              <Tooltip content={<ChartTooltip unit={t.pages.progress.hoursUnit} />} cursor={{ stroke: 'rgb(var(--border))' }} />
              <Area type="monotone" dataKey="hours" stroke="rgb(var(--primary))" strokeWidth={2.5} fill="url(#g1)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* roadmap completion ring */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card flex flex-col items-center justify-center gap-3 p-5">
          <p className="text-sm font-medium">{t.pages.progress.roadmapCompletionTitle}</p>
          <ProgressRing value={data.roadmapCompletion} sublabel={t.pages.progress.doneLabel} />
          <p className="text-center text-xs text-muted">{data.monthlyHours}{t.pages.progress.hoursUnit} {t.pages.progress.loggedLast30Days}</p>
        </motion.div>
      </div>

      {/* heatmap */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card mt-6 p-5">
        <p className="mb-4 text-sm font-medium">{t.pages.progress.weeklyActivityTitle}</p>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={data.skillHeatmap}>
            <defs>
              <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgb(var(--accent))" />
                <stop offset="100%" stopColor="rgb(var(--primary))" />
              </linearGradient>
            </defs>
            <XAxis dataKey="day" stroke="rgb(var(--muted))" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip content={<ChartTooltip unit={t.pages.progress.hoursUnit} />} cursor={{ fill: 'rgb(var(--surface-2))' }} />
            <Bar dataKey="hours" fill="url(#g2)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* AI insights */}
      <div className="mt-6">
        <p className="mb-3 flex items-center gap-2 text-sm font-medium"><Brain className="h-4 w-4 text-primary" /> {t.pages.progress.aiInsightsTitle}</p>
        {!isPremium ? (
          <PremiumGate feature={t.pages.progress.premiumGateFeature} />
        ) : insights ? (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="grid gap-4 md:grid-cols-2">
            <div className="card p-5">
              <p className="flex items-center gap-2 text-sm font-medium"><Sparkles className="h-4 w-4 text-accent" /> {t.pages.progress.weeklySummaryTitle}</p>
              <p className="mt-2 text-sm text-muted">{insights.weeklySummary}</p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs">
                <span className="chip">{t.pages.progress.paceLabel} {insights.pace}</span>
                <span className={`chip ${insights.motivationRisk === 'HIGH' ? 'border-danger/30 text-danger' : insights.motivationRisk === 'MEDIUM' ? 'border-warning/30 text-warning' : 'border-success/30 text-success'}`}>
                  {t.pages.progress.motivationRiskLabel} {insights.motivationRisk}
                </span>
              </div>
            </div>
            <div className="card p-5">
              <p className="text-sm font-medium">{t.pages.progress.growthZonesTitle}</p>
              <ul className="mt-3 space-y-2">
                {insights.growthZones.map((g: string) => (
                  <li key={g} className="flex items-center gap-2 text-sm text-muted">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" /> {g}
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-xs text-muted">{insights.productivity}</p>
            </div>
          </motion.div>
        ) : (
          <CardSkeleton />
        )}
      </div>
    </div>
  );
}
