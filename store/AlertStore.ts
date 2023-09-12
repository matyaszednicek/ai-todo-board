import { create } from 'zustand';

interface AlertState {
  isShown: boolean;
  showAlert: () => void;
  hideAlert: () => void;

  type: AlertType;
  setType: (type: AlertType) => void;
  message: string;
  setMessage: (message: string) => void;
}

export const useAlertStore = create<AlertState>()((set) => ({
  isShown: false,
  showAlert: () => set({ isShown: true }),
  hideAlert: () => set({ isShown: false }),

  type: 'danger',
  setType: (type: AlertType) => set({ type }),

  message: '',
  setMessage: (message: string) => set({ message }),
}));
