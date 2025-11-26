import type { SubmitHandler } from 'react-hook-form';
import { useForm } from 'react-hook-form';

import { Card, Field, Input, SectionHeader, Select, Textarea } from '../components/ui';
import { ApiError } from '../lib/apiError';
import { usePermission } from '../modules/auth/usePermission';
import { useCampaigns } from '../modules/campaigns/hooks';
import type { Link, LinkPayload } from '../modules/links/api';
import { useCreateLink, useLinkStatus, useLinks, useUpdateLink } from '../modules/links/hooks';

type LinkForm = LinkPayload & { id?: string };

export function LinksPage() {
  const canReadLinks = usePermission('links.read');
  const canManageLinks = usePermission('links.manage');
  const canCloseLinks = usePermission('links.close');
  const canReadCampaigns = usePermission('campaigns.read');

  const { data: items = [], isLoading, error } = useLinks(canReadLinks);
  const { data: campaigns = [] } = useCampaigns(canReadCampaigns);
  const createMutation = useCreateLink();
  const updateMutation = useUpdateLink();
  const statusMutation = useLinkStatus();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<LinkForm>({
    defaultValues: {
      campaign: '',
      grupo: '',
      titulo: '',
      slug: '',
      periodo: '',
      semana_trabajo: undefined,
      cuotas: undefined,
      modalidad: 'presencial',
      condicion: 'full_time',
      hora_gestion: '',
      descanso: '',
      expires_at: '',
      notes: '',
    },
  });

  const values = watch();
  const isEditing = Boolean(values.id);
  const saving =
    isSubmitting || createMutation.isPending || updateMutation.isPending || statusMutation.isPending;

  const onSubmit: SubmitHandler<LinkForm> = async (data) => {
    if (!canManageLinks) {
      throw new ApiError('No tienes permiso para gestionar links', 403);
    }
    const expiresAtIso = data.expires_at ? new Date(data.expires_at).toISOString() : '';
    const payload: LinkPayload = {
      ...data,
      grupo: data.grupo?.trim() || undefined,
      periodo: data.periodo?.trim() || undefined,
      hora_gestion: data.hora_gestion?.trim() || undefined,
      descanso: data.descanso?.trim() || undefined,
      notes: data.notes?.trim() || undefined,
      cuotas: Number.isFinite(data.cuotas) ? data.cuotas : undefined,
      semana_trabajo: Number.isFinite(data.semana_trabajo) ? data.semana_trabajo : undefined,
      slug: data.slug.trim(),
      titulo: data.titulo.trim(),
      expires_at: expiresAtIso,
    };
    if (data.id) {
      await updateMutation.mutateAsync({ id: data.id, payload });
    } else {
      await createMutation.mutateAsync(payload);
    }
    reset();
  };

  const startEdit = (link: Link) => {
    if (!canManageLinks) return;
    setValue('id', link.id);
    setValue('campaign', link.campaign);
    setValue('grupo', link.grupo ?? '');
    setValue('titulo', link.titulo);
    setValue('slug', link.slug);
    setValue('periodo', link.periodo ?? '');
    setValue('semana_trabajo', link.semana_trabajo ?? undefined);
    setValue('cuotas', link.cuotas ?? undefined);
    setValue('modalidad', link.modalidad);
    setValue('condicion', link.condicion);
    setValue('hora_gestion', link.hora_gestion ?? '');
    setValue('descanso', link.descanso ?? '');
    setValue('expires_at', toLocalDateTimeInput(link.expires_at));
    setValue('notes', link.notes ?? '');
  };

  const changeStatus = async (linkId: string, action: 'expire' | 'revoke' | 'activate') => {
    if (!canCloseLinks) return;
    await statusMutation.mutateAsync({ id: linkId, action });
  };

  const normalizeNumberValue = (value: number | null | undefined) =>
    Number.isFinite(value) ? value : '';

  const toLocalDateTimeInput = (isoString: string | null | undefined) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) return '';
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
      date.getHours(),
    )}:${pad(date.getMinutes())}`;
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-white to-gea-blue-deep/10 px-4 py-10 text-gea-midnight">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex flex-col gap-2">
          <p className="text-sm text-gea-slate">Links</p>
          <h1 className="text-3xl font-semibold text-gea-midnight">Genera links de reclutamiento</h1>
          <p className="text-sm text-gea-slate">
            Asigna campaña, parámetros por defecto y comparte el slug público.
          </p>
        </header>

        <Card className="space-y-4">
          <SectionHeader
            title={isEditing ? 'Editar link' : 'Nuevo link'}
            subtitle="Define campaña, slug y expiración."
            actions={
              isEditing && canManageLinks && (
                <button type="button" className="btn-secondary" onClick={() => reset()}>
                  Cancelar edición
                </button>
              )
            }
          />
          <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit(onSubmit)}>
            <Field label="Campaña*">
              <Select
                {...register('campaign', { required: 'Selecciona una campaña' })}
                value={values.campaign}
                disabled={!canManageLinks}
              >
                <option value="">Selecciona</option>
                {campaigns.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.codigo} - {c.nombre}
                  </option>
                ))}
              </Select>
              {errors.campaign && <span className="text-xs text-red-600">{errors.campaign.message}</span>}
            </Field>
            <Field label="Grupo">
              <Input
                disabled={!canManageLinks}
                {...register('grupo', {
                  onChange: (e) => setValue('grupo', e.target.value.toUpperCase(), { shouldValidate: false }),
                })}
                value={values.grupo}
              />
            </Field>
            <Field label="Título*">
              <Input
                {...register('titulo', {
                  required: 'Requerido',
                  minLength: { value: 3, message: 'Mínimo 3 caracteres' },
                })}
                value={values.titulo}
                disabled={!canManageLinks}
              />
              {errors.titulo && <span className="text-xs text-red-600">{errors.titulo.message}</span>}
            </Field>
            <Field label="Slug público*">
              <Input
                {...register('slug', {
                  required: 'Requerido',
                  minLength: { value: 3, message: 'Mínimo 3 caracteres' },
                  pattern: { value: /^[a-z0-9-]+$/, message: 'Sólo minúsculas, números y guiones' },
                })}
                value={values.slug}
                disabled={!canManageLinks}
              />
              {errors.slug && <span className="text-xs text-red-600">{errors.slug.message}</span>}
            </Field>
            <Field label="Periodo">
              <Input
                disabled={!canManageLinks}
                {...register('periodo', {
                  onChange: (e) => setValue('periodo', e.target.value.toUpperCase(), { shouldValidate: false }),
                })}
                value={values.periodo ?? ''}
              />
            </Field>
            <Field label="Semana de trabajo">
              <Input
                type="number"
                {...register('semana_trabajo', {
                  valueAsNumber: true,
                  validate: {
                    isNumber: (v) => v === undefined || Number.isFinite(v) || 'Ingresa un número',
                    range: (v) => v === undefined || (v >= 1 && v <= 53) || 'Debe estar entre 1 y 53',
                  },
                })}
                disabled={!canManageLinks}
                value={normalizeNumberValue(values.semana_trabajo)}
              />
              {errors.semana_trabajo && (
                <span className="text-xs text-red-600">{errors.semana_trabajo.message as string}</span>
              )}
            </Field>
            <Field label="Cuotas">
              <Input
                type="number"
                {...register('cuotas', {
                  valueAsNumber: true,
                  validate: {
                    isNumber: (v) => v === undefined || Number.isFinite(v) || 'Ingresa un número',
                    positive: (v) => v === undefined || v > 0 || 'Debe ser mayor a 0',
                  },
                })}
                value={normalizeNumberValue(values.cuotas)}
                disabled={!canManageLinks}
              />
              {errors.cuotas && <span className="text-xs text-red-600">{errors.cuotas.message as string}</span>}
            </Field>
            <Field label="Modalidad">
              <Select {...register('modalidad')} value={values.modalidad} disabled={!canManageLinks}>
                <option value="presencial">Presencial</option>
                <option value="remoto">Remoto</option>
                <option value="hibrido">Híbrido</option>
              </Select>
            </Field>
            <Field label="Condición">
              <Select {...register('condicion')} value={values.condicion} disabled={!canManageLinks}>
                <option value="full_time">Full Time</option>
                <option value="part_time">Part Time</option>
                <option value="flex">Flexible</option>
              </Select>
            </Field>
            <Field label="Hora de gestión">
              <Input {...register('hora_gestion')} value={values.hora_gestion ?? ''} disabled={!canManageLinks} />
            </Field>
            <Field label="Descanso">
              <Input {...register('descanso')} value={values.descanso ?? ''} disabled={!canManageLinks} />
            </Field>
            <Field label="Expira el*">
              <Input
                type="datetime-local"
                {...register('expires_at', { required: 'Requerido' })}
                disabled={!canManageLinks}
                value={values.expires_at}
              />
              {errors.expires_at && <span className="text-xs text-red-600">{errors.expires_at.message}</span>}
            </Field>
            <div className="md:col-span-2">
              <Field label="Notas">
                <Textarea {...register('notes')} value={values.notes ?? ''} disabled={!canManageLinks} />
              </Field>
            </div>

            {(error || createMutation.error || updateMutation.error) && (
              <p className="text-sm text-red-600 md:col-span-2">
                {error instanceof Error
                  ? error.message
                  : (createMutation.error instanceof ApiError && createMutation.error.message) ||
                    (updateMutation.error instanceof ApiError && updateMutation.error.message) ||
                    'Error al guardar'}
              </p>
            )}

            <div className="flex gap-3 md:col-span-2">
              <button type="submit" className="btn-primary" disabled={saving || !canManageLinks}>
                {saving ? 'Guardando…' : isEditing ? 'Actualizar' : 'Crear link'}
              </button>
              <button type="button" className="btn-secondary" onClick={() => reset()} disabled={saving || !canManageLinks}>
                Limpiar
              </button>
            </div>
          </form>
          {!canManageLinks && <p className="text-xs text-gea-slate">No tienes permiso para crear o editar links.</p>}
        </Card>

        <Card className="space-y-3">
          <SectionHeader title="Listado" actions={isLoading ? <span className="pill">Cargando…</span> : null} />
          {!canReadLinks && <p className="text-sm text-gea-slate">No tienes permiso para ver links.</p>}
          {!isLoading && canReadLinks && items.length === 0 && <p className="text-sm text-gea-slate">Sin links.</p>}
          <div className="grid gap-3 md:grid-cols-2">
            {canReadLinks &&
              items.map((link) => (
                <article key={link.id} className="rounded-2xl border border-gea-midnight/10 bg-white/90 p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                    <p className="text-xs uppercase text-gea-slate">{link.slug}</p>
                    <h3 className="text-lg font-semibold text-gea-midnight">{link.titulo}</h3>
                  </div>
                  <div className="flex flex-col gap-1 text-right">
                    <span className="pill bg-gea-midnight/10 text-xs">{link.estado}</span>
                    <span className="text-[11px] text-gea-slate">Campaña: {link.campaign}</span>
                  </div>
                </div>
                <p className="text-sm text-gea-slate">
                  Mod: {link.modalidad} · Cond: {link.condicion} · Hr: {link.hora_gestion || '—'}
                </p>
                <p className="text-xs text-gea-slate">
                  Vence:{' '}
                  {new Intl.DateTimeFormat('es-PE', { dateStyle: 'medium', timeStyle: 'short' }).format(
                    new Date(link.expires_at),
                  )}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {canManageLinks && (
                    <button type="button" className="pill bg-gea-midnight/10" onClick={() => startEdit(link)}>
                      Editar
                    </button>
                  )}
                  {canCloseLinks && (
                    <button
                      type="button"
                      className="pill bg-orange-100 text-orange-700"
                      onClick={() => changeStatus(link.id, 'expire')}
                      disabled={statusMutation.isPending}
                    >
                      Expirar
                    </button>
                  )}
                  {canCloseLinks && (
                    <button
                      type="button"
                      className="pill bg-red-100 text-red-700"
                      onClick={() => changeStatus(link.id, 'revoke')}
                      disabled={statusMutation.isPending}
                    >
                      Revocar
                    </button>
                  )}
                  {canCloseLinks && (
                    <button
                      type="button"
                      className="pill bg-green-100 text-green-700"
                      onClick={() => changeStatus(link.id, 'activate')}
                      disabled={statusMutation.isPending}
                    >
                      Activar
                    </button>
                  )}
                </div>
                <p className="mt-2 break-all text-[11px] text-gea-slate">URL pública: /apply/{link.slug}</p>
              </article>
              ))}
          </div>
        </Card>
      </div>
    </main>
  );
}
