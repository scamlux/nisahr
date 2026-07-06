'use client';

import { motion } from 'framer-motion';
import {
  Banknote, BookOpen, Briefcase, ExternalLink, FileText, GraduationCap,
  MapPin, MessageSquareText, PlayCircle, Target,
} from 'lucide-react';
import type { InterviewPrep, JobResult, WebResource } from '@careeros/shared';
import { useI18n } from '@/lib/i18n';
import { cn } from '@/lib/utils';

const RESOURCE_ICON: Record<WebResource['kind'], typeof BookOpen> = {
  ARTICLE: BookOpen,
  VIDEO: PlayCircle,
  COURSE: GraduationCap,
  DOC: FileText,
};

/** Job openings surfaced by the searchJobs AI-HR tool (F3). */
export function JobCards({ jobs }: { jobs: JobResult[] }) {
  const { t } = useI18n();
  const tr = t.pages.home;
  return (
    <div className="space-y-2">
      <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted">
        <Briefcase className="h-3.5 w-3.5" /> {tr.jobsFound}
      </p>
      <div className="grid gap-2">
        {jobs.map((j, i) => (
          <motion.a
            key={`${j.url}-${i}`}
            href={j.url}
            target="_blank"
            rel="noreferrer"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04, duration: 0.2 }}
            className="group rounded-xl border border-border bg-surface/60 p-3 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-soft"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate font-medium group-hover:text-primary">{j.title}</p>
                <p className="truncate text-xs text-muted">{j.company}</p>
              </div>
              <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted">
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" /> {j.location}
              </span>
              {j.workMode && <span className="chip !px-1.5 !py-0 text-[10px]">{j.workMode}</span>}
              {j.salary && (
                <span className="flex items-center gap-1 text-success">
                  <Banknote className="h-3 w-3" /> {j.salary}
                </span>
              )}
              {j.postedAt && <span className="ml-auto">{j.postedAt}</span>}
            </div>
            {j.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {j.tags.map((tag) => (
                  <span key={tag} className="chip border-border/60 !px-1.5 !py-0 text-[10px] text-muted">{tag}</span>
                ))}
              </div>
            )}
          </motion.a>
        ))}
      </div>
    </div>
  );
}

/** Learning resources surfaced by the searchResources tool. */
export function ResourceCards({ resources }: { resources: WebResource[] }) {
  const { t } = useI18n();
  const tr = t.pages.home;
  return (
    <div className="space-y-2">
      <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted">
        <BookOpen className="h-3.5 w-3.5" /> {tr.resourcesFound}
      </p>
      <div className="grid gap-2">
        {resources.map((r, i) => {
          const Icon = RESOURCE_ICON[r.kind];
          return (
            <motion.a
              key={`${r.url}-${i}`}
              href={r.url}
              target="_blank"
              rel="noreferrer"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.2 }}
              className="group flex items-start gap-3 rounded-xl border border-border bg-surface/60 p-3 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-soft"
            >
              <div className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium group-hover:text-primary">{r.title}</p>
                <p className="mt-0.5 line-clamp-2 text-xs text-muted">{r.snippet}</p>
                <p className="mt-1 text-[10px] uppercase tracking-wide text-muted">{r.source} · {r.kind}</p>
              </div>
            </motion.a>
          );
        })}
      </div>
    </div>
  );
}

/** Interview prep bundle surfaced by the getInterviewPrep tool. */
export function InterviewPrepCard({ prep }: { prep: InterviewPrep }) {
  const { t } = useI18n();
  const tr = t.pages.home;
  return (
    <div className="space-y-3 rounded-xl border border-border bg-surface/60 p-3">
      <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted">
        <MessageSquareText className="h-3.5 w-3.5" /> {tr.interviewPrepFor} {prep.role}
      </p>
      <div>
        <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium text-fg">
          <Target className="h-3 w-3 text-primary" /> {tr.focusAreas}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {prep.focusAreas.map((f) => (
            <span key={f} className="chip border-primary/30 bg-primary/10 text-primary">{f}</span>
          ))}
        </div>
      </div>
      <div>
        <p className="mb-1.5 text-[11px] font-medium text-fg">{tr.practiceQuestions}</p>
        <ol className="space-y-1.5">
          {prep.questions.map((q, i) => (
            <li key={i} className={cn('flex gap-2 text-xs text-muted')}>
              <span className="grid h-4 w-4 shrink-0 place-items-center rounded-full bg-surface-2 text-[10px] text-fg">{i + 1}</span>
              {q}
            </li>
          ))}
        </ol>
      </div>
      {prep.resources.length > 0 && <ResourceCards resources={prep.resources} />}
    </div>
  );
}
