import { create } from 'zustand';

export interface Toast {
  id: string;
  message: string;
  tone?: 'default' | 'success' | 'danger';
}

interface UiState {
  toasts: Toast[];
  searchOpen: boolean;
  online: boolean;
  toast: (message: string, tone?: Toast['tone']) => void;
  dismissToast: (id: string) => void;
  setSearchOpen: (open: boolean) => void;
  setOnline: (online: boolean) => void;
}

export const useUiStore = create<UiState>((set) => ({
  toasts: [],
  searchOpen: false,
  online: typeof navigator === 'undefined' ? true : navigator.onLine,

  toast: (message, tone = 'default') => {
    const id = `t_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    set((state) => ({ toasts: [...state.toasts, { id, message, tone }] }));
    window.setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, 3200);
  },

  dismissToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
  setSearchOpen: (open) => set({ searchOpen: open }),
  setOnline: (online) => set({ online }),
}));
