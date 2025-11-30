import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { Link, LinkPayload } from './api';
import { createLink, fetchLinks, setLinkStatus, updateLink } from './api';

const linksKey = ['links'];

export function useLinks(enabled = true) {
  return useQuery({
    queryKey: linksKey,
    queryFn: fetchLinks,
    enabled,
  });
}

export function useCreateLink() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (payload: LinkPayload) => createLink(payload),
    onSuccess: (link) => {
      client.setQueryData<Link[]>(linksKey, (prev) => (prev ? [link, ...prev] : [link]));
    },
  });
}

export function useUpdateLink() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<LinkPayload> }) => updateLink(id, payload),
    onSuccess: (link) => {
      client.setQueryData<Link[]>(linksKey, (prev) => (prev ? prev.map((i) => (i.id === link.id ? link : i)) : [link]));
    },
  });
}

export function useLinkStatus() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: 'expire' | 'revoke' | 'activate' }) => setLinkStatus(id, action),
    onSuccess: (link) => {
      client.setQueryData<Link[]>(linksKey, (prev) => (prev ? prev.map((i) => (i.id === link.id ? link : i)) : [link]));
    },
  });
}

