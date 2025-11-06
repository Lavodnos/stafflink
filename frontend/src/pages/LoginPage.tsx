import { Navigate } from 'react-router-dom';

import { LoginForm } from '../modules/auth/components/LoginForm';
import { useAuth } from '../modules/auth/useAuth';

export function LoginPage() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="app-shell">
      <LoginForm />
    </div>
  );
}
