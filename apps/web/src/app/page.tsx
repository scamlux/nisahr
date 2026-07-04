'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Compass,
  MessagesSquare,
  Map,
  GraduationCap,
  LineChart,
  Mic,
  ArrowRight,
  Check,
  Sparkles,
} from 'lucide-react';
import { SmoothScroll } from '@/components/smooth-scroll';
import { HeroCanvas } from '@/components/three/hero-canvas';
import { LandingNav } from '@/components/marketing/landing-nav';
import { ScrollProgress } from '@/components/ui/scroll-progress';
import { Reveal, RevealGroup, RevealItem } from '@/components/ui/reveal';
import { AnimatedNumber } from '@/components/ui/animated-number';

const steps = [
  {
    icon: MessagesSquare,
    title: 'Talk to your AI consultant',
    body: 'Answer a short quiz and chat with an AI-HR consultant that understands your interests, strengths and goals — then recommends roles that actually fit.',
  },
  {
    icon: Map,
    title: 'Get a personalized roadmap',
    body: 'A stage-by-stage plan — skills, curated resources, hands-on projects and milestones — tailored to your level and weekly hours.',
  },
  {
    icon: GraduationCap,
    title: 'Learn, build & track',
    body: 'Follow the learning hub, complete projects, watch your skill heatmap and streak grow, and prep for interviews until you are job-ready.',
  },
];

const features = [
  { icon: MessagesSquare, title: 'AI-HR Consultant', body: 'Career guidance that returns real recommendations and a skill-gap analysis, not generic advice.' },
  { icon: Map, title: 'Roadmap Engine', body: 'Personalized, editable roadmaps with progress rings, milestones and a 3D path view.' },
  { icon: GraduationCap, title: 'Learning Hub', body: 'Curated resources plus an internal LMS with lessons, quizzes and certificates.' },
  { icon: LineChart, title: 'Progress Analytics', body: 'Streaks, weekly hours, skill heatmaps and AI insights into your pace and momentum.' },
  { icon: Mic, title: 'Interview Prep', body: 'Turn-based mock HR, technical and behavioral interviews with scored feedback.' },
  { icon: Sparkles, title: 'Job Readiness', body: 'A single 0–100 score from your skills, roadmap, resume and interview performance.' },
];

const plans = [
  {
    name: 'Free',
    price: '$0',
    tagline: 'Start exploring your path',
    features: ['AI-HR chat (basic)', '1 personalized roadmap', 'Learning hub access', 'Basic progress tracker'],
    cta: 'Start free',
    highlighted: false,
  },
  {
    name: 'Premium',
    price: '$12',
    tagline: 'Everything you need to get hired',
    features: ['Unlimited roadmaps', 'Mock interviews', 'Deep skill-gap analysis', 'AI learning insights', 'Resume review & job readiness', 'Verified certificates'],
    cta: 'Go Premium',
    highlighted: true,
  },
];

export default function LandingPage() {
  return (
    <SmoothScroll>
      <ScrollProgress />
      <LandingNav />

      {/* ambient aurora background */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="aurora-blob animate-aurora left-[-10%] top-[-5%] h-[40rem] w-[40rem] bg-primary/40" />
        <div className="aurora-blob animate-aurora right-[-10%] top-[20%] h-[32rem] w-[32rem] bg-accent/30 [animation-delay:-6s]" />
        <div className="aurora-blob animate-aurora bottom-[-10%] left-[20%] h-[34rem] w-[34rem] bg-primary/20 [animation-delay:-12s]" />
      </div>

      {/* HERO */}
      <section className="relative mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-center px-6 pt-28 text-center">
        <div className="absolute inset-0 -z-10 h-full w-full">
          <HeroCanvas />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="chip mb-6 inline-flex border-primary/30 bg-primary/10 text-primary">
            <Sparkles className="h-3.5 w-3.5" /> AI Career Operating System
          </span>
          <h1 className="mx-auto max-w-4xl font-display text-5xl font-bold leading-[1.05] tracking-tight sm:text-7xl">
            From <span className="text-muted">“what do I become?”</span>
            <br />
            to <span className="gradient-text">“I got the job.”</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted">
            CareerOS guides you the whole way — an AI-HR consultant, a personalized roadmap,
            a learning hub, progress tracking and interview prep, all in one platform.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link href="/register" className="btn-primary px-6 py-3 text-base">
              Start your journey <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/login" className="btn-ghost px-6 py-3 text-base">
              I already have an account
            </Link>
          </div>
        </motion.div>
      </section>

      {/* STATS */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <RevealGroup className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {[
            { n: 7, s: 'Career tracks', suffix: '' },
            { n: 50, s: 'Curated milestones', suffix: '+' },
            { n: 100, s: 'Job-readiness score', suffix: '' },
            { n: 5, s: 'Modules, one OS', suffix: '' },
          ].map((stat) => (
            <RevealItem key={stat.s} className="card p-6 text-center">
              <div className="font-display text-4xl font-bold text-fg">
                <AnimatedNumber value={stat.n} suffix={stat.suffix} />
              </div>
              <div className="mt-1 text-sm text-muted">{stat.s}</div>
            </RevealItem>
          ))}
        </RevealGroup>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="mx-auto max-w-6xl px-6 py-20">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">How CareerOS works</h2>
          <p className="mt-4 text-muted">Three steps from uncertainty to an offer.</p>
        </Reveal>
        <RevealGroup className="mt-14 grid gap-6 md:grid-cols-3">
          {steps.map((step, i) => (
            <RevealItem key={step.title} className="card group relative overflow-hidden p-7">
              <div className="absolute right-5 top-5 font-display text-6xl font-bold text-border/60 transition-colors group-hover:text-primary/30">
                0{i + 1}
              </div>
              <div className="mb-5 grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 text-primary">
                <step.icon className="h-6 w-6" />
              </div>
              <h3 className="font-display text-xl font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{step.body}</p>
            </RevealItem>
          ))}
        </RevealGroup>
      </section>

      {/* FEATURES */}
      <section id="features" className="mx-auto max-w-6xl px-6 py-20">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
            One platform. <span className="gradient-text">Every step.</span>
          </h2>
          <p className="mt-4 text-muted">
            Stop juggling ten tabs. CareerOS is the operating system for your career.
          </p>
        </Reveal>
        <RevealGroup className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <RevealItem
              key={f.title}
              className="card group p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-glow"
            >
              <div className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-surface-2 text-accent transition-colors group-hover:bg-primary/15 group-hover:text-primary">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{f.body}</p>
            </RevealItem>
          ))}
        </RevealGroup>
      </section>

      {/* PRICING */}
      <section id="pricing" className="mx-auto max-w-5xl px-6 py-20">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">Simple pricing</h2>
          <p className="mt-4 text-muted">Start free. Upgrade when you’re ready to get hired.</p>
        </Reveal>
        <RevealGroup className="mt-12 grid gap-6 md:grid-cols-2">
          {plans.map((plan) => (
            <RevealItem
              key={plan.name}
              className={
                plan.highlighted
                  ? 'card relative overflow-hidden border-primary/40 p-8 shadow-glow'
                  : 'card p-8'
              }
            >
              {plan.highlighted && (
                <span className="chip absolute right-6 top-6 border-primary/30 bg-primary/10 text-primary">
                  Most popular
                </span>
              )}
              <h3 className="font-display text-2xl font-bold">{plan.name}</h3>
              <p className="mt-1 text-sm text-muted">{plan.tagline}</p>
              <div className="mt-5 flex items-end gap-1">
                <span className="font-display text-5xl font-bold">{plan.price}</span>
                <span className="mb-1.5 text-muted">/mo</span>
              </div>
              <ul className="mt-6 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm">
                    <Check className="h-4 w-4 shrink-0 text-success" /> {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className={`mt-8 w-full ${plan.highlighted ? 'btn-primary' : 'btn-ghost'} py-3`}
              >
                {plan.cta}
              </Link>
            </RevealItem>
          ))}
        </RevealGroup>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <Reveal>
          <div className="card relative overflow-hidden p-12 text-center">
            <div className="aurora-blob left-1/2 top-0 h-72 w-72 -translate-x-1/2 bg-primary/30" />
            <h2 className="relative font-display text-4xl font-bold tracking-tight sm:text-5xl">
              Your career, finally on autopilot.
            </h2>
            <p className="relative mx-auto mt-4 max-w-xl text-muted">
              Join CareerOS and turn confusion into a clear, trackable plan toward the job you want.
            </p>
            <Link href="/register" className="btn-primary relative mt-8 px-7 py-3 text-base">
              Get started — it’s free <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Reveal>
      </section>

      <footer className="border-t border-border/60 px-6 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-sm text-muted sm:flex-row">
          <div className="flex items-center gap-2 font-display font-semibold text-fg">
            <Compass className="h-4 w-4 text-primary" /> CareerOS
          </div>
          <p>© 2026 CareerOS. Built as a flagship demo.</p>
        </div>
      </footer>
    </SmoothScroll>
  );
}
