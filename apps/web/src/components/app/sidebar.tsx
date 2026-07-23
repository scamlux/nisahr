'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Compass,
  MessagesSquare,
  Map,
  GraduationCap,
  LineChart,
  Briefcase,
  FileText,
  User,
  LogOut,
  BrainCircuit,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

type NavItem = { href: string; label: string; icon: LucideIcon };
import { useAuth } from '@/lib/store';
import { cn, initials } from '@/lib/utils';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { LangSwitcher } from '@/components/ui/lang-switcher';
import { useI18n } from '@/lib/i18n';

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { t } = useI18n();

  // Full funnel: test -> roles -> roadmap -> learning -> progress -> career.
  const nav: NavItem[] = [
    { href: '/home', label: t.pages.app.navHome, icon: MessagesSquare },
    { href: '/psych-test', label: t.pages.app.navPsychTest, icon: BrainCircuit },
    { href: '/roadmap', label: t.pages.app.navRoadmap, icon: Map },
    { href: '/learning', label: t.pages.app.navLearning, icon: GraduationCap },
    { href: '/progress', label: t.pages.app.navProgress, icon: LineChart },
    { href: '/career', label: t.pages.app.navCareer, icon: Briefcase },
    { href: '/resume-review', label: t.pages.app.navResumeReview, icon: FileText },
    { href: '/profile', label: t.pages.app.navProfile, icon: User },
  ];

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border/60 bg-surface/40 p-4 backdrop-blur-xl lg:flex">
      <Link href="/home" className="mb-8 flex items-center gap-2 px-2 pt-2 font-display text-lg font-semibold">
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-primary to-accent text-primary-fg">
          <Compass className="h-5 w-5" />
        </span>
        CareerOS
      </Link>

      <nav className="flex flex-1 flex-col gap-1">
        {nav.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                active ? 'text-fg' : 'text-muted hover:text-fg',
              )}
            >
              {active && (
                <motion.span
                  layoutId="nav-active"
                  className="absolute inset-0 rounded-xl border border-primary/30 bg-primary/10"
                  transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                />
              )}
              <item.icon className="relative h-[18px] w-[18px]" />
              <span className="relative">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-4 flex items-center justify-between gap-2 px-1">
        <LangSwitcher />
        <ThemeToggle />
      </div>

      <div className="mt-3 rounded-2xl border border-border bg-surface-2/50 p-3">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-primary to-accent text-sm font-semibold text-primary-fg">
            {user ? initials(user.name) : '?'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{user?.name}</p>
            <p className="truncate text-xs text-muted">{user?.email}</p>
          </div>
          <button
            onClick={() => {
              logout();
              router.push('/login');
            }}
            className="text-muted transition-colors hover:text-danger"
            title={t.pages.app.signOut}
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
