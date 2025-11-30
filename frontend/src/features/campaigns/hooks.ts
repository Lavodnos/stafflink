import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { Campaign } from './api';
import { createCampaign, fetchCampaigns, updateCampaign } from './api';

const campaignsKey = ['campaigns'];

export function useCampaigns(enabled = true) {
  return useQuery({
    queryKey: campaignsKey,
    queryFn: fetchCampaigns,
    enabled,
  });
}

export function useCreateCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCampaign,
    onSuccess: (created) => {
      queryClient.setQueryData<Campaign[]>(campaignsKey, (prev) => (prev ? [created, ...prev] : [created]));
    },
  });
}

export function useUpdateCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Campaign> }) => updateCampaign(id, payload),
    onSuccess: (updated) => {
      queryClient.setQueryData<Campaign[]>(campaignsKey, (prev) =>
        prev ? prev.map((c) => (c.id === updated.id ? updated : c)) : [updated],
      );
    },
  });
}

