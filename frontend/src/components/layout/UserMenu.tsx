import { useEffect, useRef, useState } from 'react';
import cn from 'clsx';
import { useAuth } from '../../modules/auth/useAuth';

const IAM_SECURITY_URL = 'https://iam.gea.local'; // Ajusta si hay otra URL pública del IAM

export function UserMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const initials =
    (user?.first_name?.[0] || '') + (user?.last_name?.[0] || user?.email?.[0] || '').toUpperCase();

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape') setOpen(false);
    };
    const onClickOutside = (ev: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(ev.target as Node)) {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('mousedown', onClickOutside);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('mousedown', onClickOutside);
    };
  }, [open]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-800 shadow-theme-xs transition hover:bg-gray-100 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-500/30 dark:border-gray-800 dark:bg-gray-900 dark:text-white"
        onClick={() => setOpen((v) => !v)}
        aria-label="Menú de usuario"
        aria-haspopup="true"
        aria-expanded={open}
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-500 text-white shadow-theme-xs">
          {initials || 'U'}
        </span>
        <span className="hidden sm:block">{user?.first_name || user?.email || 'Usuario'}</span>
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 w-56 rounded-xl border border-gray-200 bg-white p-2 shadow-theme-lg dark:border-gray-800 dark:bg-gray-900"
          role="menu"
          aria-label="Opciones de usuario"
        >
          <div className="rounded-lg px-3 py-2 text-xs text-gray-500 dark:text-gray-300">
            <p className="font-semibold text-gray-900 dark:text-white">{user?.first_name || user?.email || 'Usuario'}</p>
            {user?.email && <p className="truncate">{user.email}</p>}
          </div>
          <a
            href={IAM_SECURITY_URL}
            target="_blank"
            rel="noreferrer"
            className="block rounded-lg px-3 py-2 text-sm font-medium text-gray-800 transition hover:bg-gray-100 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-500/30 dark:text-white dark:hover:bg-gray-800"
            role="menuitem"
          >
            Seguridad / Cambiar contraseña
          </a>
          <button
            type="button"
            className={cn(
              'mt-1 w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-gray-800 transition hover:bg-gray-100 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-500/30 dark:text-white dark:hover:bg-gray-800',
              loading && 'opacity-60',
            )}
            onClick={handleLogout}
            disabled={loading}
            role="menuitem"
          >
            {loading ? 'Cerrando sesión…' : 'Cerrar sesión'}
          </button>
        </div>
      )}
    </div>
  );
}
