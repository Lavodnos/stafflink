import { Navigate, useLocation } from 'react-router-dom';

import { useAuth } from '../modules/auth/useAuth';

interface RequireAuthProps {
  children: React.ReactElement;
}

export function RequireAuth({ children }: RequireAuthProps) {
  const { isAuthenticated, isReady } = useAuth();
  const location = useLocation();

  if (!isReady) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-gea-blue-deep via-gea-midnight to-black/90 px-4 py-8">
        <div className="pointer-events-none absolute -top-24 -right-16 h-72 w-72 rounded-full bg-gradient-to-br from-gea-green to-gea-green-light blur-3xl opacity-60" />
        <div className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-gradient-to-br from-gea-red to-gea-orange blur-3xl opacity-40" />
        <p className="text-base font-medium text-white/80">Cargando sesión…</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}
