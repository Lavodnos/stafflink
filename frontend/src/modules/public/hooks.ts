import { useEffect, useState } from 'react';

import type { PublicLink } from './api';
import { ApiError } from '../../lib/apiError';
import { fetchPublicLink } from './api';

type PublicLinkState = {
  data: PublicLink | null;
  isLoading: boolean;
  error: string | null;
};

export function usePublicLink(slug?: string): PublicLinkState {
  const [state, setState] = useState<PublicLinkState>({
    data: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    let active = true;
    async function load() {
      if (!slug) {
        setState({ data: null, isLoading: false, error: 'Link inválido.' });
        return;
      }
      setState({ data: null, isLoading: true, error: null });
      try {
        const data = await fetchPublicLink(slug);
        if (active) {
          setState({ data, isLoading: false, error: null });
        }
      } catch (err) {
        if (!active) return;
        const message = err instanceof ApiError ? err.message : 'No pudimos cargar el link.';
        setState({ data: null, isLoading: false, error: message });
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [slug]);

  return state;
}
