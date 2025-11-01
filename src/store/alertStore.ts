import { create } from 'zustand';

interface AlertState {
  isCheckInVisible: boolean;
  showCheckIn: () => void;
  hideCheckIn: () => void;
}

const useAlertStore = create<AlertState>((set) => ({
  isCheckInVisible: false,
  showCheckIn: () => set({ isCheckInVisible: true }),
  hideCheckIn: () => set({ isCheckInVisible: false }),
}));

export default useAlertStore;