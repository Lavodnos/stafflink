export function FooterOld() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-gea-midnight/5 bg-white/80 px-4 py-3 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 text-xs text-gea-slate">
        <span>© {year} GEA · Stafflink</span>
        <div className="flex gap-3">
          <a className="hover:text-gea-midnight" href="#" aria-label="Política de privacidad">Privacidad</a>
          <a className="hover:text-gea-midnight" href="#" aria-label="Soporte">Soporte</a>
        </div>
      </div>
    </footer>
  );
}
