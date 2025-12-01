import type { UseFormSetError } from "react-hook-form";
import { ApiError } from "./apiError";

/**
 * Mapea los errores del backend (ApiError.payload) a los campos del formulario.
 * Asume el contrato estándar DRF: { campo: ["mensaje"] } o { non_field_errors: ["msg"] }.
 * Si recibe un array o un string, lo asigna como error global (root).
 */
export function applyApiFieldErrors<T>(
  error: unknown,
  setError: UseFormSetError<T>,
): void {
  if (!(error instanceof ApiError)) return;
  if (error.status !== 400) return;

  const payload = error.payload;

  // Caso dict { field: ["msg"] }
  if (payload && typeof payload === "object" && !Array.isArray(payload)) {
    const entries = Object.entries(payload as Record<string, unknown>);
    entries.forEach(([field, msgs]) => {
      const message = Array.isArray(msgs) ? String(msgs[0]) : String(msgs);
      // @ts-expect-error: el field puede no existir en T, lo forzamos a server error
      setError(field as keyof T, { type: "server", message });
    });
    return;
  }

  // Caso array ["mensaje"] -> error global
  if (Array.isArray(payload) && typeof payload[0] === "string") {
    setError("root" as keyof T, {
      type: "server",
      message: payload.join(" "),
    });
    return;
  }

  // Caso string -> error global
  if (typeof payload === "string") {
    setError("root" as keyof T, { type: "server", message: payload });
  }
}
