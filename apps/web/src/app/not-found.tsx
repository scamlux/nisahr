import Link from 'next/link';
import { Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center p-6 text-center">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="aurora-blob left-1/2 top-1/3 h-[30rem] w-[30rem] -translate-x-1/2 bg-primary/30" />
      </div>
      <div>
        <div className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-primary to-accent text-primary-fg">
          <Compass className="h-8 w-8" />
        </div>
        <h1 className="font-display text-7xl font-bold gradient-text">404</h1>
        <p className="mt-2 text-muted">This path isn’t on your roadmap yet.</p>
        <Link href="/" className="btn-primary mt-6">Back to CareerOS</Link>
      </div>
    </div>
  );
}
