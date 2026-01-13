import { useNavigate } from 'react-router-dom';

import { Card } from '../components/ui';

export function ForbiddenPage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="w-full max-w-xl space-y-4 rounded-3xl border border-gray-200 bg-white p-6 shadow-theme-lg dark:border-gray-800 dark:bg-gray-950">
        <div className="space-y-2">
          <p className="text-sm font-semibold text-brand-600">Acceso denegado</p>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            No tienes permisos para ver esta seccion.
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Si crees que es un error, solicita acceso al administrador.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button type="button" className="btn-secondary" onClick={() => navigate(-1)}>
            Volver
          </button>
          <button type="button" className="btn-primary" onClick={() => navigate('/')}>
            Ir al inicio
          </button>
        </div>
      </Card>
    </div>
  );
}
