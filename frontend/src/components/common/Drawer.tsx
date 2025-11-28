import { useEffect, useRef } from 'react';
import cn from 'clsx';

type DrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  position?: 'right' | 'left';
  width?: 'sm' | 'md' | 'lg';
};

const widthMap = {
  sm: 'w-full max-w-md',
  md: 'w-full max-w-xl',
  lg: 'w-full max-w-2xl',
};

/**
 * Accessible drawer (sheet) with overlay. Keeps context for list/detail flows.
 */
export function Drawer({ isOpen, onClose, title, children, position = 'right', width = 'md' }: DrawerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prev = document.activeElement as HTMLElement | null;
    sentinelRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      prev?.focus?.();
    };
  }, [isOpen, onClose]);

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 bg-black/40 transition',
        isOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0',
      )}
      aria-hidden={!isOpen}
      onClick={onClose}
    >
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          'absolute top-0 h-full bg-white shadow-theme-lg transition-transform dark:bg-gray-900',
          position === 'right' ? 'right-0' : 'left-0',
          isOpen ? 'translate-x-0' : position === 'right' ? 'translate-x-full' : '-translate-x-full',
          widthMap[width],
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <button ref={sentinelRef} className="sr-only" aria-hidden="true" />
        <div className="flex items-start justify-between gap-4 border-b border-gray-200 p-4 dark:border-gray-800">
          {title && <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>}
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 dark:text-gray-300 dark:hover:bg-gray-800"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>
        <div className="h-[calc(100%-64px)] overflow-y-auto p-4">{children}</div>
      </div>
    </div>
  );
}
