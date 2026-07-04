'use client';

import { useEffect, useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Plus, Sparkles, Flag, Check, Circle, CircleDot, Loader2, Map, Trophy, X,
} from 'lucide-react';
import { api, apiError } from '@/lib/api';
import { PageHeader } from '@/components/app/page-header';
import { EmptyState } from '@/components/ui/empty-state';
import { ProgressRing } from '@/components/ui/progress-ring';
import { CardSkeleton } from '@/components/ui/skeleton';
import { RoadmapPathView } from '@/components/three/roadmap-path-view';
import { toast } from '@/components/ui/toast';
import { cn } from '@/lib/utils';

const ROLES = ['Frontend Developer', 'Backend Developer', 'Product Manager', 'UI/UX Designer', 'Data Analyst', 'QA Engineer', 'AI Engineer'];
const LEVELS = ['BEGINNER', 'JUNIOR', 'MID', 'SENIOR'];
const nextStatus: Record<string, string> = { NOT_STARTED: 'IN_PROGRESS', IN_PROGRESS: 'DONE', DONE: 'NOT_STARTED' };

export default function RoadmapPage() {
  const qc = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showGen, setShowGen] = useState(false);

  const { data: roadmaps, isLoading } = useQuery({
    queryKey: ['roadmaps'],
    queryFn: async () => (await api.get('/roadmaps')).data,
  });

  const { data: skillGaps } = useQuery({
    queryKey: ['skill-gaps'],
    queryFn: async () => (await api.get('/career/skill-gaps')).data as string[],
  });

  useEffect(() => {
    if (roadmaps?.length && !selectedId) setSelectedId(roadmaps[0].id);
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
    onSuccess: () => { refresh(); toast.success('Stage completed! 🎉'); },
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 lg:px-8">
        <PageHeader title="Your Roadmap" subtitle="Loading your path…" />
        <div className="grid gap-4 md:grid-cols-2"><CardSkeleton /><CardSkeleton /></div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 lg:px-8">
      <PageHeader
        title="Your Roadmap"
        subtitle="A personalized, stage-by-stage path to your target role."
        action={
          <button className="btn-primary" onClick={() => setShowGen(true)}>
            <Plus className="h-4 w-4" /> New roadmap
          </button>
        }
      />

      {!roadmaps?.length ? (
        <EmptyState
          icon={Map}
          title="No roadmap yet"
          body="Generate a personalized roadmap tailored to your target role, level and weekly hours."
          action={<button className="btn-primary" onClick={() => setShowGen(true)}><Sparkles className="h-4 w-4" /> Generate roadmap</button>}
        />
      ) : (
        <>
          {/* roadmap switcher */}
          {roadmaps.length > 1 && (
            <div className="mb-5 flex flex-wrap gap-2">
              {roadmaps.map((r: any) => (
                <button
                  key={r.id}
                  onClick={() => setSelectedId(r.id)}
                  className={cn('chip cursor-pointer', r.id === selected.id && 'border-primary/40 bg-primary/10 text-primary')}
                >
                  {r.targetRole} · {r.completion}%
                </button>
              ))}
            </div>
          )}

          {/* overview + 3D path */}
          <div className="mb-6 grid gap-5 lg:grid-cols-[1fr_320px]">
            <div className="card relative overflow-hidden p-2">
              <div className="absolute left-4 top-4 z-10">
                <p className="font-display text-lg font-semibold">{selected.targetRole}</p>
                <p className="text-xs text-muted">{selected.level} · {selected.weeklyHours}h/week · ~{selected.estimatedWeeks} weeks</p>
              </div>
              <div className="h-[280px] w-full">
                <RoadmapPathView
                  nodes={selected.stages.map((s: any) => ({ title: s.title, status: s.status, milestone: s.milestone, completion: s.completion }))}
                />
              </div>
            </div>
            <div className="card flex flex-col items-center justify-center gap-3 p-6">
              <ProgressRing value={selected.completion} sublabel="complete" />
              <p className="text-center text-sm text-muted">
                {selected.stages.filter((s: any) => s.status === 'DONE').length} of {selected.stages.length} stages done
              </p>
            </div>
          </div>

          {/* skill gaps */}
          {skillGaps && skillGaps.length > 0 && (
            <div className="card mb-6 p-5">
              <p className="mb-3 text-sm font-medium">Skill gaps to close</p>
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
                          <span className="chip border-warning/30 bg-warning/10 text-warning"><Flag className="h-3 w-3" /> Milestone</span>
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
                        onClick={() => stageMut.mutate({ stageId: stage.id, status: 'DONE' })}
                      >
                        <Trophy className="h-3.5 w-3.5" /> Complete
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
                        onClick={() => skillMut.mutate({ stageSkillId: sk.id, status: nextStatus[sk.status] })}
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
                    {stage.tasks.map((t: any) => (
                      <label key={t.id} className="flex cursor-pointer items-start gap-3 text-sm">
                        <button
                          type="button"
                          onClick={() => taskMut.mutate(t.id)}
                          className={cn(
                            'mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border transition-colors',
                            t.completed ? 'border-success bg-success text-white' : 'border-border hover:border-primary',
                          )}
                        >
                          {t.completed && <Check className="h-3 w-3" />}
                        </button>
                        <div>
                          <span className={cn(t.completed && 'text-muted line-through')}>{t.title}</span>
                          {t.description && <p className="text-xs text-muted">{t.description}</p>}
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
      )}

      <AnimatePresence>
        {showGen && <GenerateModal onClose={() => setShowGen(false)} onDone={(id) => { setSelectedId(id); refresh(); }} />}
      </AnimatePresence>
    </div>
  );
}

function GenerateModal({ onClose, onDone }: { onClose: () => void; onDone: (id: string) => void }) {
  const [targetRole, setTargetRole] = useState('Frontend Developer');
  const [level, setLevel] = useState('BEGINNER');
  const [weeklyHours, setWeeklyHours] = useState(10);
  const [loading, setLoading] = useState(false);

  async function generate() {
    setLoading(true);
    try {
      const { data } = await api.post('/roadmaps/generate', { targetRole, level, weeklyHours });
      toast.success('Roadmap generated!');
      onDone(data.id);
      onClose();
    } catch (err) {
      toast.error(apiError(err, 'Could not generate roadmap'));
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
          <h2 className="font-display text-xl font-bold">Generate a roadmap</h2>
          <button onClick={onClose} className="text-muted hover:text-fg"><X className="h-5 w-5" /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium">Target role</label>
            <select className="input" value={targetRole} onChange={(e) => setTargetRole(e.target.value)}>
              {ROLES.map((r) => <option key={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Your level</label>
            <div className="grid grid-cols-4 gap-2">
              {LEVELS.map((l) => (
                <button key={l} onClick={() => setLevel(l)} className={cn('rounded-lg border py-2 text-xs font-medium transition-all', level === l ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted')}>
                  {l[0] + l.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-1.5 flex justify-between text-sm font-medium">
              Weekly hours <span className="text-primary">{weeklyHours}h</span>
            </label>
            <input type="range" min={1} max={40} value={weeklyHours} onChange={(e) => setWeeklyHours(+e.target.value)} className="w-full accent-[rgb(var(--primary))]" />
          </div>
          <button className="btn-primary w-full py-3" onClick={generate} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Sparkles className="h-4 w-4" /> Generate</>}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
