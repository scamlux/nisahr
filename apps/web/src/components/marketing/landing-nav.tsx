'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Compass } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { LangSwitcher } from '@/components/ui/lang-switcher';

export function LandingNav() {
  const { t } = useI18n();

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4"
    >
      <nav className="glass flex w-full max-w-6xl items-center justify-between rounded-2xl px-4 py-2.5">
        <Link href="/" className="flex items-center gap-2 font-display font-semibold">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-primary to-accent text-primary-fg">
            <Compass className="h-4 w-4" />
          </span>
          CareerOS
        </Link>
        <div className="hidden items-center gap-7 text-sm text-muted md:flex">
          <a href="#how" className="transition-colors hover:text-fg">{t.nav.howItWorks}</a>
          <a href="#features" className="transition-colors hover:text-fg">{t.nav.features}</a>
          <a href="#pricing" className="transition-colors hover:text-fg">{t.nav.pricing}</a>
        </div>
        <div className="flex items-center gap-2">
          <LangSwitcher />
          <ThemeToggle />
          <Link href="/login" className="btn-ghost hidden sm:inline-flex">{t.nav.signIn}</Link>
          <Link href="/register" className="btn-primary">{t.nav.getStarted}</Link>
        </div>
      </nav>
    </motion.header>
  );
}
