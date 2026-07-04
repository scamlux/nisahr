'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MessagesSquare, Map, GraduationCap, LineChart, Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';

const items = [
  { href: '/home', label: 'Consult', icon: MessagesSquare },
  { href: '/roadmap', label: 'Roadmap', icon: Map },
  { href: '/learning', label: 'Learn', icon: GraduationCap },
  { href: '/progress', label: 'Progress', icon: LineChart },
  { href: '/career', label: 'Career', icon: Briefcase },
];

export function MobileNav() {
  const pathname = usePathname();
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
