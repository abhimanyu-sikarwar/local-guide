import { SarvamAIClient } from "sarvamai";

if (!process.env.SARVAM_API_KEY) {
  console.warn("SARVAM_API_KEY is not set. API calls will fail.");
}

export const sarvam = new SarvamAIClient({
  apiSubscriptionKey: process.env.SARVAM_API_KEY ?? "",
});

// All languages supported by Sarvam mayura:v1 + saaras:v3
export const SUPPORTED_LANGUAGES = [
  { code: "hi-IN", name: "Hindi",     flag: "🇮🇳", native: "हिन्दी" },
  { code: "kn-IN", name: "Kannada",   flag: "🇮🇳", native: "ಕನ್ನಡ" },
  { code: "ta-IN", name: "Tamil",     flag: "🇮🇳", native: "தமிழ்" },
  { code: "te-IN", name: "Telugu",    flag: "🇮🇳", native: "తెలుగు" },
  { code: "ml-IN", name: "Malayalam", flag: "🇮🇳", native: "മലയാളം" },
  { code: "mr-IN", name: "Marathi",   flag: "🇮🇳", native: "मराठी" },
  { code: "bn-IN", name: "Bengali",   flag: "🇮🇳", native: "বাংলা" },
  { code: "gu-IN", name: "Gujarati",  flag: "🇮🇳", native: "ગુજરાતી" },
  { code: "pa-IN", name: "Punjabi",   flag: "🇮🇳", native: "ਪੰਜਾਬੀ" },
  { code: "or-IN", name: "Odia",      flag: "🇮🇳", native: "ଓଡ଼ିଆ" },
  { code: "en-IN", name: "English",   flag: "🇬🇧", native: "English" },
] as const;

export type LanguageCode = (typeof SUPPORTED_LANGUAGES)[number]["code"];

export function getLangMeta(code: string) {
  return SUPPORTED_LANGUAGES.find((l) => l.code === code) ?? SUPPORTED_LANGUAGES[0];
}

// All valid bulbul:v3 speakers with gender tags
export const TTS_VOICES = [
  { id: "shubh",    gender: "male",   label: "Shubh" },
  { id: "aditya",   gender: "male",   label: "Aditya" },
  { id: "rahul",    gender: "male",   label: "Rahul" },
  { id: "rohan",    gender: "male",   label: "Rohan" },
  { id: "amit",     gender: "male",   label: "Amit" },
  { id: "dev",      gender: "male",   label: "Dev" },
  { id: "ratan",    gender: "male",   label: "Ratan" },
  { id: "varun",    gender: "male",   label: "Varun" },
  { id: "manan",    gender: "male",   label: "Manan" },
  { id: "sumit",    gender: "male",   label: "Sumit" },
  { id: "kabir",    gender: "male",   label: "Kabir" },
  { id: "aayan",    gender: "male",   label: "Aayan" },
  { id: "ashutosh", gender: "male",   label: "Ashutosh" },
  { id: "advait",   gender: "male",   label: "Advait" },
  { id: "anand",    gender: "male",   label: "Anand" },
  { id: "tarun",    gender: "male",   label: "Tarun" },
  { id: "sunny",    gender: "male",   label: "Sunny" },
  { id: "mani",     gender: "male",   label: "Mani" },
  { id: "gokul",    gender: "male",   label: "Gokul" },
  { id: "vijay",    gender: "male",   label: "Vijay" },
  { id: "mohit",    gender: "male",   label: "Mohit" },
  { id: "rehan",    gender: "male",   label: "Rehan" },
  { id: "soham",    gender: "male",   label: "Soham" },
  { id: "priya",    gender: "female", label: "Priya" },
  { id: "ritu",     gender: "female", label: "Ritu" },
  { id: "neha",     gender: "female", label: "Neha" },
  { id: "pooja",    gender: "female", label: "Pooja" },
  { id: "simran",   gender: "female", label: "Simran" },
  { id: "kavya",    gender: "female", label: "Kavya" },
  { id: "ishita",   gender: "female", label: "Ishita" },
  { id: "shreya",   gender: "female", label: "Shreya" },
  { id: "roopa",    gender: "female", label: "Roopa" },
  { id: "amelia",   gender: "female", label: "Amelia" },
  { id: "sophia",   gender: "female", label: "Sophia" },
  { id: "tanya",    gender: "female", label: "Tanya" },
  { id: "shruti",   gender: "female", label: "Shruti" },
  { id: "suhani",   gender: "female", label: "Suhani" },
  { id: "kavitha",  gender: "female", label: "Kavitha" },
  { id: "rupali",   gender: "female", label: "Rupali" },
] as const;

export type VoiceId = (typeof TTS_VOICES)[number]["id"];

export const DEFAULT_SPEAKER: VoiceId = "priya";
