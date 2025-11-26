import { useForm } from 'react-hook-form';

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
    } else {
      await createMutation.mutateAsync(payload as Required<typeof payload>);
    }
    reset(initialForm);
  };

  const startEdit = (entry: BlacklistEntry) => {
    if (!canManage) return;
    setValue('id', entry.id);
    setValue('dni', entry.dni);
    setValue('nombres', entry.nombres);
    setValue('descripcion', entry.descripcion ?? '');
    setValue('estado', entry.estado);
  };

  const handleDelete = async (entry: BlacklistEntry) => {
    if (!canManage) return;
    const confirmed = window.confirm(`¿Eliminar ${entry.dni}?`);
    if (!confirmed) return;
    await deleteMutation.mutateAsync(entry.id);
    if (formValues.id === entry.id) reset(initialForm);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-white to-gea-blue-deep/10 px-4 py-10 text-gea-midnight">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex flex-col gap-2">
          <p className="text-sm text-gea-slate">Blacklist</p>
          <h1 className="text-3xl font-semibold text-gea-midnight">Personas vetadas</h1>
          <p className="text-sm text-gea-slate">Agrega o edita entradas para bloquear postulantes.</p>
        </header>

        <Card className="space-y-4">
          <SectionHeader
            title={`${isEditing ? 'Editar' : 'Nueva'} entrada`}
            subtitle="DNI en mayúsculas."
            actions={
              isEditing && canManage && (
                <button type="button" className="btn-secondary" onClick={() => reset(initialForm)}>
                  Cancelar edición
                </button>
              )
            }
          />
          <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit(onSubmit)}>
            <Field label="DNI*">
              <Input
                disabled={!canManage}
                {...register('dni', {
                  required: 'Requerido',
                  minLength: { value: 4, message: 'Mínimo 4 caracteres' },
                  onChange: (e) => setValue('dni', e.target.value.toUpperCase(), { shouldValidate: true }),
                })}
                value={formValues.dni}
              />
              {errors.dni && <span className="text-xs text-red-600">{errors.dni.message}</span>}
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
              />
              {errors.nombres && <span className="text-xs text-red-600">{errors.nombres.message}</span>}
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
                />
                {errors.descripcion && <span className="text-xs text-red-600">{errors.descripcion.message}</span>}
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
          </form>
          {!canManage && <p className="text-xs text-gea-slate">No tienes permiso para crear o editar entradas.</p>}
        </Card>

        <Card className="space-y-3">
          <SectionHeader title="Listado" actions={isLoading ? <span className="pill">Cargando…</span> : null} />
          {!canRead && <p className="text-sm text-gea-slate">No tienes permiso para ver la blacklist.</p>}
          {!isLoading && canRead && items.length === 0 && <p className="text-sm text-gea-slate">Sin registros.</p>}
          <div className="grid gap-3 md:grid-cols-2">
            {canRead &&
              items.map((entry) => (
                <article key={entry.id} className="rounded-2xl border border-gea-midnight/10 bg-white/90 p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase text-gea-slate">{entry.dni}</p>
                      <h3 className="text-lg font-semibold text-gea-midnight">{entry.nombres}</h3>
                    </div>
                    <div className="flex gap-2">
                      {canManage && (
                        <button type="button" className="pill bg-gea-midnight/10" onClick={() => startEdit(entry)}>
                          Editar
                        </button>
                      )}
                      {canManage && (
                        <button
                          type="button"
                          className="pill bg-red-100 text-red-700"
                          onClick={() => handleDelete(entry)}
                          disabled={deleteMutation.isPending}
                        >
                          Eliminar
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gea-slate">Estado: {entry.estado}</p>
                  {entry.descripcion && <p className="text-sm text-gea-slate">{entry.descripcion}</p>}
                </article>
              ))}
          </div>
        </Card>
      </div>
    </main>
  );
}
