import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type {
  Candidate,
  CandidateAssignment,
  CandidateDetail,
  CandidateDocuments,
  CandidateProcess,
} from './api';
import {
  fetchCandidate,
  fetchCandidates,
  updateCandidate,
  updateCandidateAssignment,
  updateCandidateDocuments,
  updateCandidateProcess,
} from './api';

const candidatesKey = ['candidates'];

export function useCandidates(enabled = true, convocatoriaId?: string) {
  return useQuery({
    queryKey: convocatoriaId
      ? [...candidatesKey, { convocatoriaId }]
      : candidatesKey,
    queryFn: () => fetchCandidates(convocatoriaId),
    enabled,
  });
}

export function useCandidate(id?: string) {
  return useQuery({
    queryKey: [...candidatesKey, id],
    queryFn: () => fetchCandidate(id!),
    enabled: Boolean(id),
  });
}

export function useUpdateCandidate() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Candidate> }) => updateCandidate(id, payload),
    onSuccess: (updated) => {
      client.setQueryData<CandidateDetail | undefined>([...candidatesKey, updated.id], updated);
      client.setQueryData<Candidate[]>(candidatesKey, (prev) =>
        prev ? prev.map((c) => (c.id === updated.id ? { ...c, ...updated } : c)) : [updated],
      );
    },
  });
}

export function useUpdateDocuments() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CandidateDocuments }) =>
      updateCandidateDocuments(id, payload),
    onSuccess: (updated) => {
      client.setQueryData<CandidateDetail | undefined>([...candidatesKey, updated.id], updated);
    },
  });
}

export function useUpdateProcess() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CandidateProcess }) => updateCandidateProcess(id, payload),
    onSuccess: (updated) => {
      client.setQueryData<CandidateDetail | undefined>([...candidatesKey, updated.id], updated);
    },
  });
}

export function useUpdateAssignment() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CandidateAssignment }) =>
      updateCandidateAssignment(id, payload),
    onSuccess: (updated) => {
      client.setQueryData<CandidateDetail | undefined>([...candidatesKey, updated.id], updated);
    },
  });
}
