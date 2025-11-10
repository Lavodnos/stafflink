import { useState } from 'react';

import { useAuth } from '../modules/auth/useAuth';

export function DashboardPage() {
  const { user, logout } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleLogout = async () => {
    setIsSigningOut(true);
    try {
      await logout();
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gea-midnight via-gea-blue-deep to-black/90 px-6 py-10 text-gea-white">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-white/10 bg-white/5 px-6 py-5 backdrop-blur">
        <div>
          <p className="text-sm text-gea-slate">Panel operativo</p>
          <h1 className="text-3xl font-semibold text-white">Hola, {user?.first_name ?? user?.email ?? 'usuario'} 👋</h1>
          <p className="text-sm text-white/70">Gestiona tus accesos y sesiones desde un único lugar.</p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          disabled={isSigningOut}
          className="rounded-full border border-white/20 px-5 py-2 text-sm font-semibold text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSigningOut ? 'Cerrando sesión…' : 'Cerrar sesión'}
        </button>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-3xl border border-white/10 bg-white/5 p-5 text-white/85">
          <h2 className="text-lg font-semibold text-white">Estado de sesión</h2>
          <p className="text-sm text-white/70">
            Último acceso registrado para <strong className="font-semibold text-gea-green">{user?.email}</strong>. Usa este panel para
            monitorear sesiones e iniciar flujos IAM.
          </p>
        </article>
        <article className="rounded-3xl border border-white/10 bg-white/5 p-5 text-white/85">
          <h2 className="text-lg font-semibold text-white">Próximamente</h2>
          <p className="text-sm text-white/70">Sección reservada para métricas y accesos rápidos a los módulos de reclutamiento.</p>
        </article>
      </section>
    </div>
  );
}
