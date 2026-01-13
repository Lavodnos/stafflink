import type { ReactNode } from "react";

type PublicApplySuccessProps = {
  submittedId: string;
  onReset: () => void;
  actions?: ReactNode;
};

export function PublicApplySuccess({
  submittedId,
  onReset,
  actions,
}: PublicApplySuccessProps) {
  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10 text-gray-900">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-theme-lg">
          <h1 className="text-3xl font-semibold">¡Gracias por postular!</h1>
          <p className="mt-2 text-gray-600">
            Tu registro fue recibido con el ID <strong>{submittedId}</strong>.
            Te contactaremos si necesitamos información adicional.
          </p>
        </div>
        <div className="flex gap-3">
          {actions ?? (
            <button type="button" className="btn-secondary" onClick={onReset}>
              Registrar otro postulante
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
