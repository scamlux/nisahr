import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Вход',
  description: 'Войдите в CareerOS, чтобы продолжить свой карьерный путь.',
  alternates: { canonical: '/login' },
  openGraph: { url: '/login', title: 'Вход · CareerOS' },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
