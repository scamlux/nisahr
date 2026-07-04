'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/lib/theme';
import { useI18n } from '@/lib/i18n';
import { useMounted } from '@/lib/hooks';

export function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, toggle } = useTheme();
  const { t } = useI18n();
  const mounted = useMounted();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? t.ui.lightMode : t.ui.darkMode}
      title={isDark ? t.ui.lightMode : t.ui.darkMode}
      className={`group relative grid h-9 w-9 place-items-center rounded-xl border border-border bg-surface/60 text-muted transition-all hover:text-fg hover:bg-surface-2 active:scale-95 ${className}`}
    >
      {/* Avoid an icon flash before the theme is read from the DOM. */}
      <Sun
        className={`h-4 w-4 transition-all duration-300 ${
          mounted && !isDark ? 'rotate-0 scale-100 opacity-100' : 'absolute rotate-90 scale-0 opacity-0'
        }`}
      />
      <Moon
        className={`h-4 w-4 transition-all duration-300 ${
          mounted && isDark ? 'rotate-0 scale-100 opacity-100' : 'absolute -rotate-90 scale-0 opacity-0'
        }`}
      />
    </button>
  );
}
