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

export function Sidebar({ mobileOpen = false, onClose }: SidebarProps) {
  return (
    <>
      <aside className="hidden h-screen w-64 shrink-0 flex-col gap-4 border-r border-gray-200 bg-white px-4 py-6 text-gray-900 shadow-theme-lg dark:border-[#1f2a3d] dark:bg-[#0f172a] dark:text-[#e8eefc] lg:flex">
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
          'fixed inset-y-0 left-0 z-50 w-72 border-r border-gray-200 bg-white px-4 py-6 text-gray-900 shadow-theme-lg transition-transform dark:border-[#1f2a3d] dark:bg-[#0f172a] dark:text-[#e8eefc] lg:hidden',
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
    <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 shadow-theme-sm dark:border-gray-800 dark:bg-gray-800">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500 text-white text-lg font-bold shadow-theme-sm">
        G
      </div>
      <div className="leading-tight">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Stafflink</p>
        <p className="text-lg font-semibold text-gray-900 dark:text-white">GEA</p>
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
          'menu-item',
          isActive ? 'menu-item-active shadow-theme-sm' : 'menu-item-inactive',
        )
      }
    >
      <span className="menu-item-text">{item.label}</span>
    </NavLink>
  );
}

function SidebarFooter() {
  return (
    <div className="mt-auto rounded-xl border border-gray-200 bg-gray-50 p-3 text-xs text-gray-500 dark:border-gray-800 dark:bg-gray-800/60 dark:text-gray-300">
      <p className="font-semibold text-gray-900 dark:text-white">Stafflink</p>
      <p>GEA · Backoffice</p>
    </div>
  );
}
