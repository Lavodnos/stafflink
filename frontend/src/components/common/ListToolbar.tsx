type ListToolbarProps = {
  search: string;
  onSearchChange: (value: string) => void;
  placeholder?: string;
  ariaLabel?: string;
  showEntries?: number;
  disabled?: boolean;
  showEntriesEnabled?: boolean;
  showEntriesOptions?: number[];
  onShowEntriesChange?: (value: number) => void;
};

export function ListToolbar({
  search,
  onSearchChange,
  placeholder = 'Buscar...',
  ariaLabel = 'Buscar',
  showEntries = 10,
  disabled = false,
  showEntriesEnabled = false,
  showEntriesOptions = [10, 25, 50],
  onShowEntriesChange,
}: ListToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <label className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        Mostrar
        {showEntriesEnabled ? (
          <select
            className="input w-20"
            value={showEntries}
            onChange={(event) =>
              onShowEntriesChange?.(Number(event.target.value))
            }
          >
            {showEntriesOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        ) : (
          <span className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300">
            {showEntries}
          </span>
        )}
        entradas
      </label>
      <div className="relative">
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={placeholder}
          className="input w-56 pl-9"
          aria-label={ariaLabel}
          disabled={disabled}
        />
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          🔍
        </span>
      </div>
    </div>
  );
}
