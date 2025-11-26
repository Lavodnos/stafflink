import { useState } from 'react';
import { Link } from 'react-router-dom';

import { useAuth } from '../modules/auth/useAuth';

const cards = [
  {
    title: 'Campañas',
    description: 'Crea y gestiona campañas activas.',
    to: '/campaigns',
    badge: 'campaigns.manage',
  },
  {
    title: 'Blacklist',
    description: 'Administra vetados a nivel global.',
    to: '/blacklist',
    badge: 'blacklist.manage',
  },
  {
    title: 'Links',
    description: 'Genera links de reclutamiento y controla su estado.',
    to: '/links',
    badge: 'links.manage',
  },
  {
    title: 'Candidatos',
    description: 'Revisa datos, checklist, proceso y contrato.',
    to: '/candidates',
    badge: 'candidates.read',
  },
];

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
    <div className="min-h-screen bg-gradient-to-b from-white via-white to-gea-blue-deep/10 px-6 py-10 text-gea-midnight">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-gea-midnight/10 bg-white/90 px-6 py-5 shadow-lg shadow-gea-midnight/5 backdrop-blur">
        <div>
          <p className="text-sm text-gea-slate">Panel Stafflink</p>
          <h1 className="text-3xl font-semibold text-gea-midnight">
            Hola, {user?.first_name ?? user?.email ?? 'usuario'} 👋
          </h1>
          <p className="text-sm text-gea-slate">Navega los módulos de reclutamiento y verificación.</p>
        </div>
        <button type="button" onClick={handleLogout} disabled={isSigningOut} className="btn-secondary">
          {isSigningOut ? 'Cerrando sesión…' : 'Cerrar sesión'}
        </button>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        {cards.map((card) => (
          <Link
            key={card.title}
            to={card.to}
            className="card hover:shadow-xl hover:shadow-gea-midnight/10"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gea-midnight">{card.title}</h2>
              <span className="pill bg-gea-midnight/10 text-xs">{card.badge}</span>
            </div>
            <p className="mt-2 text-sm text-gea-slate">{card.description}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}
