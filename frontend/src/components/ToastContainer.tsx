import { useEffect, useState } from 'react';
import clsx from 'clsx';

type Toast = {
  id: number;
  message: string;
  type?: 'info' | 'success' | 'error';
};

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    let counter = 0;
    const handler = (event: Event) => {
      const detail = (event as CustomEvent).detail as Partial<Toast> | undefined;
      if (!detail?.message) return;
      const id = ++counter;
      const next: Toast = { id, message: detail.message, type: detail.type ?? 'info' };
      setToasts((prev) => [...prev, next]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3000);
    };
    window.addEventListener('app:toast', handler as EventListener);
    return () => window.removeEventListener('app:toast', handler as EventListener);
  }, []);

  if (!toasts.length) return null;

  return (
    <div className="fixed inset-x-0 top-4 z-[9999] flex flex-col items-center gap-3 px-4">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={clsx(
            'w-full max-w-sm rounded-xl border px-4 py-3 shadow-theme-lg backdrop-blur',
            'bg-white/90 text-gray-900 border-gray-200 dark:bg-gray-900/90 dark:text-white dark:border-gray-800',
            {
              'border-green-200 dark:border-green-800 text-green-800 dark:text-green-200':
                toast.type === 'success',
              'border-red-200 dark:border-red-800 text-red-800 dark:text-red-200': toast.type === 'error',
            },
          )}
        >
          <p className="text-sm font-medium leading-normal">{toast.message}</p>
        </div>
      ))}
    </div>
  );
}
