import { NavLink } from 'react-router-dom';
import { usePermission } from '../../modules/auth/usePermission';
import cn from 'clsx';

type NavItem = {
  label: string;
  to: string;
  permission?: string;
};

const items: NavItem[] = [
  { label: 'Dashboard', to: '/' },
  { label: 'Campañas', to: '/campaigns', permission: 'campaigns.read' },
  { label: 'Links', to: '/links', permission: 'links.read' },
  { label: 'Candidatos', to: '/candidates', permission: 'candidates.read' },
  { label: 'Blacklist', to: '/blacklist', permission: 'blacklist.read' },
];

type SidebarProps = {
  mobileOpen?: boolean;
  onClose?: () => void;
};

export function SidebarOld({ mobileOpen = false, onClose }: SidebarProps) {
  return (
    <>
      <aside className="hidden w-60 shrink-0 flex-col gap-3 bg-gradient-to-b from-gea-midnight via-gea-blue-deep to-gea-green-petrol/80 px-4 py-6 text-white shadow-2xl lg:flex">
        <Brand />
        <nav className="space-y-1">
          {items.map((item) => (
            <SidebarItem key={item.to} item={item} />
          ))}
        </nav>
        <SidebarFooter />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden" onClick={onClose} />
      )}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-gea-midnight via-gea-blue-deep to-gea-green-petrol/80 px-4 py-6 text-white shadow-2xl transition-transform lg:hidden',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex items-center justify-between">
          <Brand />
          {onClose && (
            <button
              type="button"
              className="btn-secondary px-3 py-2 text-sm text-gea-midnight"
              onClick={onClose}
              aria-label="Cerrar menú"
            >
              ✕
            </button>
          )}
        </div>
        <nav className="mt-4 space-y-1">
          {items.map((item) => (
            <SidebarItem key={item.to} item={item} onSelect={onClose} />
          ))}
        </nav>
        <SidebarFooter />
      </aside>
    </>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-3 py-2">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-gea-midnight font-extrabold text-lg">
        G
      </div>
      <div>
        <p className="text-sm uppercase tracking-wide text-white/80">Stafflink</p>
        <p className="text-lg font-semibold text-white">GEA</p>
      </div>
    </div>
  );
}

function SidebarItem({ item, onSelect }: { item: NavItem; onSelect?: () => void }) {
  const allowed = usePermission(item.permission ?? '');
  if (item.permission && !allowed) return null;
  return (
    <NavLink
      to={item.to}
      onClick={onSelect}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition',
          isActive
            ? 'bg-white text-gea-midnight shadow-lg'
            : 'text-white/80 hover:bg-white/10 hover:text-white',
        )
      }
    >
      <span>{item.label}</span>
    </NavLink>
  );
}

function SidebarFooter() {
  return (
    <div className="mt-auto rounded-2xl border border-white/10 bg-white/10 p-3 text-xs text-white/80">
      <p className="font-semibold text-white">Stafflink</p>
      <p>GEA · Backoffice</p>
    </div>
  );
}
