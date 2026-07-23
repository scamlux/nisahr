'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MessagesSquare, Map, GraduationCap, LineChart, Briefcase, FileText, User } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  mvpHidden?: boolean;
  mvpOnly?: boolean;
};
import { cn } from '@/lib/utils';
import { useI18n } from '@/lib/i18n';
import { MVP_MODE } from '@/lib/flags';

export function MobileNav() {
  const pathname = usePathname();
  const { t } = useI18n();

  // `mvpHidden` entries drop out in MVP mode; `mvpOnly` entries appear only in
  // MVP mode. Both restored/cleared with NEXT_PUBLIC_MVP_MODE=false. In MVP the
  // bar is Home · Roadmap · Progress · Career · Profile — all sections reachable.
  const items: NavItem[] = [
    { href: '/home', label: t.pages.app.navHomeShort, icon: MessagesSquare },
    { href: '/roadmap', label: t.pages.app.navRoadmap, icon: Map },
    { href: '/learning', label: t.pages.app.navLearningShort, icon: GraduationCap, mvpHidden: true },
    { href: '/progress', label: t.pages.app.navProgress, icon: LineChart },
    { href: '/career', label: t.pages.app.navCareerShort, icon: Briefcase },
    { href: '/resume-review', label: t.pages.app.navResumeReviewShort, icon: FileText, mvpHidden: true },
    { href: '/profile', label: t.pages.app.navProfile, icon: User, mvpOnly: true },
  ].filter((i) => !(MVP_MODE && i.mvpHidden) && !(!MVP_MODE && i.mvpOnly));

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 flex items-center justify-around border-t border-border/60 bg-surface/80 px-2 py-2 backdrop-blur-xl lg:hidden">
      {items.map((i) => {
        const active = pathname === i.href;
        return (
          <Link
            key={i.href}
            href={i.href}
            className={cn('flex flex-col items-center gap-1 rounded-lg px-3 py-1 text-[10px]', active ? 'text-primary' : 'text-muted')}
          >
            <i.icon className="h-5 w-5" />
            {i.label}
          </Link>
        );
      })}
    </nav>
  );
}
