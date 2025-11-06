import { useAuth } from '../modules/auth/useAuth';

export function DashboardPage() {
  const { user } = useAuth();

  return (
    <div style={{ padding: '2rem', color: '#fff' }}>
      <h1>Panel de Stafflink</h1>
      <p>Bienvenido {user?.first_name ?? user?.email ?? 'usuario'}.</p>
      <p>Próximamente verás tus herramientas de reclutamiento aquí.</p>
    </div>
  );
}
