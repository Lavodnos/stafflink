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
        className="flex items-center gap-2 rounded-full border border-gea-midnight/10 bg-white px-3 py-2 text-sm font-semibold text-gea-midnight shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-gea-midnight/30"
        onClick={() => setOpen((v) => !v)}
        aria-label="Menú de usuario"
        aria-haspopup="true"
        aria-expanded={open}
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gea-midnight text-white">
          {initials || 'U'}
        </span>
        <span className="hidden sm:block">{user?.first_name || user?.email || 'Usuario'}</span>
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 w-56 rounded-2xl border border-gea-midnight/10 bg-white p-2 shadow-lg"
          role="menu"
          aria-label="Opciones de usuario"
        >
          <div className="rounded-xl px-3 py-2 text-xs text-gea-slate">
            <p className="font-semibold text-gea-midnight">{user?.first_name || user?.email || 'Usuario'}</p>
            {user?.email && <p className="truncate">{user.email}</p>}
          </div>
          <a
            href={IAM_SECURITY_URL}
            target="_blank"
            rel="noreferrer"
            className="block rounded-xl px-3 py-2 text-sm font-medium text-gea-midnight hover:bg-gea-midnight/5 focus:outline-none focus:ring-2 focus:ring-gea-midnight/30"
            role="menuitem"
          >
            Seguridad / Cambiar contraseña
          </a>
          <button
            type="button"
            className={cn(
              'mt-1 w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-gea-midnight hover:bg-gea-midnight/5 focus:outline-none focus:ring-2 focus:ring-gea-midnight/30',
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
