import { Navigate, useLocation } from 'react-router-dom';

import { useAuth } from '../modules/auth/useAuth';

interface RequireAuthProps {
  children: React.ReactElement;
}

export function RequireAuth({ children }: RequireAuthProps) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}
