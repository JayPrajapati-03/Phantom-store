import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      login: (user, token) => set({ user, token }),
      logout: () => set({ user: null, token: null }),
      isAdmin: () => get().user?.role === "admin",
      isMerchant: () => get().user?.role === "merchant",
      isCustomer: () => get().user?.role === "customer"
    }),
    {
      name: "phantom-auth"
    }
  )
);
