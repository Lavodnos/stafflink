type FormActionsProps = {
  primaryLabel: string;
  loadingLabel?: string;
  isLoading?: boolean;
  primaryDisabled?: boolean;
  secondaryDisabled?: boolean;
  onReset: () => void;
  secondaryLabel?: string;
};

export function FormActions({
  primaryLabel,
  loadingLabel = 'Guardando…',
  isLoading = false,
  primaryDisabled = false,
  secondaryDisabled = false,
  onReset,
  secondaryLabel = 'Limpiar',
}: FormActionsProps) {
  return (
    <div className="flex gap-3">
      <button
        type="submit"
        className="btn-primary"
        disabled={isLoading || primaryDisabled}
      >
        {isLoading ? loadingLabel : primaryLabel}
      </button>
      <button
        type="button"
        className="btn-secondary"
        onClick={onReset}
        disabled={isLoading || secondaryDisabled}
      >
        {secondaryLabel}
      </button>
    </div>
  );
}
