'use client';

import { motion } from 'framer-motion';
import {
  BookOpen, Check, Circle, CircleDot, Clock, ExternalLink, Flag, FileText,
  GraduationCap, PlayCircle, RotateCcw, X,
} from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { cn } from '@/lib/utils';

export interface StageSkill { id: string; name: string; status: string }
export interface StageTask { id: string; title: string; description?: string; completed: boolean }
export interface StageResource {
  id: string; title: string; type?: string; url: string; provider?: string; durationMin?: number;
}
export interface DrawerStage {
  id: string;
  order?: number;
  title: string;
  description?: string;
  status: string;
  milestone?: boolean;
  skills?: StageSkill[];
  tasks?: StageTask[];
  resources?: StageResource[];
}

const nextSkill: Record<string, string> = {
  NOT_STARTED: 'IN_PROGRESS', IN_PROGRESS: 'DONE', DONE: 'NOT_STARTED',
};

// ResourceType (Prisma) -> icon + accent.
const RES_META: Record<string, { icon: typeof PlayCircle; tone: string }> = {
  VIDEO: { icon: PlayCircle, tone: 'text-danger bg-danger/12' },
  YOUTUBE: { icon: PlayCircle, tone: 'text-danger bg-danger/12' },
  COURSERA: { icon: GraduationCap, tone: 'text-primary bg-primary/12' },
  UDEMY: { icon: GraduationCap, tone: 'text-primary bg-primary/12' },
  ARTICLE: { icon: BookOpen, tone: 'text-accent bg-accent/14' },
  INTERNAL: { icon: FileText, tone: 'text-muted bg-surface-2' },
};

/** Side panel for one roadmap stage: description, skill toggles, tasks, typed resources. */
export function StageDrawer({
  stage, pending, onClose, onStatusChange, onSkillToggle, onTaskToggle,
}: {
  stage: DrawerStage;
  pending: boolean;
  onClose: () => void;
  onStatusChange: (status: string) => void;
  onSkillToggle: (skillId: string, nextStatus: string) => void;
  onTaskToggle: (taskId: string) => void;
}) {
  const { t } = useI18n();
  const tr = t.pages.roadmap;

  const statusLabel = {
    NOT_STARTED: tr.statusNotStarted, IN_PROGRESS: tr.statusInProgress,
    DONE: tr.statusDone, SKIPPED: tr.statusSkipped,
  }[stage.status] ?? tr.statusNotStarted;

  return (
    <motion.aside
      role="dialog"
      aria-label={stage.title}
      initial={{ x: '105%' }}
      animate={{ x: 0 }}
      exit={{ x: '105%' }}
      transition={{ type: 'spring', stiffness: 320, damping: 32 }}
      className="fixed inset-y-0 right-0 z-[70] flex w-full max-w-md flex-col border-l border-border bg-surface shadow-soft"
    >
      {/* header */}
      <div className="border-b border-border/60 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="chip mb-2 border-primary/20 bg-primary/5 text-[10px] uppercase tracking-wide text-primary">
              {stage.milestone ? <><Flag className="h-3 w-3" /> {tr.milestone}</> : `${tr.title} · ${stage.order ?? ''}`}
            </span>
            <h2 className="font-display text-xl font-bold leading-tight">{stage.title}</h2>
            {stage.description && (
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{stage.description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1.5 text-muted transition-colors hover:bg-surface-2 hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* status controls */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span
            className={cn(
              'chip',
              stage.status === 'DONE' && 'border-success/30 bg-success/10 text-success',
              stage.status === 'IN_PROGRESS' && 'border-primary/30 bg-primary/10 text-primary',
            )}
          >
            {statusLabel}
          </span>
          <div className="ml-auto flex gap-1.5">
            {stage.status !== 'DONE' && (
              <>
                {stage.status !== 'IN_PROGRESS' && (
                  <button
                    disabled={pending}
                    onClick={() => onStatusChange('IN_PROGRESS')}
                    className="btn-ghost !px-3 !py-1.5 text-xs"
                  >
                    <CircleDot className="h-3.5 w-3.5" /> {tr.markInProgress}
                  </button>
                )}
                <button
                  disabled={pending}
                  onClick={() => onStatusChange('DONE')}
                  className="btn-primary !px-3 !py-1.5 text-xs"
                >
                  <Check className="h-3.5 w-3.5" /> {tr.markDone}
                </button>
              </>
            )}
            {stage.status !== 'NOT_STARTED' && (
              <button
                disabled={pending}
                onClick={() => onStatusChange('NOT_STARTED')}
                className="btn-ghost !px-3 !py-1.5 text-xs"
                aria-label={tr.markReset}
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* body */}
      <div className="flex-1 space-y-6 overflow-y-auto p-5">
        {/* skills */}
        {stage.skills && stage.skills.length > 0 && (
          <section>
            <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-wide text-muted">{tr.stageSkills}</p>
            <div className="flex flex-wrap gap-2">
              {stage.skills.map((sk) => (
                <button
                  key={sk.id}
                  disabled={pending}
                  onClick={() => onSkillToggle(sk.id, nextSkill[sk.status] ?? 'IN_PROGRESS')}
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
          </section>
        )}

        {/* tasks */}
        {stage.tasks && stage.tasks.length > 0 && (
          <section>
            <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-wide text-muted">{tr.stageTasks}</p>
            <div className="space-y-2.5">
              {stage.tasks.map((task) => (
                <label key={task.id} className="flex cursor-pointer items-start gap-3 text-sm">
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => onTaskToggle(task.id)}
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
          </section>
        )}

        {/* resources */}
        {stage.resources && stage.resources.length > 0 && (
          <section>
            <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-wide text-muted">{tr.drawerResources}</p>
            <div className="space-y-2">
              {stage.resources.map((r, i) => {
                const meta = RES_META[(r.type ?? 'ARTICLE').toUpperCase()] ?? RES_META.ARTICLE;
                const Icon = meta.icon;
                return (
                  <motion.a
                    key={r.id}
                    href={r.url || '#'}
                    target="_blank"
                    rel="noreferrer"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03, duration: 0.2 }}
                    className="group flex items-start gap-3 rounded-xl border border-border bg-surface-2/40 p-3 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                  >
                    <div className={cn('mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg', meta.tone)}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium group-hover:text-primary">{r.title}</p>
                      <p className="mt-0.5 flex items-center gap-2 text-[11px] text-muted">
                        {r.provider && <span className="truncate">{r.provider}</span>}
                        {r.durationMin ? (
                          <span className="flex shrink-0 items-center gap-0.5">
                            <Clock className="h-3 w-3" /> {r.durationMin} {tr.minutesShort}
                          </span>
                        ) : null}
                      </p>
                    </div>
                    <ExternalLink className="mt-1 h-3.5 w-3.5 shrink-0 text-muted opacity-0 transition-opacity group-hover:opacity-100" />
                  </motion.a>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </motion.aside>
  );
}
