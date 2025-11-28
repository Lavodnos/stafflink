import { Link } from 'react-router-dom';

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
  return (
    <section className="grid gap-4 md:grid-cols-2">
      {cards.map((card) => (
        <Link
          key={card.title}
          to={card.to}
          className="card group hover:shadow-theme-xl transition"
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                {card.badge}
              </p>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{card.title}</h2>
            </div>
            <span className="pill text-xs">{card.badge}</span>
          </div>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{card.description}</p>
        </Link>
      ))}
    </section>
  );
}
