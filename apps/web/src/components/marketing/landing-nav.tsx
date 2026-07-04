'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Compass } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { LangSwitcher } from '@/components/ui/lang-switcher';

export function LandingNav() {
  const { t } = useI18n();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled
          ? 'border-b border-border/60 bg-bg/70 backdrop-blur-xl backdrop-saturate-150'
          : 'border-b border-transparent bg-transparent'
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2 font-display text-[15px] font-semibold tracking-tight">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-primary to-accent text-primary-fg">
            <Compass className="h-4 w-4" />
          </span>
          CareerOS
        </Link>

        <div className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-9 text-sm text-muted md:flex">
          <a href="#how" className="transition-colors hover:text-fg">{t.nav.howItWorks}</a>
          <a href="#features" className="transition-colors hover:text-fg">{t.nav.features}</a>
          <a href="#pricing" className="transition-colors hover:text-fg">{t.nav.pricing}</a>
        </div>

        <div className="flex items-center gap-2">
          <LangSwitcher />
          <ThemeToggle />
          <Link href="/login" className="btn-ghost hidden h-9 px-3.5 sm:inline-flex">{t.nav.signIn}</Link>
          <Link href="/register" className="btn-primary h-9 px-4">{t.nav.getStarted}</Link>
        </div>
      </nav>
    </motion.header>
  );
}
