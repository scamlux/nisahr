'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import {
  PlayCircle, Check, Award, X, BookOpen, FileQuestion, Loader2, GraduationCap,
} from 'lucide-react';
import { api, apiError } from '@/lib/api';
import { PageHeader } from '@/components/app/page-header';
import { Reveal } from '@/components/ui/reveal';
import { CardSkeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/toast';
import { cn } from '@/lib/utils';
import { useI18n } from '@/lib/i18n';

export default function LearningPage() {
  const { t } = useI18n();
  const [openCourse, setOpenCourse] = useState<string | null>(null);

  const { data: courses, isLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: async () => (await api.get('/learning/courses')).data,
  });
  const { data: certificates } = useQuery({
    queryKey: ['certificates'],
    queryFn: async () => (await api.get('/learning/certificates')).data,
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 lg:px-8">
      <PageHeader title={t.pages.learning.title} subtitle={t.pages.learning.subtitle} />

      {certificates?.length > 0 && (
        <Reveal className="mb-8">
          <p className="mb-3 flex items-center gap-2 text-sm font-medium"><Award className="h-4 w-4 text-warning" /> {t.pages.learning.yourCertificates}</p>
          <div className="flex flex-wrap gap-3">
            {certificates.map((c: any) => (
              <div key={c.id} className="card flex items-center gap-3 p-3 pr-5">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-gradient-to-br from-warning/30 to-primary/30 text-warning">
                  <Award className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium">{c.course.title}</p>
                  <p className="text-xs text-muted">#{c.serial.slice(-8)}</p>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      )}

      {isLoading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"><CardSkeleton /><CardSkeleton /><CardSkeleton /></div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {courses?.map((c: any, i: number) => (
            <motion.button
              key={c.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ delay: Math.min(i, 5) * 0.05 }}
              onClick={() => setOpenCourse(c.id)}
              className="card group overflow-hidden p-0 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-glow"
            >
              <div className="relative h-32 w-full overflow-hidden" style={{ background: `linear-gradient(135deg, ${c.coverColor}, rgb(var(--surface-2)))` }}>
                <div className="absolute inset-0 grid place-items-center">
                  <BookOpen className="h-10 w-10 text-white/80 transition-transform group-hover:scale-110" />
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-display font-semibold">{c.title}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-muted">{c.description}</p>
                <div className="mt-3 flex gap-3 text-xs text-muted">
                  <span>{c._count.lessons} {t.pages.learning.lessonsUnit}</span>
                  <span>{c._count.quizzes} {t.pages.learning.quizUnit}</span>
                  <span>{t.pages.learning.instructorBy} {c.instructor.name.split(' ')[0]}</span>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      )}

      <AnimatePresence>
        {openCourse && <CourseModal courseId={openCourse} onClose={() => setOpenCourse(null)} />}
      </AnimatePresence>
    </div>
  );
}

function CourseModal({ courseId, onClose }: { courseId: string; onClose: () => void }) {
  const { t } = useI18n();
  const qc = useQueryClient();
  const [activeLesson, setActiveLesson] = useState(0);
  const [enrolling, setEnrolling] = useState(false);
  const [quizMode, setQuizMode] = useState(false);

  const { data: course } = useQuery({
    queryKey: ['course', courseId],
    queryFn: async () => (await api.get(`/learning/courses/${courseId}`)).data,
  });
  const { data: enrollments } = useQuery({
    queryKey: ['enrollments'],
    queryFn: async () => (await api.get('/learning/enrollments')).data,
  });

  const enrollment = enrollments?.find((e: any) => e.courseId === courseId);
  const completedLessonIds: string[] = enrollment?.completedLessonIds ?? [];

  async function enroll() {
    setEnrolling(true);
    try {
      await api.post(`/learning/courses/${courseId}/enroll`);
      qc.invalidateQueries({ queryKey: ['enrollments'] });
      toast.success(t.pages.learning.toastEnrolled);
    } catch (err) { toast.error(apiError(err)); } finally { setEnrolling(false); }
  }

  async function completeLesson(lessonId: string) {
    try {
      const { data } = await api.post(`/learning/courses/${courseId}/lessons/${lessonId}/complete`);
      qc.invalidateQueries({ queryKey: ['enrollments'] });
      qc.invalidateQueries({ queryKey: ['certificates'] });
      if (data.certificate) toast.success(t.pages.learning.toastCourseComplete);
      else toast.success(t.pages.learning.toastLessonCompleted);
    } catch (err) { toast.error(apiError(err)); }
  }

  const lesson = course?.lessons?.[activeLesson];

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[80] grid place-items-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="glass flex h-[80vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl"
      >
        {!course ? (
          <div className="grid flex-1 place-items-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : (
          <>
            <div className="flex items-center justify-between border-b border-border/60 p-5">
              <div>
                <h2 className="font-display text-xl font-bold">{course.title}</h2>
                <p className="text-sm text-muted">{enrollment ? <>{enrollment.progressPct}{t.pages.learning.percentComplete}</> : t.pages.learning.notEnrolled}</p>
              </div>
              <button onClick={onClose} className="text-muted hover:text-fg"><X className="h-5 w-5" /></button>
            </div>

            {!enrollment ? (
              <div className="grid flex-1 place-items-center p-8 text-center">
                <div>
                  <GraduationCap className="mx-auto mb-4 h-12 w-12 text-primary" />
                  <p className="mb-1 font-medium">{course.description}</p>
                  <p className="mb-6 text-sm text-muted">{course.lessons.length} {t.pages.learning.lessonsUnit} · {course.quizzes.length} {t.pages.learning.quizUnit}</p>
                  <button className="btn-primary" onClick={enroll} disabled={enrolling}>
                    {enrolling ? <Loader2 className="h-4 w-4 animate-spin" /> : t.pages.learning.enrollNow}
                  </button>
                </div>
              </div>
            ) : quizMode && course.quizzes[0] ? (
              <Quiz quiz={course.quizzes[0]} onExit={() => setQuizMode(false)} />
            ) : (
              <div className="flex flex-1 flex-col overflow-hidden sm:flex-row">
                {/* lesson list */}
                <div className="max-h-40 w-full shrink-0 overflow-y-auto border-b border-border/60 p-3 sm:max-h-none sm:w-64 sm:border-b-0 sm:border-r">
                  {course.lessons.map((l: any, i: number) => {
                    const done = completedLessonIds.includes(l.id);
                    return (
                      <button
                        key={l.id}
                        onClick={() => setActiveLesson(i)}
                        className={cn('flex w-full items-center gap-2 rounded-lg p-2.5 text-left text-sm', activeLesson === i ? 'bg-primary/10 text-primary' : 'text-muted hover:bg-surface-2')}
                      >
                        <span className={cn('grid h-5 w-5 shrink-0 place-items-center rounded-full text-[10px]', done ? 'bg-success text-white' : 'border border-border')}>
                          {done ? <Check className="h-3 w-3" /> : i + 1}
                        </span>
                        <span className="line-clamp-1">{l.title}</span>
                      </button>
                    );
                  })}
                  {course.quizzes[0] && (
                    <button onClick={() => setQuizMode(true)} className="mt-2 flex w-full items-center gap-2 rounded-lg p-2.5 text-left text-sm text-muted hover:bg-surface-2">
                      <FileQuestion className="h-4 w-4" /> {course.quizzes[0].title}
                    </button>
                  )}
                </div>
                {/* lesson player */}
                <div className="flex-1 overflow-y-auto p-6">
                  <div className="mb-4 grid aspect-video place-items-center rounded-2xl bg-black/40">
                    <PlayCircle className="h-16 w-16 text-white/40" />
                  </div>
                  <h3 className="font-display text-lg font-semibold">{lesson?.title}</h3>
                  <p className="mt-2 text-sm text-muted">{lesson?.content}</p>
                  <button
                    className="btn-primary mt-5"
                    onClick={() => completeLesson(lesson.id)}
                    disabled={completedLessonIds.includes(lesson?.id)}
                  >
                    {completedLessonIds.includes(lesson?.id) ? <><Check className="h-4 w-4" /> {t.pages.learning.completed}</> : t.pages.learning.markComplete}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </motion.div>
    </motion.div>
  );
}

function Quiz({ quiz, onExit }: { quiz: any; onExit: () => void }) {
  const { t } = useI18n();
  const [answers, setAnswers] = useState<number[]>(Array(quiz.questions.length).fill(-1));
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    try {
      const { data } = await api.post(`/learning/quizzes/${quiz.id}/submit`, { answers });
      setResult(data);
    } catch (err) { toast.error(apiError(err)); } finally { setLoading(false); }
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <button onClick={onExit} className="mb-4 text-sm text-muted hover:text-fg">← {t.pages.learning.backToLessons}</button>
      <h3 className="mb-5 font-display text-lg font-semibold">{quiz.title}</h3>
      <div className="space-y-5">
        {quiz.questions.map((q: any, qi: number) => (
          <div key={q.id}>
            <p className="mb-2 font-medium">{qi + 1}. {q.prompt}</p>
            <div className="grid gap-2">
              {q.options.map((opt: string, oi: number) => {
                const picked = answers[qi] === oi;
                const correct = result && oi === q.correctIndex;
                const wrong = result && picked && oi !== q.correctIndex;
                return (
                  <button
                    key={oi}
                    disabled={!!result}
                    onClick={() => setAnswers((a) => a.map((v, i) => (i === qi ? oi : v)))}
                    className={cn(
                      'rounded-xl border px-4 py-2.5 text-left text-sm transition-all',
                      correct && 'border-success bg-success/10 text-success',
                      wrong && 'border-danger bg-danger/10 text-danger',
                      !result && picked && 'border-primary bg-primary/10 text-primary',
                      !result && !picked && 'border-border hover:border-primary/40',
                    )}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      {!result ? (
        <button className="btn-primary mt-6" onClick={submit} disabled={loading || answers.includes(-1)}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t.pages.learning.submitQuiz}
        </button>
      ) : (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className={cn('mt-6 rounded-2xl border p-5 text-center', result.passed ? 'border-success/40 bg-success/10' : 'border-warning/40 bg-warning/10')}>
          <p className="font-display text-3xl font-bold">{result.score}%</p>
          <p className="mt-1 text-sm text-muted">{result.correct}/{result.total} {t.pages.learning.correctLabel} — {result.passed ? t.pages.learning.passed : t.pages.learning.keepPracticing}</p>
        </motion.div>
      )}
    </div>
  );
}
