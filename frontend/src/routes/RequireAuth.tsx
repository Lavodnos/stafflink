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
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-gea-midnight via-gea-blue-deep to-black px-4 py-8">
        <p className="rounded-2xl border border-white/15 bg-white/5 px-6 py-3 text-base font-medium text-white/80 backdrop-blur">
          Cargando sesión…
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}
