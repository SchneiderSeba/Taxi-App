import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';
import { ToastContext, type ToastTone } from './toast-context';

type ToastItem = {
  id: number;
  message: string;
  tone: ToastTone;
};

const toneStyles: Record<ToastTone, string> = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  error: 'border-red-200 bg-red-50 text-red-900',
  info: 'border-blue-200 bg-blue-50 text-blue-900',
};

const toneIcons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const notify = useCallback((message: string, tone: ToastTone = 'info') => {
    const id = ++nextId.current;
    setToasts((current) => [...current, { id, message, tone }]);
    window.setTimeout(() => dismiss(id), 5000);
  }, [dismiss]);

  const value = useMemo(() => ({ notify }), [notify]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-4 top-4 z-[100] flex w-[min(92vw,24rem)] flex-col gap-3" aria-live="polite" aria-atomic="false">
        {toasts.map((toast) => {
          const Icon = toneIcons[toast.tone];
          return (
            <div key={toast.id} role={toast.tone === 'error' ? 'alert' : 'status'} className={`flex items-start gap-3 rounded-xl border p-4 shadow-xl ${toneStyles[toast.tone]}`}>
              <Icon className="mt-0.5 h-5 w-5 shrink-0" />
              <p className="flex-1 text-sm font-medium">{toast.message}</p>
              <button type="button" onClick={() => dismiss(toast.id)} className="rounded p-1 hover:bg-black/5" aria-label="Cerrar mensaje">
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
