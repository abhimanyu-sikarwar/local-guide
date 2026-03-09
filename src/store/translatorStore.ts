import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface TranslationEntry {
  id: string;
  sourceText: string;
  translatedText: string;
  sourceLang: string;
  targetLang: string;
  audioBase64?: string;
  timestamp: number;
}

interface TranslatorStore {
  sourceLanguage: string;
  targetLanguage: string;
  speakerGender: "male" | "female";
  history: TranslationEntry[];
  toggleLanguage: () => void;
  setSpeakerGender: (gender: "male" | "female") => void;
  addToHistory: (entry: Omit<TranslationEntry, "id" | "timestamp">) => void;
  clearHistory: () => void;
  removeFromHistory: (id: string) => void;
}

export const useTranslatorStore = create<TranslatorStore>()(
  persist(
    (set) => ({
      sourceLanguage: "hi-IN",
      targetLanguage: "kn-IN",
      speakerGender: "female",
      history: [],

      toggleLanguage: () =>
        set((s) => ({
          sourceLanguage: s.targetLanguage,
          targetLanguage: s.sourceLanguage,
        })),

      setSpeakerGender: (gender) => set({ speakerGender: gender }),

      addToHistory: (entry) =>
        set((s) => ({
          history: [
            { ...entry, id: crypto.randomUUID(), timestamp: Date.now() },
            ...s.history,
          ].slice(0, 50),
        })),

      clearHistory: () => set({ history: [] }),

      removeFromHistory: (id) =>
        set((s) => ({ history: s.history.filter((e) => e.id !== id) })),
    }),
    {
      name: "translator-store",
    }
  )
);
