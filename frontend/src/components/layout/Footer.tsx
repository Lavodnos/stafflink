export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-gray-200 bg-white/90 px-4 py-4 text-sm text-gray-500 backdrop-blur dark:border-gray-800 dark:bg-gray-900/80 dark:text-gray-400">
      <div className="mx-auto flex max-w-(--breakpoint-2xl) flex-wrap items-center justify-between gap-2">
        <span>© {year} GEA · Stafflink</span>
        <div className="flex gap-3">
          <a className="hover:text-gray-700 dark:hover:text-gray-200" href="#" aria-label="Política de privacidad">Privacidad</a>
          <a className="hover:text-gray-700 dark:hover:text-gray-200" href="#" aria-label="Soporte">Soporte</a>
        </div>
      </div>
    </footer>
  );
}
