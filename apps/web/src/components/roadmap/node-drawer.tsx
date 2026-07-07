'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen, Check, CircleDot, Clock, ExternalLink, FileText, GraduationCap,
  PlayCircle, RotateCcw, SkipForward, Wrench, X,
} from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { cn } from '@/lib/utils';

export interface DrawerResource {
  id: string;
  kind: 'FREE_VIDEO' | 'OFFICIAL_DOC' | 'POPULAR' | 'PAID_COURSE' | 'ARTICLE' | 'PRACTICE';
  provider: string;
  url: string;
  title: string;
  durationMin: number;
  lang: string;
}

export interface DrawerNode {
  id: string;
  title: string;
  description: string;
  group: string;
  type: 'TOPIC' | 'SUBTOPIC' | 'OPTIONAL';
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'DONE' | 'SKIPPED';
  resources: DrawerResource[];
}

type TabKey = 'videos' | 'resources' | 'docs' | 'practice';

const TAB_KINDS: Record<TabKey, DrawerResource['kind'][]> = {
  videos: ['FREE_VIDEO'],
  resources: ['POPULAR', 'ARTICLE', 'PAID_COURSE'],
  docs: ['OFFICIAL_DOC'],
  practice: ['PRACTICE'],
};

const KIND_ICON: Record<DrawerResource['kind'], typeof PlayCircle> = {
  FREE_VIDEO: PlayCircle,
  OFFICIAL_DOC: FileText,
  POPULAR: BookOpen,
  PAID_COURSE: GraduationCap,
  ARTICLE: BookOpen,
  PRACTICE: Wrench,
};

/** Side panel for a roadmap node: categorized resources + mark-as-learned. */
export function NodeDrawer({
  node,
  onClose,
  onStatusChange,
  pending,
}: {
  node: DrawerNode;
  onClose: () => void;
  onStatusChange: (status: DrawerNode['status']) => void;
  pending: boolean;
}) {
  const { t, locale } = useI18n();
  const tr = t.pages.roadmap;
  const [tab, setTab] = useState<TabKey>('videos');

  // Language-aware ordering: UI locale first, then English, then the rest.
  const sorted = useMemo(() => {
    const rank = (r: DrawerResource) => (r.lang === locale ? 0 : r.lang === 'en' ? 1 : 2);
    return [...node.resources].sort((a, b) => rank(a) - rank(b));
  }, [node.resources, locale]);

  const tabs = (Object.keys(TAB_KINDS) as TabKey[]).map((key) => ({
    key,
    label: {
      videos: tr.drawerVideos,
      resources: tr.drawerResources,
      docs: tr.drawerDocs,
      practice: tr.drawerPractice,
    }[key],
    items: sorted.filter((r) => TAB_KINDS[key].includes(r.kind)),
  }));
  const active = tabs.find((x) => x.key === tab) ?? tabs[0];

  const statusLabel = {
    NOT_STARTED: tr.statusNotStarted,
    IN_PROGRESS: tr.statusInProgress,
    DONE: tr.statusDone,
    SKIPPED: tr.statusSkipped,
  }[node.status];

  return (
    <motion.aside
      role="dialog"
      aria-label={node.title}
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
            {node.group && (
              <span className="chip mb-2 border-primary/20 bg-primary/5 text-[10px] uppercase tracking-wide text-primary">
                {node.group}
              </span>
            )}
            <h2 className="font-display text-xl font-bold leading-tight">{node.title}</h2>
            {node.description && (
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{node.description}</p>
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
              node.status === 'DONE' && 'border-success/30 bg-success/10 text-success',
              node.status === 'IN_PROGRESS' && 'border-primary/30 bg-primary/10 text-primary',
            )}
          >
            {statusLabel}
          </span>
          <div className="ml-auto flex gap-1.5">
            {node.status !== 'DONE' && (
              <>
                {node.status !== 'IN_PROGRESS' && (
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
                {node.type === 'OPTIONAL' && (
                  <button
                    disabled={pending}
                    onClick={() => onStatusChange('SKIPPED')}
                    className="btn-ghost !px-3 !py-1.5 text-xs"
                  >
                    <SkipForward className="h-3.5 w-3.5" /> {tr.markSkip}
                  </button>
                )}
              </>
            )}
            {node.status !== 'NOT_STARTED' && (
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

      {/* tabs */}
      <div className="flex gap-1 border-b border-border/60 px-4 pt-3">
        {tabs.map((x) => (
          <button
            key={x.key}
            onClick={() => setTab(x.key)}
            className={cn(
              'relative rounded-t-lg px-3 py-2 text-xs font-medium transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
              tab === x.key ? 'text-primary' : 'text-muted hover:text-fg',
            )}
          >
            {x.label}
            <span className="ml-1.5 text-[10px] text-muted">{x.items.length}</span>
            {tab === x.key && (
              <motion.div
                layoutId="drawer-tab"
                className="absolute inset-x-1 -bottom-px h-0.5 rounded-full bg-primary"
              />
            )}
          </button>
        ))}
      </div>

      {/* resource list */}
      <div className="flex-1 space-y-2 overflow-y-auto p-4">
        {active.items.length === 0 ? (
          <p className="p-6 text-center text-sm text-muted">{tr.emptyResources}</p>
        ) : (
          active.items.map((r, i) => {
            const Icon = KIND_ICON[r.kind];
            return (
              <motion.a
                key={r.id}
                href={r.url}
                target="_blank"
                rel="noreferrer"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03, duration: 0.2 }}
                className="group flex items-start gap-3 rounded-xl border border-border bg-surface-2/40 p-3 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              >
                <div className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium group-hover:text-primary">
                    {r.title}
                  </p>
                  <p className="mt-0.5 flex items-center gap-2 text-[11px] text-muted">
                    <span className="truncate">{r.provider}</span>
                    <span className="flex shrink-0 items-center gap-0.5">
                      <Clock className="h-3 w-3" /> {r.durationMin} {tr.minutesShort}
                    </span>
                    <span className="shrink-0 rounded border border-border px-1 uppercase">
                      {r.lang}
                    </span>
                  </p>
                </div>
                <ExternalLink className="mt-1 h-3.5 w-3.5 shrink-0 text-muted opacity-0 transition-opacity group-hover:opacity-100" />
              </motion.a>
            );
          })
        )}
      </div>
    </motion.aside>
  );
}
