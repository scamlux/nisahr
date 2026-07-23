'use client';

import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, FileText, Loader2, Check, AlertTriangle, Lightbulb, Tags,
} from 'lucide-react';
import type { ResumeReviewResult } from '@careeros/shared';
import { api, apiError } from '@/lib/api';
import { useI18n } from '@/lib/i18n';
import { PageHeader } from '@/components/app/page-header';
import { ProgressRing } from '@/components/ui/progress-ring';
import { InfoHint } from '@/components/ui/info-hint';
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

/** Role option list built from the shared values + localized labels (career block). */
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

export default function ResumeReviewPage() {
  const { t } = useI18n();
  const roleOptions = useRoleOptions();
  const inputRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<File | null>(null);
  const [fileName, setFileName] = useState('');
  const [text, setText] = useState('');
  const [role, setRole] = useState<string>('Frontend Developer');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ResumeReviewResult | null>(null);
  const [dragging, setDragging] = useState(false);

  function pickFile(f: File | undefined | null) {
    if (f) {
      fileRef.current = f;
      setFileName(f.name);
    }
  }

  async function review() {
    if (!fileRef.current && !text.trim()) {
      toast.error(t.pages.resumeReview.uploadRequired);
      return;
    }
    setLoading(true);
    try {
      const form = new FormData();
      if (fileRef.current) form.append('file', fileRef.current);
      if (text.trim()) form.append('text', text);
      form.append('targetRole', role);
      const { data } = await api.post('/resume/review', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(data);
      toast.success(t.pages.resumeReview.analyzed);
    } catch (err) {
      toast.error(apiError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 lg:px-8">
      <PageHeader title={t.pages.resumeReview.pageTitle} subtitle={t.pages.resumeReview.pageSubtitle} />

      <section className="card p-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* input side */}
          <div>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                pickFile(e.dataTransfer.files[0]);
              }}
              onClick={() => inputRef.current?.click()}
              className={cn(
                'flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-colors',
                dragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50',
              )}
            >
              <Upload className="mb-2 h-7 w-7 text-muted" />
              <p className="text-sm font-medium">{fileName || t.pages.resumeReview.dropHint}</p>
              <p className="mt-1 text-xs text-muted">{t.pages.resumeReview.fileTypes}</p>
              <input
                ref={inputRef}
                type="file"
                accept=".pdf,.docx,.txt"
                className="hidden"
                onChange={(e) => pickFile(e.target.files?.[0])}
              />
            </div>
            <textarea
              className="input mt-3 min-h-[120px] resize-none"
              placeholder={t.pages.resumeReview.pastePlaceholder}
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <div className="mt-3 flex flex-wrap items-end gap-3">
              <div>
                <label htmlFor="resume-review-role" className="mb-1.5 block text-xs text-muted">
                  {t.pages.resumeReview.targetRoleLabel}
                </label>
                <select
                  id="resume-review-role"
                  className="input max-w-[220px]"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  {roleOptions.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
              <button className="btn-primary" onClick={review} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t.pages.resumeReview.analyzeButton}
              </button>
            </div>
          </div>

          {/* result side */}
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                className="space-y-4 rounded-2xl border border-border bg-surface-2/40 p-5"
              >
                <div className="flex items-center gap-4">
                  <ProgressRing
                    value={result.overall_score}
                    size={88}
                    stroke={8}
                    label={`${result.overall_score}`}
                    sublabel={t.pages.resumeReview.sublabelScore}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-success">
                      <Check className="h-4 w-4" /> {t.pages.resumeReview.strengthsTitle}
                    </p>
                    <div className="space-y-1.5 text-sm">
                      {result.strengths.map((s) => (
                        <p key={s} className="flex items-start gap-2 text-muted">
                          <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />{s}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <p className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-warning">
                    <AlertTriangle className="h-4 w-4" /> {t.pages.resumeReview.weaknessesTitle}
                  </p>
                  {result.weaknesses.length > 0 ? (
                    <div className="space-y-1.5">
                      {result.weaknesses.map((w) => (
                        <p key={w} className="flex items-start gap-2 text-sm text-muted">
                          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning" />{w}
                        </p>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted">{t.pages.resumeReview.noneFound}</p>
                  )}
                </div>

                <div className="border-t border-border/60 pt-4">
                  <p className="mb-2 flex items-center gap-1.5 text-sm font-medium">
                    <Tags className="h-4 w-4 text-primary" /> {t.pages.resumeReview.missingKeywordsTitle}
                    <InfoHint text={t.pages.resumeReview.missingKeywordsHint} />
                  </p>
                  {result.missing_keywords.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {result.missing_keywords.map((k) => (
                        <span key={k} className="rounded-full border border-primary/30 bg-primary/5 px-2.5 py-0.5 text-xs text-primary">
                          {k}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted">{t.pages.resumeReview.noneFound}</p>
                  )}
                </div>

                {result.rewrite_suggestions.length > 0 && (
                  <div className="border-t border-border/60 pt-4">
                    <p className="mb-1.5 flex items-center gap-1.5 text-sm font-medium">
                      <Lightbulb className="h-4 w-4 text-primary" /> {t.pages.resumeReview.rewriteSuggestionsTitle}
                    </p>
                    <div className="space-y-1.5">
                      {result.rewrite_suggestions.map((s) => (
                        <p key={s} className="flex items-start gap-2 text-sm text-muted">
                          <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />{s}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid place-items-center rounded-2xl border border-border bg-surface-2/30 p-8 text-center text-sm text-muted"
              >
                <div>
                  <FileText className="mx-auto mb-2 h-7 w-7 text-muted" />
                  {t.pages.resumeReview.emptyState}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
}
