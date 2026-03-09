import { SarvamAIClient } from "sarvamai";

if (!process.env.SARVAM_API_KEY) {
  console.warn("SARVAM_API_KEY is not set. API calls will fail.");
}

export const sarvam = new SarvamAIClient({
  apiSubscriptionKey: process.env.SARVAM_API_KEY ?? "",
});

export const LANGUAGES = {
  HI: "hi-IN",
  KN: "kn-IN",
} as const;

export type LanguageCode = (typeof LANGUAGES)[keyof typeof LANGUAGES];

export const TTS_SPEAKERS: Record<LanguageCode, { male: string; female: string }> = {
  "hi-IN": { male: "shubh", female: "priya" },
  "kn-IN": { male: "vijay", female: "kavya" },
};
