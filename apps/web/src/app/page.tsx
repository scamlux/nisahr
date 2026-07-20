'use client';

import { useRef } from 'react';
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
import { InteractiveGrid } from '@/components/interactive-grid';
import { LandingNav } from '@/components/marketing/landing-nav';
import { Reveal, RevealGroup, RevealItem } from '@/components/ui/reveal';
import { WordsReveal } from '@/components/ui/animated-text';
import { useParallax } from '@/lib/gsap';
import { useI18n } from '@/lib/i18n';

const stepIcons = [MessagesSquare, Map, GraduationCap];
const featureIcons = [MessagesSquare, Map, GraduationCap, LineChart, Mic, Sparkles];

export default function LandingPage() {
  const { t } = useI18n();
  const heroRef = useRef<HTMLElement>(null);

  // GSAP (ScrollTrigger, wired to Lenis in <SmoothScroll>) drives a subtle
  // scroll-linked parallax on the decorative hero blobs — no-op under reduced motion.
  useParallax(heroRef, { selector: '.hero-blob', yPercent: 32 });

  const steps = [
    { icon: stepIcons[0], title: t.how.step1Title, body: t.how.step1Body },
    { icon: stepIcons[1], title: t.how.step2Title, body: t.how.step2Body },
    { icon: stepIcons[2], title: t.how.step3Title, body: t.how.step3Body },
  ];

  return (
    <SmoothScroll>
      <InteractiveGrid />
      <LandingNav />

      {/* ───────────────── HERO ───────────────── */}
      <section
        ref={heroRef}
        className="relative mx-auto max-w-3xl px-6 pb-20 pt-36 text-center sm:pt-44"
      >
        {/* Decorative parallax blobs (GSAP ScrollTrigger) */}
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <span className="hero-blob aurora-blob left-[10%] top-4 h-56 w-56 bg-primary/30 sm:h-72 sm:w-72" />
          <span className="hero-blob aurora-blob right-[8%] top-24 h-52 w-52 bg-accent/25 sm:h-64 sm:w-64" />
        </div>

        <motion.span
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-1.5 text-xs font-medium text-muted"
        >
          <Sparkles className="h-3.5 w-3.5 text-primary" /> {t.hero.badge}
        </motion.span>

        <h1 className="mx-auto mt-7 font-display text-[2.5rem] font-bold leading-[1.08] tracking-[-0.02em] sm:text-6xl">
          <WordsReveal
            trigger="mount"
            segments={[
              { text: t.hero.from },
              { text: t.hero.titleQuestion, className: 'text-muted' },
              { break: true, text: '' },
              { text: t.hero.to },
              { text: t.hero.titleAnswer, className: 'text-primary' },
            ]}
          />
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted"
        >
          {t.hero.subtitle}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.62, ease: [0.16, 1, 0.3, 1] }}
          className="mt-9 flex flex-wrap items-center justify-center gap-3"
        >
          <Link href="/register" className="btn-primary px-6 py-3 text-base">
            {t.hero.ctaPrimary} <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/login" className="btn-ghost px-6 py-3 text-base">
            {t.hero.ctaSecondary}
          </Link>
        </motion.div>
      </section>

      {/* ───────────────── HOW IT WORKS ───────────────── */}
      <section id="how" className="mx-auto mt-16 max-w-5xl border-t border-border px-6 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            <WordsReveal segments={[{ text: t.how.title }]} />
          </h2>
          <Reveal delay={0.1}>
            <p className="mt-4 text-lg text-muted">{t.how.subtitle}</p>
          </Reveal>
        </div>
        <RevealGroup className="mt-14 grid gap-10 md:grid-cols-3">
          {steps.map((step, i) => (
            <RevealItem key={step.title}>
              <div className="mb-5 flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-surface-2 text-primary">
                  <step.icon className="h-5 w-5" />
                </span>
                <span className="font-mono text-sm text-muted">0{i + 1}</span>
              </div>
              <h3 className="font-display text-xl font-bold">{step.title}</h3>
              <p className="mt-2.5 text-[15px] leading-relaxed text-muted">{step.body}</p>
            </RevealItem>
          ))}
        </RevealGroup>
      </section>

      {/* ───────────────── FEATURES ───────────────── */}
      <section id="features" className="mx-auto max-w-6xl border-t border-border px-6 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            <WordsReveal
              segments={[
                { text: t.features.title },
                { text: t.features.titleAccent, className: 'text-primary' },
              ]}
            />
          </h2>
          <Reveal delay={0.1}>
            <p className="mt-4 text-lg text-muted">{t.features.subtitle}</p>
          </Reveal>
        </div>
        <RevealGroup className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {t.features.items.map((f, i) => {
            const Icon = featureIcons[i] ?? Sparkles;
            return (
              <RevealItem
                key={f.title}
                className="rounded-2xl border border-border bg-surface p-6 transition-colors hover:border-primary/40"
              >
                <span className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-surface-2 text-primary">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="font-display text-lg font-bold">{f.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-muted">{f.body}</p>
              </RevealItem>
            );
          })}
        </RevealGroup>
      </section>

      {/* ───────────────── CLOSING CTA ───────────────── */}
      <section className="mx-auto max-w-5xl border-t border-border px-6 py-28">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold leading-[1.12] tracking-tight sm:text-5xl">
            <WordsReveal segments={[{ text: t.ctaBand.title }]} />
          </h2>
          <Reveal delay={0.1}>
            <p className="mx-auto mt-5 max-w-xl text-lg text-muted">{t.ctaBand.subtitle}</p>
          </Reveal>
          <Reveal delay={0.18}>
            <Link href="/register" className="btn-primary mt-8 px-7 py-3.5 text-base">
              {t.ctaBand.button} <ArrowRight className="h-4 w-4" />
            </Link>
          </Reveal>
        </div>
      </section>

      <footer className="border-t border-border px-6 py-12">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-sm text-muted sm:flex-row">
          <div className="flex items-center gap-2 font-display font-semibold text-fg">
            <Compass className="h-4 w-4 text-primary" /> CareerOS
          </div>
          <p>© 2026 CareerOS. {t.footer.tagline}</p>
        </div>
      </footer>
    </SmoothScroll>
  );
}
