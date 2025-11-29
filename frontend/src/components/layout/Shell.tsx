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
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-[#0b1220] dark:text-[#e8eefc]">
      <div className="flex">
        <Sidebar mobileOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
        <div className="flex min-h-screen flex-1 flex-col">
          {renderHeader && renderHeader(() => setMobileNavOpen(true))}
          <main className="flex-1 px-4 py-8 md:px-6">
            <div className="mx-auto w-full max-w-(--breakpoint-2xl)">{children}</div>
          </main>
          <Footer />
        </div>
      </div>
    </div>
  );
}
