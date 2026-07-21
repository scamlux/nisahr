import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Регистрация',
  description: 'Создайте аккаунт CareerOS и начните путь от «не знаю кем стать» до «получил работу».',
  alternates: { canonical: '/register' },
  openGraph: { url: '/register', title: 'Регистрация · CareerOS' },
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
