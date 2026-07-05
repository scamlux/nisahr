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
import { LandingNav } from '@/components/marketing/landing-nav';
import { Reveal, RevealGroup, RevealItem } from '@/components/ui/reveal';
import { AnimatedNumber } from '@/components/ui/animated-number';
import { useI18n } from '@/lib/i18n';

const stepIcons = [MessagesSquare, Map, GraduationCap];
const featureIcons = [MessagesSquare, Map, GraduationCap, LineChart, Mic, Sparkles];

const statValues = [
  { n: 7, suffix: '' },
  { n: 50, suffix: '+' },
  { n: 100, suffix: '' },
  { n: 5, suffix: '' },
];

export default function LandingPage() {
  const { t } = useI18n();

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
      <section className="mx-auto max-w-3xl px-6 pb-20 pt-36 text-center sm:pt-44">
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-1.5 text-xs font-medium text-muted"
        >
          <Sparkles className="h-3.5 w-3.5 text-primary" /> {t.hero.badge}
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.06, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto mt-7 font-display text-4xl font-semibold leading-[1.1] tracking-[-0.02em] sm:text-6xl"
        >
          {t.hero.from} <span className="text-muted">{t.hero.titleQuestion}</span>
          <br />
          {t.hero.to} <span className="text-primary">{t.hero.titleAnswer}</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.14, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted"
        >
          {t.hero.subtitle}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.22, ease: [0.16, 1, 0.3, 1] }}
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

      {/* ───────────────── STATS ───────────────── */}
      <section className="mx-auto max-w-4xl px-6 pb-8">
        <RevealGroup className="grid grid-cols-2 gap-y-10 md:grid-cols-4">
          {stats.map((stat, i) => (
            <RevealItem
              key={stat.s}
              className={`px-4 text-center ${i > 0 ? 'md:border-l md:border-border' : ''}`}
            >
              <div className="font-display text-4xl font-semibold text-fg sm:text-5xl">
                <AnimatedNumber value={stat.n} suffix={stat.suffix} />
              </div>
              <div className="mt-2 text-sm text-muted">{stat.s}</div>
            </RevealItem>
          ))}
        </RevealGroup>
      </section>

      {/* ───────────────── HOW IT WORKS ───────────────── */}
      <section id="how" className="mx-auto mt-16 max-w-5xl border-t border-border px-6 py-24">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">{t.how.title}</h2>
          <p className="mt-4 text-lg text-muted">{t.how.subtitle}</p>
        </Reveal>
        <RevealGroup className="mt-14 grid gap-10 md:grid-cols-3">
          {steps.map((step, i) => (
            <RevealItem key={step.title}>
              <div className="mb-5 flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-surface-2 text-primary">
                  <step.icon className="h-5 w-5" />
                </span>
                <span className="font-mono text-sm text-muted">0{i + 1}</span>
              </div>
              <h3 className="font-display text-xl font-semibold">{step.title}</h3>
              <p className="mt-2.5 text-[15px] leading-relaxed text-muted">{step.body}</p>
            </RevealItem>
          ))}
        </RevealGroup>
      </section>

      {/* ───────────────── FEATURES ───────────────── */}
      <section id="features" className="mx-auto max-w-6xl border-t border-border px-6 py-24">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            {t.features.title} <span className="text-primary">{t.features.titleAccent}</span>
          </h2>
          <p className="mt-4 text-lg text-muted">{t.features.subtitle}</p>
        </Reveal>
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
                <h3 className="font-display text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-muted">{f.body}</p>
              </RevealItem>
            );
          })}
        </RevealGroup>
      </section>

      {/* ───────────────── PRICING ───────────────── */}
      <section id="pricing" className="mx-auto max-w-4xl border-t border-border px-6 py-24">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">{t.pricing.title}</h2>
          <p className="mt-4 text-lg text-muted">{t.pricing.subtitle}</p>
        </Reveal>
        <RevealGroup className="mx-auto mt-14 grid max-w-3xl gap-5 md:grid-cols-2">
          {plans.map((plan) => (
            <RevealItem
              key={plan.name}
              className={
                plan.highlighted
                  ? 'relative rounded-2xl border-2 border-primary bg-surface p-8'
                  : 'rounded-2xl border border-border bg-surface p-8'
              }
            >
              {plan.highlighted && (
                <span className="absolute -top-3 left-8 inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-fg">
                  <Sparkles className="h-3 w-3" /> {t.pricing.mostPopular}
                </span>
              )}
              <h3 className="font-display text-xl font-semibold">{plan.name}</h3>
              <p className="mt-1.5 text-sm text-muted">{plan.tagline}</p>
              <div className="mt-6 flex items-end gap-1">
                <span className="font-display text-5xl font-semibold">{plan.price}</span>
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
      <section className="mx-auto max-w-5xl border-t border-border px-6 py-28">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-semibold leading-[1.15] tracking-tight sm:text-5xl">
            {t.ctaBand.title}
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg text-muted">{t.ctaBand.subtitle}</p>
          <Link href="/register" className="btn-primary mt-8 px-7 py-3.5 text-base">
            {t.ctaBand.button} <ArrowRight className="h-4 w-4" />
          </Link>
        </Reveal>
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
