import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import type { UseFormReturn } from "react-hook-form";

import type {
  Candidate,
  CandidateAssignment,
  CandidateDetail,
  CandidateDocuments,
  CandidateProcess,
} from "@/features/candidates";
import { Card } from "../../components/ui";
import { CandidateContratoForm } from "./forms/CandidateContratoForm";
import { CandidateDatosForm } from "./forms/CandidateDatosForm";
import { CandidateDocumentsForm } from "./forms/CandidateDocumentsForm";
import { CandidateProcesoForm } from "./forms/CandidateProcesoForm";

export type CandidateDetailTab = "datos" | "documentos" | "proceso" | "contrato";

type CandidateDetailModalProps = {
  detail?: CandidateDetail | null;
  isLoading: boolean;
  tab: CandidateDetailTab;
  onTabChange: (tab: CandidateDetailTab) => void;
  onClose: () => void;
  forms: {
    datos: UseFormReturn<Candidate>;
    docs: UseFormReturn<CandidateDocuments>;
    proceso: UseFormReturn<CandidateProcess>;
    contrato: UseFormReturn<CandidateAssignment>;
  };
  canEdit: {
    datos: boolean;
    docs: boolean;
    proceso: boolean;
    contrato: boolean;
  };
  onSubmit: {
    datos: (data: Candidate) => Promise<void>;
    docs: (data: CandidateDocuments) => Promise<void>;
    proceso: (data: CandidateProcess) => Promise<void>;
    contrato: (data: CandidateAssignment) => Promise<void>;
  };
};

const tabLabels: Record<CandidateDetailTab, string> = {
  datos: "Datos",
  documentos: "Documentos",
  proceso: "Proceso",
  contrato: "Contrato",
};

export function CandidateDetailModal({
  detail,
  isLoading,
  tab,
  onTabChange,
  onClose,
  forms,
  canEdit,
  onSubmit,
}: CandidateDetailModalProps) {
  if (typeof document === "undefined") return null;
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = contentRef.current;
    if (!container) return;

    const previousFocus = document.activeElement as HTMLElement | null;
    const getFocusable = () =>
      Array.from(
        container.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((el) => !el.hasAttribute("disabled") && !el.getAttribute("aria-hidden"));

    const focusables = getFocusable();
    const initialFocus = focusables[0] ?? container;
    initialFocus.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;

      const items = getFocusable();
      if (items.length === 0) {
        event.preventDefault();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (event.shiftKey) {
        if (!active || active === first) {
          event.preventDefault();
          last.focus();
        }
      } else if (active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      if (previousFocus && document.contains(previousFocus)) {
        previousFocus.focus();
      }
    };
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/80 px-4 py-8 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="max-h-[85vh] w-full max-w-[1750px] overflow-y-auto"
        ref={contentRef}
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
      >
        <Card className="space-y-6 rounded-3xl border border-gray-200 bg-white p-6 shadow-2xl lg:p-10 dark:border-slate-800 dark:bg-slate-950">
          <div className="flex items-start justify-between gap-4 border-b border-gray-100 pb-4 dark:border-slate-800">
            <div className="space-y-1">
              <p className="text-xs tracking-wide text-gray-400 uppercase dark:text-slate-500">
                Detalle de candidato
              </p>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-slate-50">
                {detail ? detail.nombres_completos : "Candidato"}
              </h3>
              <p className="text-sm text-gray-500 dark:text-slate-400">
                {detail
                  ? `${detail.tipo_documento} ${detail.numero_documento}`
                  : "Selecciona un candidato"}
              </p>
            </div>
            <button
              type="button"
              className="btn-secondary h-9 w-9 rounded-full text-base"
              onClick={onClose}
              aria-label="Cerrar detalle"
            >
              ✕
            </button>
          </div>

          {isLoading && (
            <div className="flex h-40 items-center justify-center text-sm text-gray-500 dark:text-slate-300">
              Cargando detalle…
            </div>
          )}

          {!isLoading && !detail && (
            <div className="text-sm text-gray-600 dark:text-slate-300">
              No se pudo cargar el detalle del candidato.
            </div>
          )}

          {detail && !isLoading && (
            <>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(tabLabels) as CandidateDetailTab[]).map(
                  (key) => (
                    <button
                      key={key}
                      type="button"
                      className={`pill ${
                        tab === key
                          ? "bg-brand-500 text-white dark:bg-brand-400 dark:text-slate-950"
                          : "dark:bg-slate-800 dark:text-slate-200"
                      }`}
                      onClick={() => onTabChange(key)}
                    >
                      {tabLabels[key]}
                    </button>
                  ),
                )}
              </div>

              {tab === "datos" && (
                <CandidateDatosForm
                  detail={detail}
                  form={forms.datos}
                  canEdit={canEdit.datos}
                  onSubmit={onSubmit.datos}
                />
              )}
              {tab === "documentos" && (
                <CandidateDocumentsForm
                  detail={detail}
                  form={forms.docs}
                  canEdit={canEdit.docs}
                  onSubmit={onSubmit.docs}
                />
              )}
              {tab === "proceso" && (
                <CandidateProcesoForm
                  detail={detail}
                  form={forms.proceso}
                  canEdit={canEdit.proceso}
                  onSubmit={onSubmit.proceso}
                />
              )}
              {tab === "contrato" && (
                <CandidateContratoForm
                  detail={detail}
                  form={forms.contrato}
                  canEdit={canEdit.contrato}
                  onSubmit={onSubmit.contrato}
                />
              )}
            </>
          )}
        </Card>
      </div>
    </div>,
    document.body,
  );
}
