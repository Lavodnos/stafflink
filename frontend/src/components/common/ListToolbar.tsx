type ListToolbarProps = {
  search: string;
  onSearchChange: (value: string) => void;
  placeholder?: string;
  ariaLabel?: string;
  showEntries?: number;
  disabled?: boolean;
};

export function ListToolbar({
  search,
  onSearchChange,
  placeholder = 'Buscar...',
  ariaLabel = 'Buscar',
  showEntries = 10,
  disabled = false,
}: ListToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <label className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        Mostrar
        <select className="input w-20" disabled>
          <option>{showEntries}</option>
        </select>
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
