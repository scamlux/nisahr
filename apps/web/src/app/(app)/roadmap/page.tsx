'use client';

import { useEffect, useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { Plus, Sparkles, GraduationCap, Loader2, Map, X } from 'lucide-react';
import { api, apiError } from '@/lib/api';
import { PageHeader } from '@/components/app/page-header';
import { EmptyState } from '@/components/ui/empty-state';
import { CardSkeleton } from '@/components/ui/skeleton';
import { GraphCanvas } from '@/components/roadmap/graph-canvas';
import { StageDrawer, type DrawerStage } from '@/components/roadmap/stage-drawer';
import { stagesToGraph } from '@/components/roadmap/stages-graph';
import { toast } from '@/components/ui/toast';
import { cn } from '@/lib/utils';
import { useI18n } from '@/lib/i18n';

const ROLES = ['Frontend Developer', 'Backend Developer', 'Product Manager', 'UI/UX Designer', 'Data Analyst', 'QA Engineer', 'AI Engineer'];
const LEVELS = ['BEGINNER', 'JUNIOR', 'MID', 'SENIOR'];

export default function RoadmapPage() {
  const { t } = useI18n();
  const qc = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showGen, setShowGen] = useState(false);
  const [prefillRole, setPrefillRole] = useState<string | null>(null);

  const { data: roadmaps, isLoading } = useQuery({
    queryKey: ['roadmaps'],
    queryFn: async () => (await api.get('/roadmaps')).data,
  });

  // Deep link from the psych test: /roadmap?role=Frontend%20Developer
  useEffect(() => {
    const role = new URLSearchParams(window.location.search).get('role');
    if (role) {
      setPrefillRole(role);
      setShowGen(true);
    }
  }, []);

  useEffect(() => {
    if (roadmaps?.length && !selectedId) {
      const active = roadmaps.find((r: any) => r.status === 'ACTIVE') ?? roadmaps[0];
      setSelectedId(active.id);
    }
  }, [roadmaps, selectedId]);

  const selected = useMemo(
    () => roadmaps?.find((r: any) => r.id === selectedId) ?? roadmaps?.[0],
    [roadmaps, selectedId],
  );

  const refresh = () => qc.invalidateQueries({ queryKey: ['roadmaps'] });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 lg:px-8">
        <PageHeader title={t.pages.roadmap.title} subtitle={t.pages.roadmap.loadingSubtitle} />
        <div className="grid gap-4 md:grid-cols-2"><CardSkeleton /><CardSkeleton /></div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      <PageHeader
        title={t.pages.roadmap.title}
        subtitle={t.pages.roadmap.subtitle}
        action={
          <button className="btn-primary" onClick={() => setShowGen(true)}>
            <Plus className="h-4 w-4" /> {t.pages.roadmap.newRoadmap}
          </button>
        }
      />

      {!roadmaps?.length ? (
        <EmptyState
          icon={Map}
          title={t.pages.roadmap.emptyTitle}
          body={t.pages.roadmap.emptyBody}
          action={
            <button className="btn-primary" onClick={() => setShowGen(true)}>
              <Sparkles className="h-4 w-4" /> {t.pages.roadmap.generateRoadmap}
            </button>
          }
        />
      ) : (
        <>
          {/* roadmap switcher (only when the user has more than one) */}
          {roadmaps.length > 1 && (
            <div className="mb-5 flex flex-wrap gap-2">
              {roadmaps.map((r: any) => (
                <button
                  key={r.id}
                  onClick={() => setSelectedId(r.id)}
                  className={cn('chip cursor-pointer', r.id === selected.id && 'border-primary/40 bg-primary/10 text-primary')}
                >
                  {r.status === 'ACTIVE' && <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-success" />}
                  {r.targetRole} · {r.completion}%
                </button>
              ))}
            </div>
          )}

          <GraphSection roadmap={selected} onChanged={refresh} />
        </>
      )}

      <AnimatePresence>
        {showGen && (
          <GenerateModal
            initialRole={prefillRole}
            onClose={() => { setShowGen(false); setPrefillRole(null); }}
            onDone={(id) => { setSelectedId(id); refresh(); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------------------- single graph engine (from stages) ---------------------- */

function GraphSection({ roadmap, onChanged }: { roadmap: any; onChanged: () => void }) {
  const { t } = useI18n();
  const tr = t.pages.roadmap;
  const [stageId, setStageId] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const { nodes, edges } = useMemo(() => stagesToGraph(roadmap.stages ?? []), [roadmap.stages]);

  const stage: DrawerStage | null = useMemo(
    () => roadmap.stages?.find((s: any) => s.id === stageId) ?? null,
    [roadmap.stages, stageId],
  );

  const stagesDone = (roadmap.stages ?? []).filter((s: any) => s.status === 'DONE').length;
  const stagesTotal = (roadmap.stages ?? []).length;

  async function mutate(fn: () => Promise<{ data: any }>, done?: (data: any) => void) {
    setPending(true);
    try {
      const { data } = await fn();
      onChanged();
      done?.(data);
    } catch (err) {
      toast.error(apiError(err));
    } finally {
      setPending(false);
    }
  }

  const setStageStatus = (status: string) =>
    mutate(
      () => api.patch(`/roadmaps/${roadmap.id}/stages/${stageId}/status`, { status }),
      (data) => { if (data?.completion === 100) toast.success(tr.toastStageCompleted); },
    );
  const toggleSkill = (skillId: string, status: string) =>
    mutate(() => api.patch(`/roadmaps/${roadmap.id}/skills/${skillId}/status`, { status }));
  const toggleTask = (taskId: string) =>
    mutate(() => api.patch(`/roadmaps/${roadmap.id}/tasks/${taskId}/toggle`));

  return (
    <>
      {/* header strip */}
      <div className="card mb-4 flex flex-wrap items-center gap-x-6 gap-y-3 p-4">
        <div className="min-w-0">
          <p className="truncate font-display text-lg font-semibold">{roadmap.targetRole}</p>
          <p className="text-xs text-muted">
            {roadmap.level} · {roadmap.weeklyHours}{tr.hoursPerWeek} · ~{roadmap.estimatedWeeks} {tr.weeksApprox}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-4">
          <div className="hidden w-44 sm:block">
            <div className="mb-1 flex justify-between text-[11px] text-muted">
              <span className="tabular-nums">{stagesDone}/{stagesTotal}</span>
              <span className="tabular-nums">{roadmap.completion}% {tr.complete}</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                animate={{ width: `${roadmap.completion}%` }}
                transition={{ type: 'spring', stiffness: 100, damping: 22 }}
              />
            </div>
          </div>
          <Link href={`/assessment/${roadmap.id}`} className="btn-primary !py-2 text-sm">
            <GraduationCap className="h-4 w-4" /> {tr.finalAssessment}
          </Link>
        </div>
      </div>

      {/* canvas */}
      <div className="card relative h-[68vh] min-h-[480px] overflow-hidden p-0">
        <GraphCanvas
          nodes={nodes}
          edges={edges}
          selectedNodeId={stageId}
          onNodeClick={setStageId}
        />
        <p className="pointer-events-none absolute left-4 top-3 z-10 text-[11px] text-muted">
          {tr.graphHint}
        </p>
      </div>

      <AnimatePresence>
        {stage && (
          <StageDrawer
            stage={stage}
            pending={pending}
            onClose={() => setStageId(null)}
            onStatusChange={setStageStatus}
            onSkillToggle={toggleSkill}
            onTaskToggle={toggleTask}
          />
        )}
      </AnimatePresence>
    </>
  );
}

function GenerateModal({ initialRole, onClose, onDone }: { initialRole?: string | null; onClose: () => void; onDone: (id: string) => void }) {
  const { t } = useI18n();
  const [targetRole, setTargetRole] = useState(
    initialRole && ROLES.includes(initialRole) ? initialRole : initialRole || 'Frontend Developer',
  );
  const [level, setLevel] = useState('BEGINNER');
  const [weeklyHours, setWeeklyHours] = useState(10);
  const [loading, setLoading] = useState(false);

  const roleOptions = initialRole && !ROLES.includes(initialRole) ? [initialRole, ...ROLES] : ROLES;

  const LEVEL_LABELS: Record<string, string> = {
    BEGINNER: t.pages.roadmap.levelBeginner,
    JUNIOR: t.pages.roadmap.levelJunior,
    MID: t.pages.roadmap.levelMid,
    SENIOR: t.pages.roadmap.levelSenior,
  };

  async function generate() {
    setLoading(true);
    try {
      const { data } = await api.post('/roadmaps/generate', { targetRole, level, weeklyHours });
      toast.success(t.pages.roadmap.toastRoadmapGenerated);
      onDone(data.id);
      onClose();
    } catch (err) {
      toast.error(apiError(err, t.pages.roadmap.toastGenerateError));
    } finally {
      setLoading(false);
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
        className="glass w-full max-w-md rounded-3xl p-7"
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-xl font-bold">{t.pages.roadmap.generateModalTitle}</h2>
          <button onClick={onClose} className="text-muted hover:text-fg"><X className="h-5 w-5" /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium">{t.pages.roadmap.targetRoleLabel}</label>
            <select className="input" value={targetRole} onChange={(e) => setTargetRole(e.target.value)}>
              {roleOptions.map((r) => <option key={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">{t.pages.roadmap.yourLevelLabel}</label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {LEVELS.map((l) => (
                <button key={l} onClick={() => setLevel(l)} className={cn('rounded-lg border py-2 text-xs font-medium transition-all', level === l ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted')}>
                  {LEVEL_LABELS[l]}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-1.5 flex justify-between text-sm font-medium">
              {t.pages.roadmap.weeklyHoursLabel} <span className="text-primary">{weeklyHours}{t.pages.roadmap.hoursUnit}</span>
            </label>
            <input type="range" min={1} max={40} value={weeklyHours} onChange={(e) => setWeeklyHours(+e.target.value)} className="w-full accent-[rgb(var(--primary))]" />
          </div>
          <button className="btn-primary w-full py-3" onClick={generate} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Sparkles className="h-4 w-4" /> {t.pages.roadmap.generateButton}</>}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
