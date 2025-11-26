import { useAuth } from './useAuth';

type Mode = 'all' | 'any';

/**
 * Hook de conveniencia para consultar permisos ya normalizados (lowercase).
 */
export function usePermission(required: string | string[], mode: Mode = 'all'): boolean {
  const { hasPermission } = useAuth();
  return hasPermission(required, mode);
}

