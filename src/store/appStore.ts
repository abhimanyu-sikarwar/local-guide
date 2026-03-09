import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Theme = "light" | "dark" | "system";

export interface UserProfile {
  name: string;
  avatar: string; // emoji
  city: string;
  phone: string;
}

interface AppStore {
  theme: Theme;
  profile: UserProfile;
  setTheme: (theme: Theme) => void;
  setProfile: (patch: Partial<UserProfile>) => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      theme: "system",
      profile: { name: "", avatar: "🧑", city: "", phone: "" },

      setTheme: (theme) => set({ theme }),
      setProfile: (patch) =>
        set((s) => ({ profile: { ...s.profile, ...patch } })),
    }),
    { name: "app-store" }
  )
);
