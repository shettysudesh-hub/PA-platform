import { create } from 'zustand';

export interface ToastItem {
  id: string;
  title: string;
  appearance: 'info' | 'success' | 'alert' | 'warning';
  message?: string;
}

interface ToastState {
  toasts: ToastItem[];
  add: (toast: Omit<ToastItem, 'id'>) => void;
  remove: (id: string) => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  add: (toast) => {
    const id = crypto.randomUUID();
    set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }));
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, 5000);
  },
  remove: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));

// Imperative API for use outside React components
export const toast = {
  add: (t: Omit<ToastItem, 'id'>) => useToastStore.getState().add(t),
};
