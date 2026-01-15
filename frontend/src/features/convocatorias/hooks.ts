import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { Convocatoria, ConvocatoriaPayload } from './api';
import {
  createConvocatoria,
  deleteConvocatoria,
  fetchEncargados,
  fetchConvocatorias,
  setConvocatoriaStatus,
  updateConvocatoria,
} from './api';

const convocatoriasKey = ['convocatorias'];

export function useConvocatorias(enabled = true) {
  return useQuery({
    queryKey: convocatoriasKey,
    queryFn: fetchConvocatorias,
    enabled,
  });
}

export function useEncargados(enabled = true) {
  return useQuery({
    queryKey: [...convocatoriasKey, 'encargados'],
    queryFn: fetchEncargados,
    enabled,
  });
}

export function useCreateConvocatoria() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (payload: ConvocatoriaPayload) => createConvocatoria(payload),
    onSuccess: (convocatoria) => {
      client.setQueryData<Convocatoria[]>(
        convocatoriasKey,
        (prev) => (prev ? [convocatoria, ...prev] : [convocatoria]),
      );
    },
  });
}

export function useUpdateConvocatoria() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<ConvocatoriaPayload> }) =>
      updateConvocatoria(id, payload),
    onSuccess: (convocatoria) => {
      client.setQueryData<Convocatoria[]>(
        convocatoriasKey,
        (prev) =>
          prev ? prev.map((i) => (i.id === convocatoria.id ? convocatoria : i)) : [convocatoria],
      );
    },
  });
}

export function useConvocatoriaStatus() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: 'expire' | 'revoke' | 'activate' }) =>
      setConvocatoriaStatus(id, action),
    onSuccess: (convocatoria) => {
      client.setQueryData<Convocatoria[]>(
        convocatoriasKey,
        (prev) =>
          prev
            ? prev.map((i) => (i.id === convocatoria.id ? convocatoria : i))
            : [convocatoria],
      );
    },
  });
}

export function useDeleteConvocatoria() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteConvocatoria(id),
    onSuccess: (_, id) => {
      client.setQueryData<Convocatoria[]>(
        convocatoriasKey,
        (prev) => (prev ? prev.filter((item) => item.id !== id) : prev),
      );
    },
  });
}
