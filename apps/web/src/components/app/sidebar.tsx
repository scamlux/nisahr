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
  User,
  LogOut,
  Crown,
} from 'lucide-react';
import { useAuth } from '@/lib/store';
import { cn, initials } from '@/lib/utils';

const nav = [
  { href: '/home', label: 'AI Consultant', icon: MessagesSquare },
  { href: '/roadmap', label: 'Roadmap', icon: Map },
  { href: '/learning', label: 'Learning Hub', icon: GraduationCap },
  { href: '/progress', label: 'Progress', icon: LineChart },
  { href: '/career', label: 'Career Prep', icon: Briefcase },
  { href: '/profile', label: 'Profile', icon: User },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

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

      <div className="mt-4 rounded-2xl border border-border bg-surface-2/50 p-3">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-primary to-accent text-sm font-semibold text-primary-fg">
            {user ? initials(user.name) : '?'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{user?.name}</p>
            <p className="flex items-center gap-1 text-xs text-muted">
              {user?.plan === 'PREMIUM' ? (
                <><Crown className="h-3 w-3 text-warning" /> Premium</>
              ) : (
                'Free plan'
              )}
            </p>
          </div>
          <button
            onClick={() => {
              logout();
              router.push('/login');
            }}
            className="text-muted transition-colors hover:text-danger"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
