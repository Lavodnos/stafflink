type HeaderProps = {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  onMenuClick?: () => void;
};

export function HeaderOld({ title, subtitle, actions, onMenuClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex flex-col gap-2 bg-gradient-to-r from-white via-white to-gea-green/5 px-4 py-4 shadow-sm backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {onMenuClick && (
            <button
              type="button"
              className="btn-secondary px-3 py-2 text-sm lg:hidden"
              onClick={onMenuClick}
              aria-label="Abrir menú"
              aria-expanded="false"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gea-midnight" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}
          <div>
            <p className="text-xs uppercase tracking-wide text-gea-slate">Stafflink</p>
            <h1 className="text-2xl font-semibold text-gea-midnight">{title}</h1>
            {subtitle && <p className="text-sm text-gea-slate">{subtitle}</p>}
          </div>
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </header>
  );
}
