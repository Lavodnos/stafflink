import type { ReactNode } from 'react';

type ChartCardProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

export function ChartCard({ title, subtitle, children }: ChartCardProps) {
  return (
    <div className="card">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          {subtitle && <p className="text-sm text-gray-500 dark:text-[#9fb3d1]">{subtitle}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}
