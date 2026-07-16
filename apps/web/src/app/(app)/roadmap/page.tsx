'use client';

import { useEffect, useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import {
  Plus, Sparkles, Flag, Check, Circle, CircleDot, GraduationCap, LibraryBig, Loader2, Map, Trophy, X,
} from 'lucide-react';
import { api, apiError } from '@/lib/api';
import { PageHeader } from '@/components/app/page-header';
import { EmptyState } from '@/components/ui/empty-state';
import { ProgressRing } from '@/components/ui/progress-ring';
import { CardSkeleton } from '@/components/ui/skeleton';
import { RoadmapPathView } from '@/components/three/roadmap-path-view';
import { GraphCanvas } from '@/components/roadmap/graph-canvas';
import { NodeDrawer, type DrawerNode } from '@/components/roadmap/node-drawer';
import { CatalogModal } from '@/components/roadmap/catalog-modal';
import { toast } from '@/components/ui/toast';
import { cn } from '@/lib/utils';
import { useI18n } from '@/lib/i18n';
import { MVP_MODE } from '@/lib/flags';

const ROLES = ['Frontend Developer', 'Backend Developer', 'Product Manager', 'UI/UX Designer', 'Data Analyst', 'QA Engineer', 'AI Engineer'];
const LEVELS = ['BEGINNER', 'JUNIOR', 'MID', 'SENIOR'];
const nextStatus: Record<string, string> = { NOT_STARTED: 'IN_PROGRESS', IN_PROGRESS: 'DONE', DONE: 'NOT_STARTED' };

export default function RoadmapPage() {
  const { t } = useI18n();
  const qc = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showGen, setShowGen] = useState(false);
  const [showCatalog, setShowCatalog] = useState(false);
  const [prefillRole, setPrefillRole] = useState<string | null>(null);

  const { data: roadmaps, isLoading } = useQuery({
    queryKey: ['roadmaps'],
    queryFn: async () => (await api.get('/roadmaps')).data,
  });

  const { data: skillGaps } = useQuery({
    queryKey: ['skill-gaps'],
    queryFn: async () => (await api.get('/career/skill-gaps')).data as string[],
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

  const skillMut = useMutation({
    mutationFn: async (v: { stageSkillId: string; status: string }) =>
      api.patch(`/roadmaps/${selected.id}/skills/${v.stageSkillId}/status`, { status: v.status }),
    onSuccess: refresh,
  });
  const taskMut = useMutation({
    mutationFn: async (taskId: string) => api.patch(`/roadmaps/${selected.id}/tasks/${taskId}/toggle`),
    onSuccess: refresh,
  });
  const stageMut = useMutation({
    mutationFn: async (v: { stageId: string; status: string }) =>
      api.patch(`/roadmaps/${selected.id}/stages/${v.stageId}/status`, { status: v.status }),
    onSuccess: () => { refresh(); toast.success(t.pages.roadmap.toastStageCompleted); },
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 lg:px-8">
        <PageHeader title={t.pages.roadmap.title} subtitle={t.pages.roadmap.loadingSubtitle} />
        <div className="grid gap-4 md:grid-cols-2"><CardSkeleton /><CardSkeleton /></div>
      </div>
    );
  }

  const hasGraph = Boolean(selected?.useGraph && selected?.nodes?.length);

  return (
    <div className={cn('mx-auto px-4 py-8 lg:px-8', hasGraph ? 'max-w-7xl' : 'max-w-6xl')}>
      <PageHeader
        title={t.pages.roadmap.title}
        subtitle={t.pages.roadmap.subtitle}
        action={
          <div className="flex gap-2">
            <button className="btn-ghost" onClick={() => setShowCatalog(true)}>
              <LibraryBig className="h-4 w-4" /> {t.pages.roadmap.catalogButton}
            </button>
            <button className="btn-primary" onClick={() => setShowGen(true)}>
              <Plus className="h-4 w-4" />{' '}
              {MVP_MODE ? t.pages.roadmap.regenerateRoadmap : t.pages.roadmap.newRoadmap}
            </button>
          </div>
        }
      />

      {!roadmaps?.length ? (
        <EmptyState
          icon={Map}
          title={t.pages.roadmap.emptyTitle}
          body={t.pages.roadmap.emptyBody}
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <button className="btn-primary" onClick={() => setShowGen(true)}>
                <Sparkles className="h-4 w-4" /> {t.pages.roadmap.generateRoadmap}
              </button>
              <button className="btn-ghost" onClick={() => setShowCatalog(true)}>
                <LibraryBig className="h-4 w-4" /> {t.pages.roadmap.catalogButton}
              </button>
            </div>
          }
        />
      ) : (
        <>
          {/* roadmap switcher (hidden in MVP — one active roadmap per user) */}
          {!MVP_MODE && roadmaps.length > 1 && (
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

          {hasGraph ? (
            <GraphSection roadmap={selected} onChanged={refresh} />
          ) : (
            <LegacySection
              selected={selected}
              skillGaps={skillGaps}
              onSkill={(v) => skillMut.mutate(v)}
              onTask={(id) => taskMut.mutate(id)}
              onStage={(v) => stageMut.mutate(v)}
            />
          )}
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
        {showCatalog && (
          <CatalogModal
            onClose={() => setShowCatalog(false)}
            onSelected={(id) => { setSelectedId(id); refresh(); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------- F4: graph view ------------------------- */

function GraphSection({ roadmap, onChanged }: { roadmap: any; onChanged: () => void }) {
  const { t } = useI18n();
  const tr = t.pages.roadmap;
  const [nodeId, setNodeId] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const node: DrawerNode | null = useMemo(
    () => roadmap.nodes.find((n: any) => n.id === nodeId) ?? null,
    [roadmap.nodes, nodeId],
  );

  async function setStatus(status: DrawerNode['status']) {
    if (!node) return;
    setPending(true);
    try {
      const { data } = await api.patch(`/roadmaps/${roadmap.id}/nodes/${node.id}/status`, { status });
      onChanged();
      if (data.completion === 100) toast.success(tr.toastStageCompleted);
    } catch (err) {
      toast.error(apiError(err));
    } finally {
      setPending(false);
    }
  }

  const done = roadmap.nodes.filter((n: any) => n.type !== 'OPTIONAL' && n.status === 'DONE').length;
  const total = roadmap.nodes.filter((n: any) => n.type !== 'OPTIONAL' && n.status !== 'SKIPPED').length;

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
              <span>{done}/{total}</span>
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
          <div className="hidden items-center gap-3 text-[11px] text-muted md:flex">
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-0.5 w-5 bg-[rgb(var(--muted)/0.45)]" /> {tr.legendRequired}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-0.5 w-5 border-t-2 border-dashed border-[rgb(var(--muted)/0.6)]" /> {tr.legendOptional}
            </span>
          </div>
          <Link href={`/assessment/${roadmap.id}`} className="btn-primary !py-2 text-sm">
            <GraduationCap className="h-4 w-4" /> {tr.finalAssessment}
          </Link>
        </div>
      </div>

      {/* canvas */}
      <div className="card relative h-[68vh] min-h-[480px] overflow-hidden p-0">
        <GraphCanvas
          nodes={roadmap.nodes}
          edges={roadmap.edges ?? []}
          selectedNodeId={nodeId}
          onNodeClick={setNodeId}
        />
        <p className="pointer-events-none absolute left-4 top-3 z-10 text-[11px] text-muted">
          {tr.graphHint}
        </p>
      </div>

      <AnimatePresence>
        {node && (
          <NodeDrawer
            node={node}
            pending={pending}
            onClose={() => setNodeId(null)}
            onStatusChange={setStatus}
          />
        )}
      </AnimatePresence>
    </>
  );
}

/* ---------------------- legacy stage view (kept) ------------------- */

function LegacySection({
  selected, skillGaps, onSkill, onTask, onStage,
}: {
  selected: any;
  skillGaps?: string[];
  onSkill: (v: { stageSkillId: string; status: string }) => void;
  onTask: (id: string) => void;
  onStage: (v: { stageId: string; status: string }) => void;
}) {
  const { t } = useI18n();
  return (
    <>
      {/* overview + 3D path */}
      <div className="mb-6 grid gap-5 lg:grid-cols-[1fr_320px]">
        <div className="card relative overflow-hidden p-2">
          <div className="absolute left-4 top-4 z-10">
            <p className="font-display text-lg font-semibold">{selected.targetRole}</p>
            <p className="text-xs text-muted">{selected.level} · {selected.weeklyHours}{t.pages.roadmap.hoursPerWeek} · ~{selected.estimatedWeeks} {t.pages.roadmap.weeksApprox}</p>
          </div>
          <div className="h-[280px] w-full">
            <RoadmapPathView
              nodes={selected.stages.map((s: any) => ({ title: s.title, status: s.status, milestone: s.milestone, completion: s.completion }))}
            />
          </div>
        </div>
        <div className="card flex flex-col items-center justify-center gap-3 p-6">
          <ProgressRing value={selected.completion} sublabel={t.pages.roadmap.complete} />
          <p className="text-center text-sm text-muted">
            {selected.stages.filter((s: any) => s.status === 'DONE').length} {t.pages.roadmap.of} {selected.stages.length} {t.pages.roadmap.stagesDone}
          </p>
        </div>
      </div>

      {/* skill gaps */}
      {skillGaps && skillGaps.length > 0 && (
        <div className="card mb-6 p-5">
          <p className="mb-3 text-sm font-medium">{t.pages.roadmap.skillGapsTitle}</p>
          <div className="flex flex-wrap gap-2">
            {skillGaps.map((g) => (
              <span key={g} className="chip border-warning/30 bg-warning/10 text-warning">{g}</span>
            ))}
          </div>
        </div>
      )}

      {/* stages */}
      <div className="space-y-4">
        {selected.stages.map((stage: any, i: number) => (
          <motion.div
            key={stage.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="card p-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className={cn(
                  'mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl text-sm font-semibold',
                  stage.status === 'DONE' ? 'bg-success/15 text-success' : 'bg-surface-2 text-muted',
                )}>
                  {stage.status === 'DONE' ? <Check className="h-4 w-4" /> : i + 1}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display font-semibold">{stage.title}</h3>
                    {stage.milestone && (
                      <span className="chip border-warning/30 bg-warning/10 text-warning"><Flag className="h-3 w-3" /> {t.pages.roadmap.milestone}</span>
                    )}
                  </div>
                  <p className="mt-0.5 text-sm text-muted">{stage.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-muted">{stage.completion}%</span>
                {stage.status !== 'DONE' && (
                  <button
                    className="btn-ghost !px-3 !py-1.5 text-xs"
                    onClick={() => onStage({ stageId: stage.id, status: 'DONE' })}
                  >
                    <Trophy className="h-3.5 w-3.5" /> {t.pages.roadmap.completeButton}
                  </button>
                )}
              </div>
            </div>

            {/* skills */}
            {stage.skills?.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {stage.skills.map((sk: any) => (
                  <button
                    key={sk.id}
                    onClick={() => onSkill({ stageSkillId: sk.id, status: nextStatus[sk.status] })}
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-all',
                      sk.status === 'DONE' && 'border-success/30 bg-success/10 text-success',
                      sk.status === 'IN_PROGRESS' && 'border-primary/30 bg-primary/10 text-primary',
                      sk.status === 'NOT_STARTED' && 'border-border bg-surface-2 text-muted hover:text-fg',
                    )}
                  >
                    {sk.status === 'DONE' ? <Check className="h-3 w-3" /> : sk.status === 'IN_PROGRESS' ? <CircleDot className="h-3 w-3" /> : <Circle className="h-3 w-3" />}
                    {sk.name}
                  </button>
                ))}
              </div>
            )}

            {/* tasks */}
            {stage.tasks?.length > 0 && (
              <div className="mt-4 space-y-2 border-t border-border/60 pt-4">
                {stage.tasks.map((task: any) => (
                  <label key={task.id} className="flex cursor-pointer items-start gap-3 text-sm">
                    <button
                      type="button"
                      onClick={() => onTask(task.id)}
                      className={cn(
                        'mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border transition-colors',
                        task.completed ? 'border-success bg-success text-white' : 'border-border hover:border-primary',
                      )}
                    >
                      {task.completed && <Check className="h-3 w-3" />}
                    </button>
                    <div>
                      <span className={cn(task.completed && 'text-muted line-through')}>{task.title}</span>
                      {task.description && <p className="text-xs text-muted">{task.description}</p>}
                    </div>
                  </label>
                ))}
              </div>
            )}

            {/* resources */}
            {stage.resources?.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {stage.resources.map((r: any) => (
                  <a key={r.id} href={r.url} target="_blank" rel="noreferrer" className="chip hover:border-primary/40 hover:text-fg">
                    {r.provider} · {r.title}
                  </a>
                ))}
              </div>
            )}
          </motion.div>
        ))}
      </div>
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
