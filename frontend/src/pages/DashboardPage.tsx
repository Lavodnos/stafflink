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
        <Link key={card.title} to={card.to} className="card hover:shadow-xl hover:shadow-gea-midnight/10">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gea-midnight">{card.title}</h2>
            <span className="pill bg-gea-midnight/10 text-xs">{card.badge}</span>
          </div>
          <p className="mt-2 text-sm text-gea-slate">{card.description}</p>
        </Link>
      ))}
    </section>
  );
}
