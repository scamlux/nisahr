'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft, ArrowRight, BrainCircuit, CheckCircle2, Compass, Loader2, Sparkles, Timer,
} from 'lucide-react';
import { api, apiError } from '@/lib/api';
import { useI18n } from '@/lib/i18n';
import { PageHeader } from '@/components/app/page-header';
import { Skeleton } from '@/components/ui/skeleton';
import { InfoHint } from '@/components/ui/info-hint';
import { toast } from '@/components/ui/toast';
import { cn } from '@/lib/utils';

type Locale = 'en' | 'ru' | 'uz';

interface TestPayload {
  version: string;
  scale: { min: number; max: number };
  axisLabels: Record<string, Record<Locale, string>>;
  questions: { id: string; text: Record<Locale, string> }[];
}

interface ResultPayload {
  id: string;
  version: string;
  axes: Record<string, number>;
  profileCode: string;
  axisLabels?: Record<string, Record<Locale, string>>;
  createdAt: string;
}

interface Recommendation {
  id: string;
  title: string;
  reason: string;
  entryDifficulty: 'EASY' | 'MEDIUM' | 'HARD';
  estimatedMonths: number;
  score: number;
}

type Mode = 'intro' | 'test' | 'result';

export default function PsychTestPage() {
  const { t, locale } = useI18n();
  const tr = t.pages.psychTest;
  const router = useRouter();
  const queryClient = useQueryClient();
  const loc = (locale as Locale) ?? 'en';

  const [mode, setMode] = useState<Mode>('intro');
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [recs, setRecs] = useState<Recommendation[] | null>(null);
  const [result, setResult] = useState<ResultPayload | null>(null);

  const { data: test, isLoading } = useQuery<TestPayload>({
    queryKey: ['psych-test'],
    queryFn: async () => (await api.get('/psych-test')).data,
    staleTime: Infinity,
  });

  // Existing result → land on the result view with saved recommendations.
  useQuery<ResultPayload>({
    queryKey: ['psych-result'],
    queryFn: async () => {
      const { data } = await api.get('/psych-test/result');
      if (mode === 'intro' && !result) {
        setResult(data);
        const saved = await api.get('/career/recommendations');
        if (Array.isArray(saved.data) && saved.data.length > 0) {
          setRecs(saved.data);
          setMode('result');
        }
      }
      return data;
    },
    retry: false,
    staleTime: Infinity,
  });

  const total = test?.questions.length ?? 0;
  const progress = total ? Math.round((step / total) * 100) : 0;
  const question = test?.questions[step];

  async function submit(final: Record<string, number>) {
    if (!test) return;
    setSubmitting(true);
    try {
      const { data: res } = await api.post('/psych-test/submit', {
        version: test.version,
        answers: Object.entries(final).map(([questionId, value]) => ({ questionId, value })),
      });
      setResult(res);
      const { data: recData } = await api.post('/career/recommendations', {
        limit: 5,
        locale: loc,
      });
      setRecs(recData);
      queryClient.invalidateQueries({ queryKey: ['recommendations'] });
      queryClient.invalidateQueries({ queryKey: ['psych-result'] });
      setMode('result');
    } catch (err) {
      toast.error(apiError(err, tr.toastSubmitFailed));
    } finally {
      setSubmitting(false);
    }
  }

  function answer(value: number) {
    if (!question) return;
    const next = { ...answers, [question.id]: value };
    setAnswers(next);
    if (step + 1 >= total) {
      void submit(next);
    } else {
      // brief beat so the selection state is visible before the slide
      setTimeout(() => setStep((s) => s + 1), 180);
    }
  }

  if (isLoading || !test) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 lg:px-8">
        <PageHeader title={tr.title} subtitle={tr.subtitle} />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 lg:px-8">
      <PageHeader title={tr.title} subtitle={tr.subtitle} />

      <AnimatePresence mode="wait">
        {mode === 'intro' && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="card relative overflow-hidden p-8"
          >
            <div className="aurora-blob right-0 top-0 h-48 w-48 bg-primary/15" />
            <div className="relative">
              <div className="mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 text-primary">
                <BrainCircuit className="h-7 w-7" />
              </div>
              <h2 className="font-display text-2xl font-bold">{tr.introTitle}</h2>
              <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted">{tr.introBody}</p>
              <ul className="mt-6 space-y-2.5 text-sm">
                {[tr.introBullet1, tr.introBullet2, tr.introBullet3].map((b) => (
                  <li key={b} className="flex items-center gap-2.5">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-success" /> {b}
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <button className="btn-primary px-6 py-3" onClick={() => { setStep(0); setAnswers({}); setMode('test'); }}>
                  <Timer className="h-4 w-4" /> {tr.startButton}
                </button>
                {result && (
                  <button className="btn-ghost px-5 py-3" onClick={() => setMode('result')}>
                    {tr.resultTitle} <ArrowRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {mode === 'test' && (
          <motion.div key="test" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {/* progress */}
            <div className="mb-6">
              <div className="mb-2 flex items-center justify-between text-xs text-muted">
                <span>
                  {step + 1} {tr.questionOf} {total}
                </span>
                <span className="tabular-nums">{progress}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                  animate={{ width: `${((step + 1) / total) * 100}%` }}
                  transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                />
              </div>
            </div>

            {submitting ? (
              <div className="card flex flex-col items-center justify-center gap-4 p-16 text-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted">{tr.submitting}</p>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={question?.id}
                  initial={{ opacity: 0, x: 32 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -32 }}
                  transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                  className="card p-8"
                >
                  <p className="min-h-[72px] font-display text-xl font-semibold leading-snug">
                    {question?.text[loc] ?? question?.text.en}
                  </p>
                  <div className="mt-8 grid grid-cols-5 gap-2">
                    {[1, 2, 3, 4, 5].map((v) => {
                      const selected = question && answers[question.id] === v;
                      return (
                        <button
                          key={v}
                          onClick={() => answer(v)}
                          aria-label={`${v}`}
                          className={cn(
                            'group flex h-16 flex-col items-center justify-center rounded-xl border text-lg font-semibold transition-all',
                            'hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-soft',
                            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
                            selected
                              ? 'border-primary bg-primary/10 text-primary'
                              : 'border-border bg-surface-2/50 text-fg',
                          )}
                        >
                          {v}
                        </button>
                      );
                    })}
                  </div>
                  <div className="mt-2 flex justify-between text-[11px] uppercase tracking-wide text-muted">
                    <span>{tr.scaleDisagree}</span>
                    <span>{tr.scaleAgree}</span>
                  </div>
                  <div className="mt-8 flex justify-between">
                    <button
                      className="btn-ghost px-4 py-2 text-sm disabled:opacity-40"
                      disabled={step === 0}
                      onClick={() => setStep((s) => Math.max(0, s - 1))}
                    >
                      <ArrowLeft className="h-4 w-4" /> {tr.backButton}
                    </button>
                  </div>
                </motion.div>
              </AnimatePresence>
            )}
          </motion.div>
        )}

        {mode === 'result' && result && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* profile card */}
            <div className="card relative mb-6 overflow-hidden p-6">
              <div className="aurora-blob left-1/3 top-0 h-44 w-44 bg-accent/15" />
              <div className="relative">
                <div>
                  <h2 className="flex items-center gap-2 font-display text-2xl font-bold">
                    <Sparkles className="h-5 w-5 text-primary" /> {tr.resultTitle}
                  </h2>
                  <p className="mt-1 text-sm text-muted">{tr.resultSubtitle}</p>
                  <div className="mt-4 flex items-center gap-3">
                    <span className="chip border-primary/30 bg-primary/10 font-mono text-lg font-bold tracking-[0.2em] text-primary">
                      {result.profileCode}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-muted">
                      {tr.profileCodeLabel} <InfoHint text={tr.riasecHint} />
                    </span>
                  </div>
                  <div className="mt-5 space-y-2">
                    {Object.entries(result.axes).map(([axis, value]) => (
                      <div key={axis} className="flex items-center gap-3 text-xs">
                        <span className="w-40 truncate text-muted">
                          {test.axisLabels[axis]?.[loc] ?? axis}
                        </span>
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2">
                          <motion.div
                            className="h-full rounded-full bg-primary"
                            initial={{ width: 0 }}
                            animate={{ width: `${value}%` }}
                            transition={{ duration: 0.6, delay: 0.15 }}
                          />
                        </div>
                        <span className="w-8 text-right tabular-nums text-muted">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* recommendations */}
            <h3 className="mb-3 flex items-center gap-2 font-display text-lg font-semibold">
              <Compass className="h-5 w-5 text-primary" /> {tr.recommendationsTitle}
            </h3>
            <div className="space-y-3">
              {(recs ?? []).map((r, i) => (
                <motion.div
                  key={r.id ?? r.title}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 * i, duration: 0.3 }}
                  className="card group flex flex-wrap items-center gap-4 p-5 transition-all hover:border-primary/40 hover:shadow-soft"
                >
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary/15 to-accent/15 font-display text-sm font-bold text-primary">
                    {Math.round(r.score)}%
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-display font-semibold">{r.title}</p>
                    <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-muted">{r.reason}</p>
                    <div className="mt-1.5 flex gap-3 text-[11px] text-muted">
                      <span>~{r.estimatedMonths} {tr.monthsSuffix}</span>
                      <span>
                        {tr.entryLabel}{' '}
                        {tr[`entry${r.entryDifficulty}` as 'entryEASY' | 'entryMEDIUM' | 'entryHARD'] ?? r.entryDifficulty.toLowerCase()}
                      </span>
                    </div>
                  </div>
                  <button
                    className="btn-primary px-4 py-2 text-sm"
                    onClick={() => router.push(`/roadmap?role=${encodeURIComponent(r.title)}`)}
                  >
                    {tr.chooseThis} <ArrowRight className="h-4 w-4" />
                  </button>
                </motion.div>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button className="btn-ghost px-5 py-2.5 text-sm" onClick={() => router.push('/roadmap')}>
                {tr.browseCatalog}
              </button>
              <button
                className="btn-ghost px-5 py-2.5 text-sm"
                onClick={() => { setStep(0); setAnswers({}); setMode('test'); }}
              >
                {tr.retakeButton}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
