'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, Loader2, PartyPopper } from 'lucide-react';
import { api, apiError } from '@/lib/api';
import { useAuth } from '@/lib/store';
import { useI18n } from '@/lib/i18n';
import { toast } from '@/components/ui/toast';
import { cn } from '@/lib/utils';

export default function OnboardingPage() {
  const { t } = useI18n();
  const router = useRouter();
  const setUser = useAuth((s) => s.setUser);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const [interests, setInterests] = useState<string[]>([]);
  const [experienceLevel, setExperienceLevel] = useState('BEGINNER');
  const [currentSkills, setCurrentSkills] = useState<string[]>([]);
  const [goals, setGoals] = useState('');

  const INTERESTS = [
    { value: 'Web', label: t.pages.onboarding.interestWeb },
    { value: 'Design', label: t.pages.onboarding.interestDesign },
    { value: 'Data', label: t.pages.onboarding.interestData },
    { value: 'AI / ML', label: t.pages.onboarding.interestAiMl },
    { value: 'Business', label: t.pages.onboarding.interestBusiness },
    { value: 'People', label: t.pages.onboarding.interestPeople },
    { value: 'Math', label: t.pages.onboarding.interestMath },
    { value: 'Creative', label: t.pages.onboarding.interestCreative },
    { value: 'Systems', label: t.pages.onboarding.interestSystems },
    { value: 'Testing', label: t.pages.onboarding.interestTesting },
  ];
  const SKILLS = [
    { value: 'HTML', label: t.pages.onboarding.skillHtml },
    { value: 'CSS', label: t.pages.onboarding.skillCss },
    { value: 'JavaScript', label: t.pages.onboarding.skillJavascript },
    { value: 'Python', label: t.pages.onboarding.skillPython },
    { value: 'SQL', label: t.pages.onboarding.skillSql },
    { value: 'Figma', label: t.pages.onboarding.skillFigma },
    { value: 'Excel', label: t.pages.onboarding.skillExcel },
    { value: 'React', label: t.pages.onboarding.skillReact },
    { value: 'Statistics', label: t.pages.onboarding.skillStatistics },
    { value: 'Communication', label: t.pages.onboarding.skillCommunication },
  ];
  const LEVELS = [
    { v: 'BEGINNER', label: t.pages.onboarding.levelBeginnerLabel, desc: t.pages.onboarding.levelBeginnerDesc },
    { v: 'JUNIOR', label: t.pages.onboarding.levelJuniorLabel, desc: t.pages.onboarding.levelJuniorDesc },
    { v: 'MID', label: t.pages.onboarding.levelMidLabel, desc: t.pages.onboarding.levelMidDesc },
    { v: 'SENIOR', label: t.pages.onboarding.levelSeniorLabel, desc: t.pages.onboarding.levelSeniorDesc },
  ];

  const toggle = (arr: string[], set: (v: string[]) => void, v: string) =>
    set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  const stepLabels = [
    t.pages.onboarding.stepInterests,
    t.pages.onboarding.stepExperience,
    t.pages.onboarding.stepSkills,
    t.pages.onboarding.stepGoals,
  ];
  const progress = ((step + 1) / stepLabels.length) * 100;

  async function finish() {
    setLoading(true);
    try {
      await api.post('/career/profile', {
        interests,
        experienceLevel,
        currentSkills,
        goals,
      });
      setUser({ onboardingCompleted: true });
      setDone(true);
      setTimeout(() => router.push('/home'), 1600);
    } catch (err) {
      toast.error(apiError(err, t.pages.onboarding.saveError));
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="grid min-h-screen place-items-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass max-w-md rounded-3xl p-10 text-center"
        >
          <motion.div
            initial={{ rotate: -20, scale: 0 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 12 }}
            className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-primary to-accent text-primary-fg"
          >
            <PartyPopper className="h-8 w-8" />
          </motion.div>
          <h1 className="font-display text-2xl font-bold">{t.pages.onboarding.doneTitle}</h1>
          <p className="mt-2 text-muted">{t.pages.onboarding.doneSubtitle}</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="grid min-h-screen place-items-center p-6">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="aurora-blob animate-aurora left-[10%] top-[-10%] h-[34rem] w-[34rem] bg-primary/30" />
        <div className="aurora-blob animate-aurora bottom-[-10%] right-[10%] h-[30rem] w-[30rem] bg-accent/25 [animation-delay:-8s]" />
      </div>

      <div className="glass w-full max-w-2xl rounded-3xl p-8">
        {/* progress */}
        <div className="mb-2 flex justify-between text-xs text-muted">
          <span>
            {t.pages.onboarding.stepLabel} {step + 1} {t.pages.onboarding.ofLabel} {stepLabels.length}
          </span>
          <span>{stepLabels[step]}</span>
        </div>
        <div className="mb-8 h-1.5 overflow-hidden rounded-full bg-surface-2">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
            animate={{ width: `${progress}%` }}
            transition={{ ease: [0.16, 1, 0.3, 1] }}
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3 }}
          >
            {step === 0 && (
              <Section title={t.pages.onboarding.interestsTitle} hint={t.pages.onboarding.interestsHint}>
                <ChipGrid options={INTERESTS} selected={interests} onToggle={(v) => toggle(interests, setInterests, v)} />
              </Section>
            )}
            {step === 1 && (
              <Section title={t.pages.onboarding.experienceTitle} hint={t.pages.onboarding.experienceHint}>
                <div className="grid gap-3 sm:grid-cols-2">
                  {LEVELS.map((l) => (
                    <button
                      key={l.v}
                      onClick={() => setExperienceLevel(l.v)}
                      className={cn(
                        'rounded-xl border p-4 text-left transition-all',
                        experienceLevel === l.v
                          ? 'border-primary bg-primary/10 shadow-glow'
                          : 'border-border bg-surface-2/40 hover:border-primary/40',
                      )}
                    >
                      <div className="font-medium">{l.label}</div>
                      <div className="text-sm text-muted">{l.desc}</div>
                    </button>
                  ))}
                </div>
              </Section>
            )}
            {step === 2 && (
              <Section title={t.pages.onboarding.skillsTitle} hint={t.pages.onboarding.skillsHint}>
                <ChipGrid options={SKILLS} selected={currentSkills} onToggle={(v) => toggle(currentSkills, setCurrentSkills, v)} />
              </Section>
            )}
            {step === 3 && (
              <Section title={t.pages.onboarding.goalsTitle} hint={t.pages.onboarding.goalsHint}>
                <div className="space-y-4">
                  <textarea
                    className="input min-h-[88px] resize-none"
                    placeholder={t.pages.onboarding.goalsPlaceholder}
                    value={goals}
                    onChange={(e) => setGoals(e.target.value)}
                  />
                </div>
              </Section>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="mt-8 flex items-center justify-between">
          <button
            className="btn-ghost disabled:opacity-40"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
          >
            <ArrowLeft className="h-4 w-4" /> {t.pages.onboarding.backButton}
          </button>
          {step < stepLabels.length - 1 ? (
            <button className="btn-primary" onClick={() => setStep((s) => s + 1)}>
              {t.pages.onboarding.continueButton} <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button className="btn-primary" onClick={finish} disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  {t.pages.onboarding.finishButton} <Check className="h-4 w-4" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({ title, hint, children }: { title: string; hint: string; children: React.ReactNode }) {
  return (
    <div>
      <h1 className="font-display text-2xl font-bold">{title}</h1>
      <p className="mt-1 mb-6 text-sm text-muted">{hint}</p>
      {children}
    </div>
  );
}

function ChipGrid({
  options,
  selected,
  onToggle,
  single,
}: {
  options: { value: string; label: string }[];
  selected: string[];
  onToggle: (v: string) => void;
  single?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-2.5">
      {options.map((o) => {
        const active = selected.includes(o.value);
        return (
          <button
            key={o.value}
            onClick={() => onToggle(o.value)}
            className={cn(
              'rounded-full border px-4 py-2 text-sm font-medium transition-all',
              active
                ? 'border-primary bg-primary/15 text-primary shadow-glow'
                : 'border-border bg-surface-2/40 text-muted hover:border-primary/40 hover:text-fg',
            )}
          >
            {active && !single && <Check className="mr-1 inline h-3.5 w-3.5" />}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
