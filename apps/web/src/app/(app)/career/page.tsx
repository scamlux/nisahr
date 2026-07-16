'use client';

import { useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, FileText, Loader2, Mic, Send, Gauge, Check, AlertTriangle, Lightbulb, Crown,
  History, ChevronDown, RotateCcw, ArrowLeft, Trophy,
} from 'lucide-react';
import { api, apiError } from '@/lib/api';
import { useAuth } from '@/lib/store';
import { BILLING_ENABLED } from '@/lib/billing';
import { useI18n } from '@/lib/i18n';
import { PageHeader } from '@/components/app/page-header';
import { ProgressRing } from '@/components/ui/progress-ring';
import { InfoHint } from '@/components/ui/info-hint';
import { PremiumGate } from '@/components/app/premium-gate';
import { toast } from '@/components/ui/toast';
import { cn } from '@/lib/utils';

const ROLE_OPTION_VALUES = [
  'Frontend Developer',
  'Backend Developer',
  'Product Manager',
  'UI/UX Designer',
  'Data Analyst',
  'QA Engineer',
  'AI Engineer',
] as const;

/** Role option list built from the shared values + localized labels. */
function useRoleOptions() {
  const { t } = useI18n();
  const labels: Record<(typeof ROLE_OPTION_VALUES)[number], string> = {
    'Frontend Developer': t.pages.career.roleFrontendDeveloper,
    'Backend Developer': t.pages.career.roleBackendDeveloper,
    'Product Manager': t.pages.career.roleProductManager,
    'UI/UX Designer': t.pages.career.roleUiUxDesigner,
    'Data Analyst': t.pages.career.roleDataAnalyst,
    'QA Engineer': t.pages.career.roleQaEngineer,
    'AI Engineer': t.pages.career.roleAiEngineer,
  };
  return ROLE_OPTION_VALUES.map((value) => ({ value, label: labels[value] }));
}

export default function CareerPage() {
  const { t } = useI18n();
  const isPremium = !BILLING_ENABLED || useAuth((s) => s.user?.plan) === 'PREMIUM';
  const roleOptions = useRoleOptions();
  // One shared target role drives all three tools below.
  const [role, setRole] = useState('Frontend Developer');
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 lg:px-8">
      <PageHeader title={t.pages.career.pageTitle} subtitle={t.pages.career.pageSubtitle} />
      <div className="card mb-6 flex flex-wrap items-center gap-3 p-4">
        <label htmlFor="career-role" className="text-sm font-medium">
          {t.pages.career.targetRoleLabel}
        </label>
        <select
          id="career-role"
          className="input sm:max-w-[240px]"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          {roleOptions.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
        </select>
      </div>
      <div className="space-y-8">
        <ResumeReview role={role} />
        <MockInterview locked={!isPremium} role={role} />
        <JobReadiness locked={!isPremium} role={role} />
      </div>
    </div>
  );
}

/* ------------------------------ Resume ------------------------------ */
function ResumeReview({ role }: { role: string }) {
  const { t } = useI18n();
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState('');
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<File | null>(null);

  async function review() {
    if (!fileRef.current && !text.trim()) {
      toast.error(t.pages.career.resumeUploadRequired);
      return;
    }
    setLoading(true);
    try {
      const form = new FormData();
      if (fileRef.current) form.append('file', fileRef.current);
      if (text.trim()) form.append('text', text);
      form.append('targetRole', role);
      const { data } = await api.post('/resume/review', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      setResult(data);
      toast.success(t.pages.career.resumeAnalyzed);
    } catch (err) { toast.error(apiError(err)); } finally { setLoading(false); }
  }

  return (
    <section className="card p-6">
      <h2 className="mb-1 flex items-center gap-2 font-display text-lg font-semibold"><FileText className="h-5 w-5 text-primary" /> {t.pages.career.resumeReviewTitle}</h2>
      <p className="mb-5 text-sm text-muted">{t.pages.career.resumeReviewSubtitle}</p>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault(); setDragging(false);
              const f = e.dataTransfer.files[0];
              if (f) { fileRef.current = f; setFileName(f.name); }
            }}
            onClick={() => inputRef.current?.click()}
            className={cn('flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-colors', dragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50')}
          >
            <Upload className="mb-2 h-7 w-7 text-muted" />
            <p className="text-sm font-medium">{fileName || t.pages.career.resumeDropHint}</p>
            <p className="mt-1 text-xs text-muted">{t.pages.career.resumeFileTypes}</p>
            <input ref={inputRef} type="file" accept=".pdf,.docx,.txt" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) { fileRef.current = f; setFileName(f.name); } }} />
          </div>
          <textarea className="input mt-3 min-h-[80px] resize-none" placeholder={t.pages.career.resumePastePlaceholder} value={text} onChange={(e) => setText(e.target.value)} />
          <div className="mt-3 flex gap-2">
            <button className="btn-primary" onClick={review} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t.pages.career.analyzeButton}
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {result ? (
            <motion.div key="res" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="rounded-2xl border border-border bg-surface-2/40 p-5">
              <div className="flex items-center gap-4">
                <ProgressRing value={result.score} size={88} stroke={8} sublabel={t.pages.career.sublabelScore} />
                <div className="space-y-2 text-sm">
                  {result.strengths?.map((s: string) => (
                    <p key={s} className="flex items-start gap-2 text-success"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0" />{s}</p>
                  ))}
                </div>
              </div>
              {result.gaps?.length > 0 && (
                <div className="mt-4 space-y-1.5">
                  {result.gaps.map((g: string) => (
                    <p key={g} className="flex items-start gap-2 text-sm text-warning"><AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />{g}</p>
                  ))}
                </div>
              )}
              {result.suggestions?.length > 0 && (
                <div className="mt-4 space-y-1.5 border-t border-border/60 pt-4">
                  {result.suggestions.map((s: string) => (
                    <p key={s} className="flex items-start gap-2 text-sm text-muted"><Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />{s}</p>
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            <div className="grid place-items-center rounded-2xl border border-border bg-surface-2/30 p-8 text-center text-sm text-muted">
              {t.pages.career.resumeEmptyState}
            </div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

/* --------------------------- Mock Interview ------------------------- */
function MockInterview({ locked, role }: { locked: boolean; role: string }) {
  const { t } = useI18n();
  const TYPE_OPTIONS = [
    { value: 'HR', label: t.pages.career.typeHr },
    { value: 'TECHNICAL', label: t.pages.career.typeTechnical },
    { value: 'BEHAVIORAL', label: t.pages.career.typeBehavioral },
  ];
  const qc = useQueryClient();
  const [type, setType] = useState('HR');
  const [state, setState] = useState<any>(null);
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [turns, setTurns] = useState<{ q: string; a: string; score?: number; feedback?: string }[]>([]);
  const [reportId, setReportId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  const historyQuery = useQuery({
    queryKey: ['interview-history'],
    queryFn: async () => (await api.get('/interview/history')).data,
    enabled: !locked,
  });

  if (locked) {
    return (
      <section>
        <h2 className="mb-3 flex items-center gap-2 font-display text-lg font-semibold"><Mic className="h-5 w-5 text-primary" /> {t.pages.career.mockInterviewTitle} <Crown className="h-4 w-4 text-warning" /></h2>
        <PremiumGate feature={t.pages.career.mockInterviewFeature} />
      </section>
    );
  }

  async function start() {
    setLoading(true); setTurns([]); setReportId(null);
    try {
      const { data } = await api.post('/interview/mock', { type, targetRole: role });
      setState(data);
      setShowHistory(false);
    } catch (err) { toast.error(apiError(err)); } finally { setLoading(false); }
  }

  async function submit() {
    if (!answer.trim() || !state) return;
    setLoading(true);
    const q = state.question;
    try {
      const { data } = await api.post('/interview/answer', { interviewId: state.interviewId, answer });
      setTurns((h) => [...h, { q, a: answer, score: data.evaluation.score, feedback: data.evaluation.feedback }]);
      setAnswer('');
      setState({ ...state, ...data });
      if (data.completed) {
        setReportId(state.interviewId);
        qc.invalidateQueries({ queryKey: ['interview-history'] });
      }
    } catch (err) { toast.error(apiError(err)); } finally { setLoading(false); }
  }

  function reset() {
    setState(null); setTurns([]); setReportId(null);
  }

  return (
    <section className="card p-6">
      <div className="mb-1 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 font-display text-lg font-semibold"><Mic className="h-5 w-5 text-primary" /> {t.pages.career.mockInterviewTitle}</h2>
        {!state && !reportId && (
          <button onClick={() => setShowHistory((s) => !s)} className="btn-ghost !px-3 !py-1.5 text-xs">
            <History className="h-3.5 w-3.5" /> {t.pages.career.pastInterviewsButton}
            <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', showHistory && 'rotate-180')} />
          </button>
        )}
      </div>
      <p className="mb-5 text-sm text-muted">{t.pages.career.mockInterviewSubtitle}</p>

      {reportId ? (
        <ReportView id={reportId} onNew={reset} />
      ) : state ? (
        <div className="space-y-4">
          {turns.map((h, i) => (
            <div key={i} className="space-y-2">
              <p className="rounded-2xl border border-border bg-surface-2/60 px-4 py-3 text-sm">{h.q}</p>
              <p className="ml-auto max-w-[85%] rounded-2xl bg-primary px-4 py-3 text-sm text-primary-fg">{h.a}</p>
              <div className="flex items-center gap-2 text-xs">
                <span className="chip border-accent/30 bg-accent/10 text-accent">{t.pages.career.scoreLabel} {h.score}</span>
                <span className="text-muted">{h.feedback}</span>
              </div>
            </div>
          ))}
          <p className="rounded-2xl border border-border bg-surface-2/60 px-4 py-3 text-sm font-medium">
            {t.pages.career.questionAbbr}{state.currentIndex + 1}/{state.totalQuestions}: {state.question}
          </p>
          <div className="flex gap-2">
            <textarea className="input min-h-[60px] resize-none" placeholder={t.pages.career.typeAnswerPlaceholder} value={answer} onChange={(e) => setAnswer(e.target.value)} />
            <button className="btn-primary shrink-0 self-end" onClick={submit} disabled={loading || !answer.trim()}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label className="mb-1.5 block text-xs text-muted">{t.pages.career.typeLabel}</label>
              <div className="flex gap-2">
                {TYPE_OPTIONS.map((opt) => (
                  <button key={opt.value} onClick={() => setType(opt.value)} className={cn('rounded-lg border px-3 py-2 text-xs font-medium', type === opt.value ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted')}>{opt.label}</button>
                ))}
              </div>
            </div>
            <button className="btn-primary" onClick={start} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t.pages.career.startInterviewButton}
            </button>
          </div>

          <AnimatePresence>
            {showHistory && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <p className="mb-2 mt-2 text-xs font-medium uppercase tracking-wide text-muted">{t.pages.career.pastInterviewsHeading}</p>
                {historyQuery.isLoading ? (
                  <div className="py-4 text-center"><Loader2 className="mx-auto h-4 w-4 animate-spin text-primary" /></div>
                ) : historyQuery.data?.length ? (
                  <div className="space-y-2">
                    {historyQuery.data.map((h: any) => (
                      <button
                        key={h.id}
                        onClick={() => setReportId(h.id)}
                        className="flex w-full items-center justify-between rounded-xl border border-border bg-surface-2/40 p-3 text-left transition-colors hover:border-primary/40"
                      >
                        <div>
                          <p className="text-sm font-medium">{h.type} · {h.targetRole}</p>
                          <p className="text-xs text-muted">
                            {new Date(h.createdAt).toLocaleDateString()} · {h.answered}/{h.total} {t.pages.career.answeredLabel} · {h.completed ? t.pages.career.completedStatus : t.pages.career.inProgressStatus}
                          </p>
                        </div>
                        <span className={cn('chip', h.completed ? 'border-primary/30 bg-primary/10 text-primary' : 'border-border text-muted')}>
                          {h.completed ? `${Math.round(h.score)}/100` : '—'}
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="py-3 text-sm text-muted">{t.pages.career.noPastInterviews}</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </section>
  );
}

/* --------------------- Saved Interview Report ----------------------- */
function ReportView({ id, onNew }: { id: string; onNew: () => void }) {
  const { t } = useI18n();
  const { data, isLoading } = useQuery({
    queryKey: ['interview-report', id],
    queryFn: async () => (await api.get(`/interview/${id}`)).data,
  });

  if (isLoading || !data) {
    return <div className="grid place-items-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  const r = data.report;
  const dims = [
    { label: t.pages.career.dimCommunication, value: r.breakdown.communication },
    { label: t.pages.career.dimSpecificity, value: r.breakdown.specificity },
    { label: t.pages.career.dimStructure, value: r.breakdown.structure },
  ];
  const verdict = r.overall >= 80 ? t.pages.career.verdictReady : r.overall >= 60 ? t.pages.career.verdictSolid : t.pages.career.verdictNeedsPractice;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      {/* score + breakdown */}
      <div className="rounded-2xl border border-border bg-surface-2/40 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-warning" />
              <span className="font-display text-lg font-semibold">{t.pages.career.interviewReportTitle}</span>
            </div>
            <p className="mt-0.5 text-xs text-muted">
              {data.type} · {data.targetRole} · {new Date(data.createdAt).toLocaleDateString()} · {r.answered}/{r.total} {t.pages.career.answeredLabel}
            </p>
          </div>
          <div className="text-right">
            <p className="font-display text-3xl font-bold">
              {r.overall}<span className="text-base font-medium text-muted">/100</span>
            </p>
            <p className="text-xs text-accent">{verdict}</p>
          </div>
        </div>
        <div className="mt-5 space-y-3">
          {dims.map((d) => (
            <div key={d.label}>
              <div className="mb-1 flex justify-between text-sm">
                <span className="text-muted">{d.label}</span>
                <span className="font-medium">{d.value}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-surface-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${d.value}%` }}
                  transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                  className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* strengths + improvements */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-success/30 bg-success/5 p-4">
          <p className="mb-2 flex items-center gap-1.5 text-sm font-medium text-success"><Check className="h-4 w-4" /> {t.pages.career.strengthsLabel}</p>
          <ul className="space-y-1.5">
            {r.strengths.length ? r.strengths.map((s: string) => (
              <li key={s} className="text-sm text-muted">{s}</li>
            )) : <li className="text-sm text-muted">—</li>}
          </ul>
        </div>
        <div className="rounded-2xl border border-warning/30 bg-warning/5 p-4">
          <p className="mb-2 flex items-center gap-1.5 text-sm font-medium text-warning"><Lightbulb className="h-4 w-4" /> {t.pages.career.improveNextTimeLabel}</p>
          <ul className="space-y-1.5">
            {r.improvements.length ? r.improvements.map((s: string) => (
              <li key={s} className="text-sm text-muted">{s}</li>
            )) : <li className="text-sm text-muted">—</li>}
          </ul>
        </div>
      </div>

      {/* transcript */}
      <details className="rounded-2xl border border-border bg-surface-2/30 p-4">
        <summary className="cursor-pointer select-none text-sm font-medium">{t.pages.career.viewTranscript}</summary>
        <div className="mt-3 space-y-4">
          {data.transcript.map((qa: any, i: number) => (
            <div key={i} className="space-y-1.5">
              <p className="text-sm font-medium">{t.pages.career.questionAbbr}{i + 1}. {qa.question}</p>
              {qa.answer ? (
                <p className="rounded-lg bg-surface-2/60 px-3 py-2 text-sm text-muted">{qa.answer}</p>
              ) : (
                <p className="text-xs italic text-muted">{t.pages.career.notAnswered}</p>
              )}
              {typeof qa.score === 'number' && (
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="chip border-accent/30 bg-accent/10 text-accent">{t.pages.career.scoreLabel} {qa.score}</span>
                  <span className="text-muted">{qa.feedback}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </details>

      <div className="flex gap-2">
        <button className="btn-primary" onClick={onNew}><RotateCcw className="h-4 w-4" /> {t.pages.career.newInterviewButton}</button>
        <button className="btn-ghost" onClick={onNew}><ArrowLeft className="h-4 w-4" /> {t.pages.career.backButton}</button>
      </div>
    </motion.div>
  );
}

/* --------------------------- Job Readiness -------------------------- */
function JobReadiness({ locked, role }: { locked: boolean; role: string }) {
  const { t } = useI18n();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  if (locked) {
    return (
      <section>
        <h2 className="mb-3 flex items-center gap-2 font-display text-lg font-semibold"><Gauge className="h-5 w-5 text-primary" /> {t.pages.career.jobReadinessTitle} <Crown className="h-4 w-4 text-warning" /></h2>
        <PremiumGate feature={t.pages.career.jobReadinessFeature} />
      </section>
    );
  }

  async function compute() {
    setLoading(true);
    try {
      const res = await api.get('/career/job-readiness', { params: { role } });
      setData(res.data);
    } catch (err) { toast.error(apiError(err)); } finally { setLoading(false); }
  }

  const bars = data ? [
    { label: t.pages.career.skillsCoverageLabel, value: data.breakdown.skillsCoverage },
    { label: t.pages.career.roadmapProgressLabel, value: data.breakdown.roadmapProgress },
    { label: t.pages.career.resumeScoreLabel, value: data.breakdown.resumeScore },
    { label: t.pages.career.interviewScoreLabel, value: data.breakdown.interviewScore },
  ] : [];

  return (
    <section className="card p-6">
      <h2 className="mb-1 flex items-center gap-2 font-display text-lg font-semibold"><Gauge className="h-5 w-5 text-primary" /> {t.pages.career.jobReadinessTitle} <InfoHint text={t.pages.career.jobReadinessHint} /></h2>
      <p className="mb-5 text-sm text-muted">{t.pages.career.jobReadinessSubtitle}</p>
      <div className="flex flex-wrap items-end gap-3">
        <button className="btn-primary" onClick={compute} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t.pages.career.computeScoreButton}
        </button>
      </div>

      {data && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mt-6 grid gap-6 sm:grid-cols-[auto_1fr] sm:items-center">
          <div className="grid place-items-center">
            <ProgressRing value={data.score} size={150} stroke={12} sublabel={t.pages.career.sublabelReady} />
          </div>
          <div className="space-y-3">
            {bars.map((b) => (
              <div key={b.label}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-muted">{b.label}</span>
                  <span className="font-medium">{b.value}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-surface-2">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${b.value}%` }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }} className="h-full rounded-full bg-gradient-to-r from-primary to-accent" />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </section>
  );
}
