'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft, ArrowRight, CheckCircle2, Clock, GraduationCap, Loader2, RotateCcw, Trophy, XCircle,
} from 'lucide-react';
import { api, apiError } from '@/lib/api';
import { toast } from '@/components/ui/toast';
import { useI18n } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { Certificate, type CertificateData } from '@/components/assessment/certificate';

interface Question { id: string; prompt: string; options: string[]; topic: string }
interface StartResp {
  alreadyPassed: boolean;
  attemptId?: string;
  role?: string;
  questions?: Question[];
  total?: number;
  passThreshold?: number;
  remainingSec?: number;
  certificate?: CertificateData;
}
interface SubmitResp {
  status: 'PASSED' | 'FAILED';
  score: number;
  correct: number;
  total: number;
  passThreshold: number;
  breakdown: { topic: string; correct: number; total: number }[];
  feedback: string;
  certificate: CertificateData | null;
}

type Mode = 'loading' | 'intro' | 'quiz' | 'result';

export default function AssessmentPage() {
  const { roadmapId } = useParams<{ roadmapId: string }>();
  const router = useRouter();
  const { t } = useI18n();
  const tr = t.pages.assessment;

  const [mode, setMode] = useState<Mode>('loading');
  const [starting, setStarting] = useState(false);
  const [attempt, setAttempt] = useState<StartResp | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [current, setCurrent] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [result, setResult] = useState<SubmitResp | null>(null);
  const [cert, setCert] = useState<CertificateData | null>(null);
  const submittingRef = useRef(false);

  // Load existing state: already-passed → show certificate.
  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get(`/assessments/status/${roadmapId}`);
        if (data.certificate) {
          setCert(data.certificate);
          setMode('result');
        } else {
          setMode('intro');
        }
      } catch (err) {
        toast.error(apiError(err));
        setMode('intro');
      }
    })();
  }, [roadmapId]);

  const questions = attempt?.questions ?? [];

  const submit = useCallback(
    async (auto = false) => {
      if (submittingRef.current || !attempt?.attemptId) return;
      submittingRef.current = true;
      try {
        const payload = Object.entries(answers).map(([questionId, selectedIndex]) => ({ questionId, selectedIndex }));
        const { data } = await api.post<SubmitResp>(`/assessments/${attempt.attemptId}/submit`, {
          answers: payload.length ? payload : [{ questionId: questions[0]?.id ?? 'x', selectedIndex: 0 }],
        });
        setResult(data);
        setCert(data.certificate);
        setMode('result');
        if (data.status === 'PASSED') toast.success(tr.toastPassed);
      } catch (err) {
        toast.error(apiError(err, auto ? tr.toastExpired : undefined));
        setMode('intro');
      } finally {
        submittingRef.current = false;
      }
    },
    [attempt, answers, questions, tr],
  );

  // Countdown timer; auto-submit at zero.
  useEffect(() => {
    if (mode !== 'quiz') return;
    if (remaining <= 0) {
      submit(true);
      return;
    }
    const id = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(id);
  }, [mode, remaining, submit]);

  async function start() {
    setStarting(true);
    try {
      const { data } = await api.post<StartResp>('/assessments/start', { roadmapId });
      if (data.alreadyPassed && data.certificate) {
        setCert(data.certificate);
        setMode('result');
        return;
      }
      setAttempt(data);
      setAnswers({});
      setCurrent(0);
      setRemaining(data.remainingSec ?? 900);
      setMode('quiz');
    } catch (err) {
      toast.error(apiError(err));
    } finally {
      setStarting(false);
    }
  }

  const answeredCount = Object.keys(answers).length;
  const verifyUrl = useMemo(() => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    return cert?.verifyToken ? `${origin}/verify/${cert.verifyToken}` : origin;
  }, [cert]);

  const certLabels = {
    title: tr.certTitle, presentedTo: tr.certPresentedTo, completed: tr.certCompleted,
    score: tr.certScore, serial: tr.certSerial, issued: tr.certIssued,
    verifyHint: tr.certVerifyHint, download: tr.certDownload, verified: tr.certVerified,
  };

  if (mode === 'loading') {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 lg:px-8">
      <button onClick={() => router.push('/roadmap')} className="btn-ghost mb-6 !px-2 text-sm">
        <ArrowLeft className="h-4 w-4" /> {tr.backToRoadmap}
      </button>

      <AnimatePresence mode="wait">
        {mode === 'intro' && (
          <motion.div key="intro" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="card p-8 text-center">
            <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 text-primary">
              <GraduationCap className="h-8 w-8" />
            </div>
            <h1 className="font-display text-2xl font-bold">{tr.introTitle}</h1>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted">{tr.introSubtitle}</p>
            <ul className="mx-auto mt-5 max-w-sm space-y-2 text-left text-sm text-muted">
              <li className="flex items-center gap-2"><Clock className="h-4 w-4 text-primary" /> {tr.introRuleTime}</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> {tr.introRulePass}</li>
              <li className="flex items-center gap-2"><Trophy className="h-4 w-4 text-primary" /> {tr.introRuleCert}</li>
            </ul>
            <button onClick={start} disabled={starting} className="btn-primary mt-7">
              {starting ? <Loader2 className="h-4 w-4 animate-spin" /> : tr.startButton}
            </button>
          </motion.div>
        )}

        {mode === 'quiz' && questions.length > 0 && (
          <motion.div key="quiz" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <QuizView
              questions={questions}
              current={current}
              answers={answers}
              remaining={remaining}
              answeredCount={answeredCount}
              onSelect={(qid, idx) => setAnswers((a) => ({ ...a, [qid]: idx }))}
              onPrev={() => setCurrent((c) => Math.max(0, c - 1))}
              onNext={() => setCurrent((c) => Math.min(questions.length - 1, c + 1))}
              onSubmit={() => submit(false)}
              submitting={submittingRef.current}
              tr={tr}
            />
          </motion.div>
        )}

        {mode === 'result' && (
          <motion.div key="result" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {cert ? (
              <div className="space-y-6">
                {result?.status === 'PASSED' && <Celebration />}
                <div className="text-center">
                  <h1 className="font-display text-2xl font-bold">{tr.passedTitle}</h1>
                  {result && <p className="mt-1 text-sm text-muted">{result.feedback}</p>}
                </div>
                <Certificate cert={cert} verifyUrl={verifyUrl} labels={certLabels} />
              </div>
            ) : result ? (
              <FailView result={result} tr={tr} onRetry={start} retrying={starting} />
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function QuizView({
  questions, current, answers, remaining, answeredCount, onSelect, onPrev, onNext, onSubmit, submitting, tr,
}: {
  questions: Question[]; current: number; answers: Record<string, number>; remaining: number;
  answeredCount: number; onSelect: (qid: string, idx: number) => void; onPrev: () => void;
  onNext: () => void; onSubmit: () => void; submitting: boolean; tr: Record<string, string>;
}) {
  const q = questions[current];
  const isLast = current === questions.length - 1;
  const mm = String(Math.floor(remaining / 60)).padStart(2, '0');
  const ss = String(remaining % 60).padStart(2, '0');
  const low = remaining <= 60;

  return (
    <div className="card p-6">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm text-muted">{tr.questionLabel} {current + 1} / {questions.length}</span>
        <span className={cn('flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-sm tabular-nums', low ? 'bg-danger/10 text-danger' : 'bg-surface-2 text-muted')}>
          <Clock className="h-3.5 w-3.5" /> {mm}:{ss}
        </span>
      </div>
      <div className="mb-5 h-1.5 overflow-hidden rounded-full bg-surface-2">
        <motion.div className="h-full rounded-full bg-primary" animate={{ width: `${((current + 1) / questions.length) * 100}%` }} />
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={q.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
          <span className="chip mb-2 border-primary/20 bg-primary/5 text-[10px] uppercase tracking-wide text-primary">{q.topic}</span>
          <h2 className="font-display text-lg font-semibold leading-snug">{q.prompt}</h2>
          <div className="mt-4 space-y-2">
            {q.options.map((opt, idx) => {
              const selected = answers[q.id] === idx;
              return (
                <button
                  key={idx}
                  onClick={() => onSelect(q.id, idx)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-all',
                    selected ? 'border-primary bg-primary/10 text-fg' : 'border-border bg-surface-2/40 text-muted hover:border-primary/40 hover:text-fg',
                  )}
                >
                  <span className={cn('grid h-6 w-6 shrink-0 place-items-center rounded-full border text-xs', selected ? 'border-primary bg-primary text-primary-fg' : 'border-border')}>
                    {String.fromCharCode(65 + idx)}
                  </span>
                  {opt}
                </button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="mt-6 flex items-center justify-between">
        <button onClick={onPrev} disabled={current === 0} className="btn-ghost !px-3 text-sm disabled:opacity-40">
          <ArrowLeft className="h-4 w-4" /> {tr.prev}
        </button>
        <span className="text-xs text-muted">{answeredCount} / {questions.length} {tr.answered}</span>
        {isLast ? (
          <button onClick={onSubmit} disabled={submitting} className="btn-primary !px-4 text-sm">
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <>{tr.submit} <CheckCircle2 className="h-4 w-4" /></>}
          </button>
        ) : (
          <button onClick={onNext} className="btn-primary !px-4 text-sm">
            {tr.next} <ArrowRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

function FailView({ result, tr, onRetry, retrying }: { result: SubmitResp; tr: Record<string, string>; onRetry: () => void; retrying: boolean }) {
  return (
    <div className="card p-8 text-center">
      <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-danger/10 text-danger">
        <XCircle className="h-8 w-8" />
      </div>
      <h1 className="font-display text-2xl font-bold">{tr.failedTitle}</h1>
      <p className="mt-1 text-4xl font-bold tabular-nums text-danger">{Math.round(result.score)}%</p>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted">{result.feedback}</p>
      <div className="mx-auto mt-5 max-w-sm space-y-1.5 text-left">
        {result.breakdown.map((b) => (
          <div key={b.topic} className="flex items-center justify-between text-sm">
            <span className="text-muted">{b.topic}</span>
            <span className={cn('tabular-nums', b.correct === b.total ? 'text-success' : 'text-warning')}>{b.correct}/{b.total}</span>
          </div>
        ))}
      </div>
      <button onClick={onRetry} disabled={retrying} className="btn-primary mt-7">
        {retrying ? <Loader2 className="h-4 w-4 animate-spin" /> : <><RotateCcw className="h-4 w-4" /> {tr.retry}</>}
      </button>
    </div>
  );
}

/** Lightweight CSS confetti burst — no dependency. */
function Celebration() {
  const pieces = Array.from({ length: 40 });
  const colors = ['#6366f1', '#22c55e', '#f59e0b', '#ec4899', '#06b6d4'];
  return (
    <div className="pointer-events-none fixed inset-0 z-[90] overflow-hidden">
      {pieces.map((_, i) => (
        <motion.span
          key={i}
          className="absolute top-0 h-2 w-2 rounded-sm"
          style={{ left: `${(i / pieces.length) * 100}%`, backgroundColor: colors[i % colors.length] }}
          initial={{ y: -20, opacity: 1, rotate: 0 }}
          animate={{ y: '100vh', opacity: [1, 1, 0], rotate: 360 * (i % 2 ? 1 : -1) }}
          transition={{ duration: 2.2 + (i % 5) * 0.3, delay: (i % 10) * 0.05, ease: 'easeIn' }}
        />
      ))}
    </div>
  );
}
