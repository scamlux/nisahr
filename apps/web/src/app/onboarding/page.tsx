'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, Loader2, PartyPopper } from 'lucide-react';
import { api, apiError } from '@/lib/api';
import { useAuth } from '@/lib/store';
import { toast } from '@/components/ui/toast';
import { cn } from '@/lib/utils';

const INTERESTS = ['Web', 'Design', 'Data', 'AI / ML', 'Business', 'People', 'Math', 'Creative', 'Systems', 'Testing'];
const SKILLS = ['HTML', 'CSS', 'JavaScript', 'Python', 'SQL', 'Figma', 'Excel', 'React', 'Statistics', 'Communication'];
const LEVELS = [
  { v: 'BEGINNER', label: 'Just starting', desc: 'New to the field' },
  { v: 'JUNIOR', label: 'Some basics', desc: '0–1 years' },
  { v: 'MID', label: 'Comfortable', desc: '1–3 years' },
  { v: 'SENIOR', label: 'Experienced', desc: '3+ years' },
];
const WORK_STYLES = ['Remote', 'Hybrid', 'On-site', 'Async', 'Collaborative'];

export default function OnboardingPage() {
  const router = useRouter();
  const setUser = useAuth((s) => s.setUser);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const [interests, setInterests] = useState<string[]>([]);
  const [experienceLevel, setExperienceLevel] = useState('BEGINNER');
  const [currentSkills, setCurrentSkills] = useState<string[]>([]);
  const [goals, setGoals] = useState('');
  const [strengths, setStrengths] = useState('');
  const [weaknesses, setWeaknesses] = useState('');
  const [preferredWorkStyle, setPreferredWorkStyle] = useState('Remote');

  const toggle = (arr: string[], set: (v: string[]) => void, v: string) =>
    set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  const steps = ['Interests', 'Experience', 'Skills', 'Goals'];
  const progress = ((step + 1) / steps.length) * 100;

  async function finish() {
    setLoading(true);
    try {
      await api.post('/career/profile', {
        interests,
        experienceLevel,
        currentSkills,
        goals,
        strengths,
        weaknesses,
        preferredWorkStyle,
      });
      setUser({ onboardingCompleted: true });
      setDone(true);
      setTimeout(() => router.push('/home'), 1600);
    } catch (err) {
      toast.error(apiError(err, 'Could not save profile'));
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
          <h1 className="font-display text-2xl font-bold">You’re all set!</h1>
          <p className="mt-2 text-muted">Building your personalized dashboard…</p>
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
          <span>Step {step + 1} of {steps.length}</span>
          <span>{steps[step]}</span>
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
              <Section title="What are you drawn to?" hint="Pick everything that sparks your interest.">
                <ChipGrid options={INTERESTS} selected={interests} onToggle={(v) => toggle(interests, setInterests, v)} />
              </Section>
            )}
            {step === 1 && (
              <Section title="Where are you right now?" hint="Be honest — this tailors your roadmap pace.">
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
              <Section title="What can you already do?" hint="Select your current skills.">
                <ChipGrid options={SKILLS} selected={currentSkills} onToggle={(v) => toggle(currentSkills, setCurrentSkills, v)} />
              </Section>
            )}
            {step === 3 && (
              <Section title="Tell us your goal" hint="A sentence or two is plenty.">
                <div className="space-y-4">
                  <textarea
                    className="input min-h-[88px] resize-none"
                    placeholder="e.g. Become a frontend developer and land my first job in 6 months"
                    value={goals}
                    onChange={(e) => setGoals(e.target.value)}
                  />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <input className="input" placeholder="Your strengths" value={strengths} onChange={(e) => setStrengths(e.target.value)} />
                    <input className="input" placeholder="Areas to improve" value={weaknesses} onChange={(e) => setWeaknesses(e.target.value)} />
                  </div>
                  <div>
                    <p className="mb-2 text-sm text-muted">Preferred work style</p>
                    <ChipGrid options={WORK_STYLES} selected={[preferredWorkStyle]} onToggle={setPreferredWorkStyle} single />
                  </div>
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
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          {step < steps.length - 1 ? (
            <button className="btn-primary" onClick={() => setStep((s) => s + 1)}>
              Continue <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button className="btn-primary" onClick={finish} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Finish <Check className="h-4 w-4" /></>}
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
  options: string[];
  selected: string[];
  onToggle: (v: string) => void;
  single?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-2.5">
      {options.map((o) => {
        const active = selected.includes(o);
        return (
          <button
            key={o}
            onClick={() => onToggle(o)}
            className={cn(
              'rounded-full border px-4 py-2 text-sm font-medium transition-all',
              active
                ? 'border-primary bg-primary/15 text-primary shadow-glow'
                : 'border-border bg-surface-2/40 text-muted hover:border-primary/40 hover:text-fg',
            )}
          >
            {active && !single && <Check className="mr-1 inline h-3.5 w-3.5" />}
            {o}
          </button>
        );
      })}
    </div>
  );
}
