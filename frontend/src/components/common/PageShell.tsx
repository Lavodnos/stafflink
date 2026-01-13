import type { ReactNode } from 'react';

type PageShellProps = {
  children: ReactNode;
};

export function PageShell({ children }: PageShellProps) {
  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 text-gray-900 dark:bg-gray-900 dark:text-white">
      <div className="mx-auto max-w-(--breakpoint-2xl) space-y-6">{children}</div>
    </main>
  );
}
