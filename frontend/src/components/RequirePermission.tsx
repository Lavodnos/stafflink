import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

import { usePermission } from '../modules/auth/usePermission';

type Mode = 'all' | 'any';

type Props = {
  required: string | string[];
  mode?: Mode;
  fallback?: ReactNode;
  children: ReactNode;
};

export function RequirePermission({ required, mode = 'all', fallback = null, children }: Props) {
  const allowed = usePermission(required, mode);
  if (!allowed) {
    return <>{fallback ?? <Navigate to="/forbidden" replace />}</>;
  }
  return <>{children}</>;
}
