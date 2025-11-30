import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { BlacklistEntry } from './api';
import {
  createBlacklistEntry,
  deleteBlacklistEntry,
  fetchBlacklist,
  updateBlacklistEntry,
} from './api';

const blacklistKey = ['blacklist'];

export function useBlacklist(enabled = true) {
  return useQuery({
    queryKey: blacklistKey,
    queryFn: fetchBlacklist,
    enabled,
  });
}

export function useCreateBlacklist() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: createBlacklistEntry,
    onSuccess: (created) => {
      client.setQueryData<BlacklistEntry[]>(blacklistKey, (prev) => (prev ? [created, ...prev] : [created]));
    },
  });
}

export function useUpdateBlacklist() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<BlacklistEntry> }) =>
      updateBlacklistEntry(id, payload),
    onSuccess: (updated) => {
      client.setQueryData<BlacklistEntry[]>(blacklistKey, (prev) =>
        prev ? prev.map((b) => (b.id === updated.id ? updated : b)) : [updated],
      );
    },
  });
}

export function useDeleteBlacklist() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteBlacklistEntry(id),
    onSuccess: (_, id) => {
      client.setQueryData<BlacklistEntry[]>(blacklistKey, (prev) => prev?.filter((b) => b.id !== id) ?? []);
    },
  });
}

