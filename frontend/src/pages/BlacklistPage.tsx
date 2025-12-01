import { useForm } from 'react-hook-form';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Card, Field, Input, SectionHeader, Select, Textarea, ErrorText } from '../components/ui';
import { ApiError } from '../lib/apiError';
import { applyApiFieldErrors } from '../lib/applyApiFieldErrors';
import { usePermission } from '../modules/auth/usePermission';
import type { BlacklistEntry } from '@/features/blacklist';
import {
  useBlacklist,
  useCreateBlacklist,
  useDeleteBlacklist,
  useUpdateBlacklist,
} from '@/features/blacklist';

type FormState = {
  id?: string;
  dni: string;
  nombres: string;
  descripcion?: string;
  estado: string;
};

const schema = z.object({
  id: z.string().optional(),
  dni: z
    .string()
    .trim()
    .min(4, 'Mínimo 4 caracteres')
    .max(20, 'Máximo 20 caracteres'),
  nombres: z.string().trim().min(3, 'Mínimo 3 caracteres'),
  descripcion: z.string().trim().min(5, 'Mínimo 5 caracteres'),
  estado: z.enum(['activo', 'inactivo']),
});

const initialForm: FormState = {
  dni: '',
  nombres: '',
  descripcion: '',
  estado: 'activo',
};

type Mode = 'list' | 'create';

export function BlacklistPage({ mode = 'list' }: { mode?: Mode }) {
  const navigate = useNavigate();
  const { id: routeId } = useParams();
  const canRead = usePermission('blacklist.read');
  const canManage = usePermission('blacklist.manage');

  const { data: items = [], isLoading, error } = useBlacklist(canRead);
  const createMutation = useCreateBlacklist();
  const updateMutation = useUpdateBlacklist();
  const deleteMutation = useDeleteBlacklist();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormState>({
    defaultValues: initialForm,
    resolver: zodResolver(schema),
  });

  const formValues = watch();
  const isEditing = Boolean(formValues.id);
  const isRouteEditing = Boolean(routeId);
  const saving = isSubmitting || createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return items;
    return items.filter((entry) =>
      [entry.dni, entry.nombres, entry.estado, entry.descripcion]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(term)),
    );
  }, [items, search]);

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
    } else {
      await createMutation.mutateAsync(payload as Required<typeof payload>);
    }
    reset(initialForm);
  };

  const startEdit = useCallback((entry: BlacklistEntry) => {
    if (!canManage) return;
    setValue('id', entry.id);
    setValue('dni', entry.dni);
    setValue('nombres', entry.nombres);
    setValue('descripcion', entry.descripcion ?? '');
    setValue('estado', entry.estado);
  }, [canManage, setValue]);

  const handleDelete = async (entry: BlacklistEntry) => {
    if (!canManage) return;
    const confirmed = window.confirm(`¿Eliminar ${entry.dni}?`);
    if (!confirmed) return;
    await deleteMutation.mutateAsync(entry.id);
    if (formValues.id === entry.id) reset(initialForm);
  };

  // Si llega por ruta /blacklist/:id/edit, precarga la entrada
  // y si no existe, redirige al listado
  useMemo(() => {
    if (!routeId || !items.length) return undefined;
    const found = items.find((e) => e.id === routeId);
    if (found) {
      startEdit(found);
      return found;
    }
    navigate('/blacklist', { replace: true });
    return undefined;
  }, [routeId, items, navigate, startEdit]);

  useEffect(() => {
    applyApiFieldErrors(createMutation.error, setError);
  }, [createMutation.error, setError]);

  useEffect(() => {
    applyApiFieldErrors(updateMutation.error, setError);
  }, [updateMutation.error, setError]);

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 text-gray-900 dark:bg-gray-900 dark:text-white">
      <div className="mx-auto max-w-(--breakpoint-2xl) space-y-6">
        <header className="flex flex-col gap-1">
          <p className="text-sm text-gray-500 dark:text-gray-400">Blacklist</p>
          <h1 className="text-3xl font-semibold text-gray-900 dark:text-white">
            {mode === 'create' || isRouteEditing || isEditing ? 'Crear o editar entrada' : 'Personas vetadas'}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {mode === 'create' || isRouteEditing || isEditing
              ? 'Registra o actualiza un DNI en la blacklist.'
              : 'Agrega o edita entradas para bloquear postulantes.'}
          </p>
        </header>

        {(mode === 'create' || isRouteEditing || isEditing) && (
          <Card className="space-y-4">
            <SectionHeader
              title={isEditing || isRouteEditing ? 'Editar entrada' : 'Nueva entrada'}
              subtitle="DNI en mayúsculas."
              actions={
                (isEditing || isRouteEditing) && canManage && (
                  <button type="button" className="btn-secondary" onClick={() => {
                    reset(initialForm);
                    if (isRouteEditing) navigate('/blacklist');
                  }}>
                    Cancelar edición
                  </button>
                )
              }
            />
          <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit(onSubmit)}>
            <Field label="DNI*">
              <Input
                disabled={!canManage}
                {...register('dni')}
                value={formValues.dni}
                onChange={(e) => setValue('dni', e.target.value.toUpperCase(), { shouldValidate: true })}
              />
              <ErrorText message={errors.dni?.message} />
            </Field>
            <Field label="Nombres*">
              <Input
                disabled={!canManage}
                {...register('nombres')}
                value={formValues.nombres}
                onChange={(e) => setValue('nombres', e.target.value.toUpperCase(), { shouldValidate: true })}
              />
              <ErrorText message={errors.nombres?.message} />
            </Field>
            <div className="md:col-span-2">
              <Field label="Descripción*">
                <Textarea {...register('descripcion')} value={formValues.descripcion} disabled={!canManage} />
                <ErrorText message={errors.descripcion?.message} />
              </Field>
            </div>
            <Field label="Estado">
              <Select {...register('estado')} value={formValues.estado} disabled={!canManage}>
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
              </Select>
            </Field>
            {(error || createMutation.error || updateMutation.error || deleteMutation.error) && (
              <p className="text-sm text-red-600 md:col-span-2">
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
                {saving ? 'Guardando…' : (isEditing || isRouteEditing) ? 'Actualizar' : 'Crear'}
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
          </form>
          {!canManage && <p className="text-xs text-gray-500 dark:text-gray-400">No tienes permiso para crear o editar entradas.</p>}
        </Card>
        )}

        {mode === 'list' && (
        <Card className="space-y-3">
          <SectionHeader
            title="Listado"
            actions={(
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="btn-secondary px-3 py-2 text-sm"
                  aria-label="Exportar blacklist"
                  onClick={() => {
                    // TODO: export real
                  }}
                >
                  Exportar
                </button>
                <button
                  type="button"
                  className="btn-primary px-4 py-2 text-sm"
                  disabled={!canManage}
                  onClick={() => navigate('/blacklist/new')}
                >
                  + Nueva entrada
                </button>
              </div>
            )}
          />
          {!canRead && <p className="text-sm text-gray-500 dark:text-gray-400">No tienes permiso para ver la blacklist.</p>}
          {!isLoading && canRead && filtered.length === 0 && <p className="text-sm text-gray-500 dark:text-gray-400">Sin registros.</p>}

          {mode === 'list' && canRead && (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <label className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  Mostrar
                  <select className="input w-20" disabled>
                    <option>10</option>
                  </select>
                  entradas
                </label>
                <div className="relative">
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar..."
                    className="input w-56 pl-9"
                    aria-label="Buscar en blacklist"
                  />
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                </div>
              </div>

              <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800">
                <table className="min-w-full text-left text-sm text-gray-700 dark:text-gray-200">
                  <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-500 dark:bg-gray-800 dark:text-gray-300">
                    <tr>
                      <th className="px-4 py-3">DNI</th>
                      <th className="px-4 py-3">Nombres</th>
                      <th className="px-4 py-3">Estado</th>
                      <th className="px-4 py-3">Descripción</th>
                      {canManage && <th className="px-4 py-3 text-right">Acciones</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-gray-900">
                    {filtered.map((entry) => (
                      <tr key={entry.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/80">
                        <td className="px-4 py-3 text-xs uppercase text-gray-500 dark:text-gray-400">{entry.dni}</td>
                        <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">{entry.nombres}</td>
                        <td className="px-4 py-3">
                          <span className="pill">{entry.estado}</span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{entry.descripcion || '—'}</td>
                        {canManage && (
                          <td className="px-4 py-3 text-right space-x-2">
                            <button type="button" className="btn-secondary px-3 py-1 text-sm" onClick={() => startEdit(entry)}>
                              Editar
                            </button>
                            <button
                              type="button"
                              className="btn-secondary px-3 py-1 text-sm"
                              onClick={() => handleDelete(entry)}
                              disabled={deleteMutation.isPending}
                            >
                              Eliminar
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </Card>
        )}
      </div>
    </main>
  );
}
