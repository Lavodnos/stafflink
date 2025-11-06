import { useContext } from 'react';

import { AuthContext } from './context';
import type { AuthState } from './types';

export function useAuth(): AuthState {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}
