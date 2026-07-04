'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Compass } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  const { t } = useI18n();

  return (
    <div className="relative grid min-h-screen lg:grid-cols-2">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="aurora-blob animate-aurora left-[-10%] top-[-10%] h-[36rem] w-[36rem] bg-primary/40" />
        <div className="aurora-blob animate-aurora bottom-[-10%] right-[-10%] h-[32rem] w-[32rem] bg-accent/30 [animation-delay:-8s]" />
      </div>

      {/* Left: brand panel */}
      <div className="relative hidden flex-col justify-between p-12 lg:flex">
        <Link href="/" className="flex items-center gap-2 font-display text-lg font-semibold">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-primary to-accent text-primary-fg">
            <Compass className="h-5 w-5" />
          </span>
          CareerOS
        </Link>
        <div>
          <h2 className="font-display text-4xl font-bold leading-tight">
            {t.pages.auth.heroTitleLine1}
            <br />
            <span className="gradient-text">{t.pages.auth.heroTitleLine2}</span>
          </h2>
          <p className="mt-4 max-w-sm text-muted">
            {t.pages.auth.heroSubtitle}
          </p>
        </div>
        <p className="text-sm text-muted">{t.pages.auth.copyrightText}</p>
      </div>

      {/* Right: form */}
      <div className="flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="glass w-full max-w-md rounded-3xl p-8"
        >
          <Link href="/" className="mb-6 flex items-center gap-2 font-display font-semibold lg:hidden">
            <Compass className="h-5 w-5 text-primary" /> CareerOS
          </Link>
          <h1 className="font-display text-2xl font-bold">{title}</h1>
          <p className="mt-1 text-sm text-muted">{subtitle}</p>
          <div className="mt-7">{children}</div>
          <div className="mt-6 text-center text-sm text-muted">{footer}</div>
        </motion.div>
      </div>
    </div>
  );
}
