/* eslint-disable react-refresh/only-export-components */
import { create } from 'zustand';

type ToastType = 'success' | 'error' | 'warning' | 'info';
type Toast = { id: string; type: ToastType; message: string; duration?: number };

type ToastStore = {
  toasts: Toast[];
  add: (toast: Omit<Toast, 'id'>) => void;
  remove: (id: string) => void;
};

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  add: (toast) => {
    const id = crypto.randomUUID();
    set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }));
    if (toast.duration !== Infinity) {
      setTimeout(() => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })), toast.duration || 3000);
    }
  },
  remove: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));

const tone: Record<ToastType, string> = {
  success: 'bg-success-500/10 text-success-500 border border-success-500/30',
  error: 'bg-error-500/10 text-error-500 border border-error-500/30',
  warning: 'bg-warning-500/10 text-warning-500 border border-warning-500/30',
  info: 'bg-info-500/10 text-info-500 border border-info-500/30',
};

export function ToastContainer() {
  const { toasts, remove } = useToastStore();
  if (!toasts.length) return null;
  return (
    <div
      className="pointer-events-none fixed right-4 top-4 z-50 flex flex-col gap-2"
      role="region"
      aria-label="Notificaciones"
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-center gap-3 rounded-lg px-4 py-3 shadow-theme-md backdrop-blur ${tone[toast.type]}`}
          role={toast.type === 'error' ? 'alert' : 'status'}
        >
          <span className="text-lg">
            {toast.type === 'success' && '✓'}
            {toast.type === 'error' && '✕'}
            {toast.type === 'warning' && '⚠'}
            {toast.type === 'info' && 'ℹ'}
          </span>
          <span className="text-sm">{toast.message}</span>
          <button
            onClick={() => remove(toast.id)}
            className="ml-auto rounded-full px-2 py-1 text-sm hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
            aria-label="Cerrar notificación"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
