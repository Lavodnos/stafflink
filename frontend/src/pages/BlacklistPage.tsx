import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Drawer } from '../components/common/Drawer';
import { Modal } from '../components/common/Modal';
import { useToastStore } from '../components/common/Toast';
import { Card, Field, Input, SectionHeader, Select, Textarea } from '../components/ui';
import { ApiError } from '../lib/apiError';
import { usePermission } from '../modules/auth/usePermission';
import type { BlacklistEntry } from '../modules/blacklist/api';
import {
  useBlacklist,
  useCreateBlacklist,
  useDeleteBlacklist,
  useUpdateBlacklist,
} from '../modules/blacklist/hooks';

type FormState = {
  id?: string;
  dni: string;
  nombres: string;
  descripcion?: string;
  estado: string;
};

const initialForm: FormState = {
  dni: '',
  nombres: '',
  descripcion: '',
  estado: 'activo',
};

export function BlacklistPage() {
  const canRead = usePermission('blacklist.read');
  const canManage = usePermission('blacklist.manage');
  const addToast = useToastStore((s) => s.add);

  const { data: items = [], isLoading, error } = useBlacklist(canRead);
  const createMutation = useCreateBlacklist();
  const updateMutation = useUpdateBlacklist();
  const deleteMutation = useDeleteBlacklist();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<BlacklistEntry | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 6;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormState>({
    defaultValues: initialForm,
  });

  const formValues = watch();
  const isEditing = Boolean(formValues.id);
  const saving = isSubmitting || createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  const onSubmit = async (data: FormState) => {
    if (!canManage) {
      throw new ApiError('No tienes permiso para gestionar la blacklist', 403);
    }
    const payload = {
      dni: data.dni.trim().toUpperCase(),
      nombres: data.nombres.trim().toUpperCase(),
      descripcion: data.descripcion?.trim(),
      estado: data.estado,
    };
    if (data.id) {
      await updateMutation.mutateAsync({ id: data.id, payload });
      addToast({ type: 'success', message: 'Entrada actualizada' });
    } else {
      await createMutation.mutateAsync(payload as Required<typeof payload>);
      addToast({ type: 'success', message: 'Entrada creada' });
    }
    reset(initialForm);
    setDrawerOpen(false);
  };

  const startEdit = (entry: BlacklistEntry) => {
    if (!canManage) return;
    setValue('id', entry.id);
    setValue('dni', entry.dni);
    setValue('nombres', entry.nombres);
    setValue('descripcion', entry.descripcion ?? '');
    setValue('estado', entry.estado);
    setDrawerOpen(true);
  };

  const handleDelete = async (entry: BlacklistEntry) => {
    if (!canManage) return;
    setPendingDelete(entry);
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    await deleteMutation.mutateAsync(pendingDelete.id);
    addToast({ type: 'info', message: 'Entrada eliminada' });
    if (formValues.id === pendingDelete.id) reset(initialForm);
    setPendingDelete(null);
  };

  const filtered = useMemo(() => {
    const term = search.toLowerCase().trim();
    return term
      ? items.filter((e) =>
          [e.dni, e.nombres, e.descripcion, e.estado].some((v) => v?.toLowerCase().includes(term)),
        )
      : items;
  }, [items, search]);
  useEffect(() => {
    setPage(1);
  }, [search]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Blacklist"
        subtitle="Personas vetadas. Agrega o edita entradas para bloquear postulantes."
        actions={
          canManage && (
            <button type="button" className="btn-primary" onClick={() => setDrawerOpen(true)}>
              Nueva entrada
            </button>
          )
        }
      />

      <Card className="space-y-3">
        <SectionHeader title="Listado" actions={isLoading ? <span className="pill">Cargando…</span> : null} />
        <div className="flex flex-wrap gap-3">
          <Input
            placeholder="Buscar por DNI, nombre, estado..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Buscar blacklist"
            className="max-w-sm"
          />
        </div>
        {!canRead && <p className="text-sm text-gray-500">No tienes permiso para ver la blacklist.</p>}
        {!isLoading && canRead && items.length === 0 && (
          <p className="text-sm text-gray-500">Sin registros.</p>
        )}
        <div className="grid gap-3 md:grid-cols-2">
          {canRead &&
            paged.map((entry) => (
              <article
                key={entry.id}
                className="rounded-2xl border border-gray-200 bg-white p-4 shadow-theme-sm transition hover:shadow-theme-md dark:border-gray-800 dark:bg-gray-900"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <p className="text-xs uppercase text-gray-500">{entry.dni}</p>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{entry.nombres}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Estado: {entry.estado}</p>
                    {entry.descripcion && <p className="text-sm text-gray-500 dark:text-gray-400">{entry.descripcion}</p>}
                  </div>
                  <div className="flex flex-wrap justify-end gap-2">
                    {canManage && (
                      <button type="button" className="pill" onClick={() => startEdit(entry)}>
                        Editar
                      </button>
                    )}
                    {canManage && (
                      <button
                        type="button"
                        className="pill bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-200"
                        onClick={() => handleDelete(entry)}
                        disabled={deleteMutation.isPending}
                      >
                        Eliminar
                      </button>
                    )}
                  </div>
                </div>
              </article>
            ))}
        </div>
        {canRead && filtered.length > pageSize && (
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-gray-500">
              Página {page} de {totalPages} · {filtered.length} entradas
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                className="btn-secondary px-3 py-1 text-sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Anterior
              </button>
              <button
                type="button"
                className="btn-secondary px-3 py-1 text-sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </Card>

      <Drawer
        isOpen={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          reset(initialForm);
        }}
        title={`${isEditing ? 'Editar' : 'Nueva'} entrada`}
        width="md"
      >
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit(onSubmit)} noValidate>
          <Field label="DNI*">
            <Input
              disabled={!canManage}
              {...register('dni', {
                required: 'Requerido',
                minLength: { value: 4, message: 'Mínimo 4 caracteres' },
                onChange: (e) => setValue('dni', e.target.value.toUpperCase(), { shouldValidate: true }),
              })}
              value={formValues.dni}
              aria-invalid={!!errors.dni}
              aria-describedby={errors.dni ? 'dni-error' : undefined}
            />
            {errors.dni && (
              <span id="dni-error" className="text-sm font-medium text-error-500">
                {errors.dni.message}
              </span>
            )}
          </Field>
          <Field label="Nombres*">
            <Input
              disabled={!canManage}
              {...register('nombres', {
                required: 'Requerido',
                minLength: { value: 3, message: 'Mínimo 3 caracteres' },
                onChange: (e) => setValue('nombres', e.target.value.toUpperCase(), { shouldValidate: true }),
              })}
              value={formValues.nombres}
              aria-invalid={!!errors.nombres}
              aria-describedby={errors.nombres ? 'nombres-error' : undefined}
            />
            {errors.nombres && (
              <span id="nombres-error" className="text-sm font-medium text-error-500">
                {errors.nombres.message}
              </span>
            )}
          </Field>
          <div className="md:col-span-2">
            <Field label="Descripción*">
              <Textarea
                {...register('descripcion', {
                  required: 'Requerido',
                  minLength: { value: 5, message: 'Mínimo 5 caracteres' },
                })}
                value={formValues.descripcion}
                disabled={!canManage}
                aria-invalid={!!errors.descripcion}
                aria-describedby={errors.descripcion ? 'descripcion-error' : undefined}
              />
              {errors.descripcion && (
                <span id="descripcion-error" className="text-sm font-medium text-error-500">
                  {errors.descripcion.message}
                </span>
              )}
            </Field>
          </div>
          <Field label="Estado">
          <Select {...register('estado')} value={formValues.estado} disabled={!canManage}>
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
          </Select>
          </Field>
          {(error || createMutation.error || updateMutation.error || deleteMutation.error) && (
            <p className="text-sm font-medium text-error-500 md:col-span-2">
              {error instanceof Error
                ? error.message
                : (createMutation.error instanceof ApiError && createMutation.error.message) ||
                  (updateMutation.error instanceof ApiError && updateMutation.error.message) ||
                  (deleteMutation.error instanceof ApiError && deleteMutation.error.message) ||
                  'Error al guardar'}
            </p>
          )}
          <div className="flex gap-3 md:col-span-2">
            <button type="submit" className="btn-primary" disabled={saving || !canManage}>
              {saving ? 'Guardando…' : isEditing ? 'Actualizar' : 'Crear'}
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => reset(initialForm)}
              disabled={saving || !canManage}
            >
              Limpiar
            </button>
          </div>
          {!canManage && <p className="text-xs text-gray-500 md:col-span-2">No tienes permiso para crear o editar entradas.</p>}
        </form>
      </Drawer>

      <Modal
        isOpen={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        title="Confirmar eliminación"
      >
        <p className="text-sm text-gray-600 dark:text-gray-300">
          ¿Eliminar la entrada {pendingDelete?.dni}?
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <button type="button" className="btn-secondary" onClick={() => setPendingDelete(null)}>
            Cancelar
          </button>
          <button type="button" className="btn-danger" onClick={confirmDelete} disabled={deleteMutation.isPending}>
            Eliminar
          </button>
        </div>
      </Modal>
    </div>
  );
}
