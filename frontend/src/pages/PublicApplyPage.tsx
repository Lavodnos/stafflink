import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useParams } from "react-router-dom";

import { ApiError } from "../lib/apiError";
import type { PublicCandidatePayload } from "../modules/public/api";
import { createPublicCandidate } from "../modules/public/api";
import { usePublicConvocatoria } from "../modules/public/hooks";
import { PublicApplyForm } from "./public/PublicApplyForm";
import { PublicApplyHeader } from "./public/PublicApplyHeader";
import { PublicApplySuccess } from "./public/PublicApplySuccess";
import type { PublicApplyFormData } from "./public/types";
import { getDistritoValue, toUpper } from "./public/utils";

export function PublicApplyPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: convocatoria, isLoading: loading, error: fetchError } =
    usePublicConvocatoria(slug);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<PublicApplyFormData>({
    defaultValues: {
      tipo_documento: "dni",
      has_callcenter_experience: false,
      distrito_otro: "",
    },
  });
  const { setError } = form;

  const onSubmit = async (data: PublicApplyFormData) => {
    if (!slug) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const normalized: PublicApplyFormData = {
        ...data,
        apellido_paterno: toUpper(data.apellido_paterno) ?? "",
        apellido_materno: toUpper(data.apellido_materno) ?? "",
        nombres_completos: toUpper(data.nombres_completos) ?? "",
        direccion: toUpper(data.direccion),
        distrito: getDistritoValue(data),
        lugar_residencia: toUpper(data.lugar_residencia),
        carrera: toUpper(data.carrera),
        numero_documento: toUpper(data.numero_documento) ?? "",
      };

      const payload: PublicCandidatePayload = {
        convocatoria_slug: slug,
        ...normalized,
      };
      const resp = await createPublicCandidate(payload);
      setSubmittedId(resp.id);
    } catch (err) {
      setSubmitError(
        err instanceof ApiError ? err.message : "Error al enviar el formulario.",
      );

      if (err instanceof ApiError && err.payload) {
        const details = err.payload as unknown;
        if (Array.isArray(details) && typeof details[0] === "string") {
          setError("numero_documento", {
            type: "server",
            message: details[0],
          });
        }
        if (details && typeof details === "object" && !Array.isArray(details)) {
          Object.entries(details as Record<string, unknown>).forEach(
            ([field, msgs]) => {
              const msg =
                Array.isArray(msgs) && typeof msgs[0] === "string"
                  ? msgs[0]
                  : typeof msgs === "string"
                    ? msgs
                    : null;
              if (msg) {
                setError(field as keyof PublicApplyFormData, {
                  type: "server",
                  message: msg,
                });
              }
            },
          );
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (submittedId) {
    return (
      <PublicApplySuccess
        submittedId={submittedId}
        onReset={() => setSubmittedId(null)}
      />
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10 text-gray-900">
      <div className="mx-auto max-w-5xl space-y-8">
        <PublicApplyHeader
          convocatoria={convocatoria}
          loading={loading}
          error={fetchError}
        />
        {submitError && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {submitError}
          </div>
        )}
        {convocatoria && (
          <FormProvider {...form}>
            <PublicApplyForm
              onSubmit={onSubmit}
              submitting={submitting}
              onClear={() => {
                form.reset();
                setSubmitError(null);
              }}
            />
          </FormProvider>
        )}
      </div>
    </main>
  );
}
