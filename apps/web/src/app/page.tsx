'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
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
import { Reveal, RevealGroup, RevealItem } from '@/components/ui/reveal';
import { AnimatedNumber } from '@/components/ui/animated-number';
import { useI18n } from '@/lib/i18n';

const stepIcons = [MessagesSquare, Map, GraduationCap];
const featureIcons = [MessagesSquare, Map, GraduationCap, LineChart, Mic, Sparkles];
// Bento column spans (lg): a large lead tile, mid pair, then a full-width closer.
const featureSpans = [
  'lg:col-span-3',
  'lg:col-span-3',
  'lg:col-span-2',
  'lg:col-span-2',
  'lg:col-span-2',
  'lg:col-span-6',
];

const statValues = [
  { n: 7, suffix: '' },
  { n: 50, suffix: '+' },
  { n: 100, suffix: '' },
  { n: 5, suffix: '' },
];

export default function LandingPage() {
  const { t } = useI18n();
  const heroRef = useRef<HTMLElement>(null);

  // Genuine scroll-driven motion: hero layers drift and settle as you scroll.
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const ambientY = useTransform(scrollYProgress, [0, 1], [0, 140]);
  const ambientScale = useTransform(scrollYProgress, [0, 1], [1, 1.12]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 64]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  const steps = [
    { icon: stepIcons[0], title: t.how.step1Title, body: t.how.step1Body },
    { icon: stepIcons[1], title: t.how.step2Title, body: t.how.step2Body },
    { icon: stepIcons[2], title: t.how.step3Title, body: t.how.step3Body },
  ];

  const stats = [
    { ...statValues[0], s: t.stats.tracks },
    { ...statValues[1], s: t.stats.milestones },
    { ...statValues[2], s: t.stats.readiness },
    { ...statValues[3], s: t.stats.modules },
  ];

  const plans = [
    { ...t.pricing.free, price: '$0', highlighted: false },
    { ...t.pricing.premium, price: '$12', highlighted: true },
  ];

  return (
    <SmoothScroll>
      <LandingNav />

      {/* ───────────────── HERO ───────────────── */}
      <section
        ref={heroRef}
        className="relative flex min-h-[92vh] flex-col items-center justify-center overflow-hidden px-6 pt-32 text-center"
      >
        <motion.div style={{ y: ambientY, scale: ambientScale }} className="absolute inset-0 -z-10">
          <div className="hero-wash" />
          <div className="dot-grid opacity-70" />
          <div className="absolute inset-0 opacity-[0.55]">
            <HeroCanvas />
          </div>
        </motion.div>

        <motion.div style={{ y: contentY, opacity: contentOpacity }}>
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-surface/50 px-4 py-1.5 text-xs font-medium text-muted backdrop-blur"
          >
            <Sparkles className="h-3.5 w-3.5 text-primary" /> {t.hero.badge}
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="mx-auto mt-7 max-w-4xl font-display text-[2.75rem] font-bold leading-[1.03] tracking-[-0.03em] sm:text-6xl lg:text-[4.75rem]"
          >
            {t.hero.from} <span className="text-muted">{t.hero.titleQuestion}</span>
            <br />
            {t.hero.to} <span className="gradient-text">{t.hero.titleAnswer}</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="mx-auto mt-7 max-w-xl text-lg leading-relaxed text-muted"
          >
            {t.hero.subtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="mt-10 flex flex-wrap items-center justify-center gap-3"
          >
            <Link href="/register" className="btn-primary px-6 py-3 text-base">
              {t.hero.ctaPrimary} <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 px-4 py-3 text-base font-medium text-fg transition-colors hover:text-primary"
            >
              {t.hero.ctaSecondary} <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* ───────────────── STATS ───────────────── */}
      <section className="mx-auto max-w-5xl px-6 py-8">
        <RevealGroup className="grid grid-cols-2 gap-y-10 md:grid-cols-4">
          {stats.map((stat, i) => (
            <RevealItem
              key={stat.s}
              className={`px-4 text-center ${i > 0 ? 'md:border-l md:border-border/60' : ''}`}
            >
              <div className="font-display text-4xl font-bold tracking-tight text-fg sm:text-5xl">
                <AnimatedNumber value={stat.n} suffix={stat.suffix} />
              </div>
              <div className="mt-2 text-sm text-muted">{stat.s}</div>
            </RevealItem>
          ))}
        </RevealGroup>
      </section>

      {/* ───────────────── HOW IT WORKS ───────────────── */}
      <section id="how" className="hairline mx-auto mt-16 max-w-6xl px-6 py-24 sm:py-32">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-5xl">{t.how.title}</h2>
          <p className="mt-5 text-lg text-muted">{t.how.subtitle}</p>
        </Reveal>
        <RevealGroup className="mt-16 grid gap-px overflow-hidden rounded-3xl border border-border/70 bg-border/40 md:grid-cols-3">
          {steps.map((step, i) => (
            <RevealItem key={step.title} className="group relative bg-bg p-8 sm:p-10">
              <div className="mb-6 flex items-center gap-4">
                <span className="icon-chip h-11 w-11">
                  <step.icon className="h-5 w-5" />
                </span>
                <span className="font-mono text-sm text-muted">0{i + 1}</span>
              </div>
              <h3 className="font-display text-xl font-semibold tracking-tight">{step.title}</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-muted">{step.body}</p>
            </RevealItem>
          ))}
        </RevealGroup>
      </section>

      {/* ───────────────── FEATURES (bento) ───────────────── */}
      <section id="features" className="hairline mx-auto max-w-6xl px-6 py-24 sm:py-32">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-5xl">
            {t.features.title} <span className="gradient-text">{t.features.titleAccent}</span>
          </h2>
          <p className="mt-5 text-lg text-muted">{t.features.subtitle}</p>
        </Reveal>
        <RevealGroup className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
          {t.features.items.map((f, i) => {
            const Icon = featureIcons[i] ?? Sparkles;
            const lead = i === 0;
            const wide = i === t.features.items.length - 1;
            return (
              <RevealItem key={f.title} className={featureSpans[i] ?? ''}>
                <div
                  className={`tile flex h-full flex-col p-7 sm:p-8 ${
                    lead ? 'justify-between' : ''
                  } ${wide ? 'sm:flex-row sm:items-center sm:gap-8' : ''}`}
                >
                  <div className={wide ? 'sm:max-w-md' : ''}>
                    <span className="icon-chip mb-5 h-11 w-11">
                      <Icon className="h-5 w-5" />
                    </span>
                    <h3 className="font-display text-lg font-semibold tracking-tight">{f.title}</h3>
                    <p className="mt-2.5 text-[15px] leading-relaxed text-muted">{f.body}</p>
                  </div>
                  {wide && (
                    <div className="mt-6 flex shrink-0 items-end gap-1 sm:mt-0">
                      <span className="font-display text-6xl font-bold tracking-tight text-fg">100</span>
                      <span className="mb-2 text-sm text-muted">/ 100</span>
                    </div>
                  )}
                </div>
              </RevealItem>
            );
          })}
        </RevealGroup>
      </section>

      {/* ───────────────── PRICING ───────────────── */}
      <section id="pricing" className="hairline mx-auto max-w-5xl px-6 py-24 sm:py-32">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-5xl">{t.pricing.title}</h2>
          <p className="mt-5 text-lg text-muted">{t.pricing.subtitle}</p>
        </Reveal>
        <RevealGroup className="mx-auto mt-16 grid max-w-3xl gap-5 md:grid-cols-2">
          {plans.map((plan) => (
            <RevealItem
              key={plan.name}
              className={
                plan.highlighted
                  ? 'relative rounded-3xl border border-primary/45 bg-surface p-8 shadow-[0_30px_80px_-40px_rgb(124_108_255_/_0.55)]'
                  : 'rounded-3xl border border-border/70 bg-surface/60 p-8'
              }
            >
              {plan.highlighted && (
                <span className="absolute -top-3 left-8 inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-fg">
                  <Sparkles className="h-3 w-3" /> {t.pricing.mostPopular}
                </span>
              )}
              <h3 className="font-display text-xl font-bold tracking-tight">{plan.name}</h3>
              <p className="mt-1.5 text-sm text-muted">{plan.tagline}</p>
              <div className="mt-6 flex items-end gap-1">
                <span className="font-display text-5xl font-bold tracking-tight">{plan.price}</span>
                <span className="mb-1.5 text-muted">{t.pricing.perMonth}</span>
              </div>
              <ul className="mt-7 space-y-3.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-[15px]">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" /> {f}
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

      {/* ───────────────── CLOSING CTA ───────────────── */}
      <section className="hairline mx-auto max-w-6xl px-6 py-28 sm:py-36">
        <Reveal className="relative mx-auto max-w-3xl text-center">
          <div className="hero-wash -z-10 rounded-[2.5rem]" />
          <h2 className="font-display text-4xl font-bold leading-[1.05] tracking-[-0.02em] sm:text-6xl">
            {t.ctaBand.title}
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg text-muted">{t.ctaBand.subtitle}</p>
          <Link href="/register" className="btn-primary mt-9 px-7 py-3.5 text-base">
            {t.ctaBand.button} <ArrowRight className="h-4 w-4" />
          </Link>
        </Reveal>
      </section>

      <footer className="hairline px-6 py-12">
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
