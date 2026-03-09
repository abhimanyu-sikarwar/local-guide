import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_SPEAKER, type VoiceId } from "@/lib/sarvam";

export interface TranslationEntry {
  id: string;
  sourceText: string;
  translatedText: string;
  sourceLang: string;
  targetLang: string;
  timestamp: number;
}

interface TranslatorStore {
  sourceLanguage: string;
  targetLanguage: string;
  speaker: VoiceId;
  history: TranslationEntry[];
  setSourceLanguage: (lang: string) => void;
  setTargetLanguage: (lang: string) => void;
  toggleLanguage: () => void;
  setSpeaker: (speaker: VoiceId) => void;
  addToHistory: (entry: Omit<TranslationEntry, "id" | "timestamp">) => void;
  clearHistory: () => void;
  removeFromHistory: (id: string) => void;
}

export const useTranslatorStore = create<TranslatorStore>()(
  persist(
    (set) => ({
      sourceLanguage: "hi-IN",
      targetLanguage: "kn-IN",
      speaker: DEFAULT_SPEAKER,
      history: [],

      setSourceLanguage: (lang) => set({ sourceLanguage: lang }),
      setTargetLanguage: (lang) => set({ targetLanguage: lang }),

      toggleLanguage: () =>
        set((s) => ({
          sourceLanguage: s.targetLanguage,
          targetLanguage: s.sourceLanguage,
        })),

      setSpeaker: (speaker) => set({ speaker }),

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
    { name: "translator-store" }
  )
);
