import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Онбординг',
  description: 'Расскажите о своих интересах и навыках — CareerOS соберёт персональный карьерный маршрут.',
  alternates: { canonical: '/onboarding' },
  openGraph: { url: '/onboarding', title: 'Онбординг · CareerOS' },
};

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
