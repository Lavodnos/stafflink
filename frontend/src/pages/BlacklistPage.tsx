import { useForm } from "react-hook-form";
import { useCallback, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { PageHeader } from "../components/common/PageHeader";
import { PageShell } from "../components/common/PageShell";
import { ApiError } from "../lib/apiError";
import { applyApiFieldErrors } from "../lib/applyApiFieldErrors";
import { usePermission } from "../modules/auth/usePermission";
import type { BlacklistEntry } from "@/features/blacklist";
import {
  useBlacklist,
  useCreateBlacklist,
  useDeleteBlacklist,
  useUpdateBlacklist,
} from "@/features/blacklist";
import { BlacklistFormCard } from "./blacklist/BlacklistFormCard";
import { BlacklistListCard } from "./blacklist/BlacklistListCard";
import type { BlacklistFormState } from "./blacklist/types";

type Mode = "list" | "create";

const schema = z.object({
  id: z.string().optional(),
  dni: z
    .string()
    .trim()
    .min(4, "Mínimo 4 caracteres")
    .max(20, "Máximo 20 caracteres"),
  nombres: z.string().trim().min(3, "Mínimo 3 caracteres"),
  descripcion: z.string().trim().min(5, "Mínimo 5 caracteres"),
  estado: z.enum(["activo", "inactivo"]),
});

const initialForm: BlacklistFormState = {
  dni: "",
  nombres: "",
  descripcion: "",
  estado: "activo",
};

export function BlacklistPage({ mode = "list" }: { mode?: Mode }) {
  const navigate = useNavigate();
  const { id: routeId } = useParams();
  const canRead = usePermission("blacklist.read");
  const canManage = usePermission("blacklist.manage");

  const { data: items = [], isLoading, error } = useBlacklist(canRead);
  const createMutation = useCreateBlacklist();
  const updateMutation = useUpdateBlacklist();
  const deleteMutation = useDeleteBlacklist();

  const form = useForm<BlacklistFormState>({
    defaultValues: initialForm,
    resolver: zodResolver(schema),
  });
  const {
    reset,
    setValue,
    watch,
    setError,
    formState: { isSubmitting },
  } = form;

  const formValues = watch();
  const isEditing = Boolean(formValues.id);
  const isRouteEditing = Boolean(routeId);
  const saving =
    isSubmitting ||
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending;

  const onSubmit = async (data: BlacklistFormState) => {
    if (!canManage) {
      throw new ApiError("No tienes permiso para gestionar la blacklist", 403);
    }
    const payload = {
      dni: data.dni.trim().toUpperCase(),
      nombres: data.nombres.trim().toUpperCase(),
      descripcion: data.descripcion?.trim(),
      estado: data.estado,
    };
    if (data.id) {
      await updateMutation.mutateAsync({ id: data.id, payload });
    } else {
      await createMutation.mutateAsync(payload as Required<typeof payload>);
    }
    reset(initialForm);
  };

  const startEdit = useCallback(
    (entry: BlacklistEntry) => {
      if (!canManage) return;
      setValue("id", entry.id);
      setValue("dni", entry.dni);
      setValue("nombres", entry.nombres);
      setValue("descripcion", entry.descripcion ?? "");
      setValue("estado", entry.estado);
    },
    [canManage, setValue],
  );

  const handleDelete = async (entry: BlacklistEntry) => {
    if (!canManage) return;
    const confirmed = window.confirm(`¿Eliminar ${entry.dni}?`);
    if (!confirmed) return;
    await deleteMutation.mutateAsync(entry.id);
    if (formValues.id === entry.id) reset(initialForm);
  };

  useEffect(() => {
    if (!routeId || !items.length) return;
    const found = items.find((entry) => entry.id === routeId);
    if (found) {
      startEdit(found);
      return;
    }
    navigate("/blacklist", { replace: true });
  }, [routeId, items, navigate, startEdit]);

  useEffect(() => {
    applyApiFieldErrors(createMutation.error, setError);
  }, [createMutation.error, setError]);

  useEffect(() => {
    applyApiFieldErrors(updateMutation.error, setError);
  }, [updateMutation.error, setError]);

  const errorMessage =
    error instanceof Error
      ? error.message
      : (createMutation.error instanceof ApiError &&
          createMutation.error.message) ||
        (updateMutation.error instanceof ApiError &&
          updateMutation.error.message) ||
        (deleteMutation.error instanceof ApiError &&
          deleteMutation.error.message) ||
        undefined;

  return (
    <PageShell>
      <PageHeader
        eyebrow="Blacklist"
        title={
          mode === "create" || isRouteEditing || isEditing
            ? "Crear o editar entrada"
            : "Personas vetadas"
        }
        description={
          mode === "create" || isRouteEditing || isEditing
            ? "Registra o actualiza un DNI en la blacklist."
            : "Agrega o edita entradas para bloquear postulantes."
        }
      />

      {(mode === "create" || isRouteEditing || isEditing) && (
        <BlacklistFormCard
          form={form}
          values={formValues}
          canManage={canManage}
          isEditing={isEditing}
          isRouteEditing={isRouteEditing}
          saving={saving}
          errorMessage={errorMessage}
          onSubmit={onSubmit}
          onCancelEdit={() => {
            if (isRouteEditing) navigate("/blacklist");
          }}
          initialValues={initialForm}
        />
      )}

      {mode === "list" && (
        <BlacklistListCard
          entries={items}
          canRead={canRead}
          canManage={canManage}
          isLoading={isLoading}
          isDeleting={deleteMutation.isPending}
          onCreate={() => navigate("/blacklist/new")}
          onEdit={(entry) => startEdit(entry)}
          onDelete={handleDelete}
        />
      )}
    </PageShell>
  );
}
