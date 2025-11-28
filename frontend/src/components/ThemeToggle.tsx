import { useTheme } from '../modules/theme/useTheme';

export function ThemeToggle() {
  const { theme, toggleTheme, isDark, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => setTheme('light')}
        className={`rounded-lg border px-2 py-1 text-sm transition ${!isDark ? 'border-brand-400 text-brand-600' : 'border-gray-300 text-gray-500 dark:border-gray-700 dark:text-gray-400'}`}
        aria-pressed={!isDark}
      >
        ☀️
      </button>
      <button
        type="button"
        onClick={() => setTheme('dark')}
        className={`rounded-lg border px-2 py-1 text-sm transition ${isDark ? 'border-brand-400 text-brand-300' : 'border-gray-300 text-gray-500 dark:border-gray-700 dark:text-gray-400'}`}
        aria-pressed={isDark}
      >
        🌙
      </button>
      <button
        type="button"
        onClick={toggleTheme}
        className="rounded-lg border border-gray-200 px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
        aria-label="Alternar tema"
      >
        {theme === 'system' ? 'Auto' : isDark ? 'Oscuro' : 'Claro'}
      </button>
    </div>
  );
}
