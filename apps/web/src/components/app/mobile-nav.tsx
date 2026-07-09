'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MessagesSquare, Map, GraduationCap, LineChart, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useI18n } from '@/lib/i18n';

export function MobileNav() {
  const pathname = usePathname();
  const { t } = useI18n();

  const items = [
    { href: '/home', label: t.pages.app.navHomeShort, icon: MessagesSquare },
    { href: '/roadmap', label: t.pages.app.navRoadmap, icon: Map },
    { href: '/learning', label: t.pages.app.navLearningShort, icon: GraduationCap },
    { href: '/progress', label: t.pages.app.navProgress, icon: LineChart },
    { href: '/profile', label: t.pages.app.navProfile, icon: User },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 flex items-center justify-around border-t border-border/60 bg-surface/80 px-1 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur-xl lg:hidden">
      {items.map((i) => {
        const active = pathname === i.href;
        return (
          <Link
            key={i.href}
            href={i.href}
            className={cn('flex flex-1 flex-col items-center gap-1 rounded-lg px-1 py-1 text-[10px]', active ? 'text-primary' : 'text-muted')}
          >
            <i.icon className="h-5 w-5" />
            {i.label}
          </Link>
        );
      })}
    </nav>
  );
}
