import type { ReactNode } from 'react';
import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';

type ShellProps = {
  renderHeader?: (openNav: () => void) => ReactNode;
  children: ReactNode;
};

export function Shell({ renderHeader, children }: ShellProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-white to-gea-blue-deep/10 text-gea-midnight">
      <div className="flex">
        <Sidebar mobileOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
        <div className="flex min-h-screen flex-1 flex-col">
          {renderHeader && renderHeader(() => setMobileNavOpen(true))}
          <main className="flex-1 px-4 py-8">
            <div className="mx-auto w-full max-w-6xl">{children}</div>
          </main>
          <Footer />
        </div>
      </div>
    </div>
  );
}
