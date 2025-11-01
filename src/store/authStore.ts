import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { User } from "@/types";

interface AuthState {
  tripId: string | null;
  token: string | null;
  user: User | null;
  newDigitalId: string | null;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
  setNewDigitalId: (id: string | null) => void;
  setUser: (user: User) => void;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      tripId: null,
      token: null,
      user: null,
      newDigitalId: null,

      setAuth: (token, user) => {
        const currentTrip = user.trips?.find(
          (trip) => trip.status === "ACTIVE" || trip.status === "PAUSED" || trip.status === 'CHECK_IN' || trip.status === 'SNOOZED'
        );

        set({
          token,
          user,
          tripId: currentTrip ? currentTrip.id : null,
        });
      },

      logout: () =>
        set({ token: null, user: null, newDigitalId: null, tripId: null }),
      setNewDigitalId: (id) => set({ newDigitalId: id }),
      setUser: (user) => set((state) => ({ ...state, user })),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useAuthStore;