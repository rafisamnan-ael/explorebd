import { useUiStore } from '@/store/uiStore';

export function Toaster() {
  const toasts = useUiStore((s) => s.toasts);
  if (!toasts.length) return null;
  return (
    <div className="toast-region" role="status" aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} className="toast" data-tone={toast.tone}>
          {toast.message}
        </div>
      ))}
    </div>
  );
}
