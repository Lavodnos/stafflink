import { useEffect, useState } from 'react';

import type { PublicConvocatoria } from './api';
import { ApiError } from '../../lib/apiError';
import { fetchPublicConvocatoria } from './api';

type PublicConvocatoriaState = {
  data: PublicConvocatoria | null;
  isLoading: boolean;
  error: string | null;
};

export function usePublicConvocatoria(slug?: string): PublicConvocatoriaState {
  const [state, setState] = useState<PublicConvocatoriaState>({
    data: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    let active = true;
    async function load() {
      if (!slug) {
        setState({ data: null, isLoading: false, error: 'Convocatoria inválida.' });
        return;
      }
      setState({ data: null, isLoading: true, error: null });
      try {
        const data = await fetchPublicConvocatoria(slug);
        if (active) {
          setState({ data, isLoading: false, error: null });
        }
      } catch (err) {
        if (!active) return;
        const message =
          err instanceof ApiError ? err.message : 'No pudimos cargar la convocatoria.';
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
