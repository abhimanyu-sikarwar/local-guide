"use client";

import { useTranslatorStore } from "@/store/translatorStore";
import { useAppStore, type Theme } from "@/store/appStore";
import { SUPPORTED_LANGUAGES, TTS_VOICES, type VoiceId } from "@/lib/sarvam";
import { Header } from "@/components/Header";

const AVATARS = ["🧑", "👨", "👩", "🧔", "👴", "👵", "🧕", "👮", "👷", "🧑‍💻", "🧑‍🍳", "🧑‍🎓"];

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">{children}</p>;
}

function RowInput({ label, value, onChange, placeholder, type = "text" }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
      <p className="text-sm text-gray-500 dark:text-gray-400 w-24 shrink-0">{label}</p>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 text-sm text-right bg-transparent outline-none text-[#1C1C1E] dark:text-white placeholder:text-gray-300 dark:placeholder:text-gray-600"
      />
    </div>
  );
}

export default function SettingsPage() {
  const { sourceLanguage, targetLanguage, speaker, setSourceLanguage, setTargetLanguage, setSpeaker } =
    useTranslatorStore();
  const { theme, profile, setTheme, setProfile } = useAppStore();

  const maleVoices = TTS_VOICES.filter((v) => v.gender === "male");
  const femaleVoices = TTS_VOICES.filter((v) => v.gender === "female");

  const themes: { value: Theme; label: string; icon: string }[] = [
    { value: "light", label: "Light", icon: "☀️" },
    { value: "dark",  label: "Dark",  icon: "🌙" },
    { value: "system", label: "Auto", icon: "⚙️" },
  ];

  return (
    <main className="min-h-screen bg-white dark:bg-[#1C1C1E] pb-28 max-w-md mx-auto">
      <Header title="Settings" subtitle="Preferences & profile" left={false} />

      <div className="px-5 flex flex-col gap-8">

        {/* Profile */}
        <section>
          <SectionTitle>Profile</SectionTitle>
          <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-4">
            {/* Avatar picker */}
            <p className="text-xs font-medium text-gray-400 mb-3">Avatar</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {AVATARS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => setProfile({ avatar: emoji })}
                  className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all ${
                    profile.avatar === emoji
                      ? "bg-[#1C1C1E] dark:bg-white shadow-sm scale-110"
                      : "bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:border-gray-300"
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>

            {/* Fields */}
            <div className="bg-white dark:bg-gray-800 rounded-xl px-3">
              <RowInput
                label="Name"
                value={profile.name}
                onChange={(v) => setProfile({ name: v })}
                placeholder="Your name"
              />
              <RowInput
                label="City"
                value={profile.city}
                onChange={(v) => setProfile({ city: v })}
                placeholder="Your city"
              />
              <RowInput
                label="Phone"
                value={profile.phone}
                onChange={(v) => setProfile({ phone: v })}
                placeholder="+91 XXXXX XXXXX"
                type="tel"
              />
            </div>
          </div>
        </section>

        {/* Appearance */}
        <section>
          <SectionTitle>Appearance</SectionTitle>
          <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-4">
            <p className="text-xs font-medium text-gray-400 mb-3">Theme</p>
            <div className="grid grid-cols-3 gap-2">
              {themes.map((t) => {
                const active = theme === t.value;
                return (
                  <button
                    key={t.value}
                    onClick={() => setTheme(t.value)}
                    className={`flex flex-col items-center gap-1.5 py-3 rounded-xl transition-all ${
                      active
                        ? "bg-[#1C1C1E] dark:bg-white text-white dark:text-[#1C1C1E] shadow-sm"
                        : "bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-[#1C1C1E] dark:text-white hover:border-gray-300"
                    }`}
                  >
                    <span className="text-xl">{t.icon}</span>
                    <span className="text-xs font-semibold">{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Language pair */}
        <section>
          <SectionTitle>Language</SectionTitle>
          <div className="flex flex-col gap-3">

            {/* Source language */}
            <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-4">
              <p className="text-xs font-medium text-gray-400 mb-3">I speak</p>
              <div className="grid grid-cols-2 gap-2">
                {SUPPORTED_LANGUAGES.map((lang) => {
                  const active = sourceLanguage === lang.code;
                  return (
                    <button
                      key={lang.code}
                      onClick={() => {
                        if (lang.code === targetLanguage) setTargetLanguage(sourceLanguage);
                        setSourceLanguage(lang.code);
                      }}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-left transition-all ${
                        active
                          ? "bg-[#1C1C1E] dark:bg-white text-white dark:text-[#1C1C1E] shadow-sm"
                          : "bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-[#1C1C1E] dark:text-white hover:border-gray-200"
                      }`}
                    >
                      <span className="text-base">{lang.flag}</span>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold truncate">{lang.name}</p>
                        <p className={`text-[10px] truncate ${active ? "text-gray-300 dark:text-gray-600" : "text-gray-400"}`}>
                          {lang.native}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Target language */}
            <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-4">
              <p className="text-xs font-medium text-gray-400 mb-3">Translate to</p>
              <div className="grid grid-cols-2 gap-2">
                {SUPPORTED_LANGUAGES.map((lang) => {
                  const active = targetLanguage === lang.code;
                  return (
                    <button
                      key={lang.code}
                      onClick={() => {
                        if (lang.code === sourceLanguage) setSourceLanguage(targetLanguage);
                        setTargetLanguage(lang.code);
                      }}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-left transition-all ${
                        active
                          ? "bg-[#00BFA5] text-white shadow-sm"
                          : "bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-[#1C1C1E] dark:text-white hover:border-gray-200"
                      }`}
                    >
                      <span className="text-base">{lang.flag}</span>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold truncate">{lang.name}</p>
                        <p className={`text-[10px] truncate ${active ? "text-teal-100" : "text-gray-400"}`}>
                          {lang.native}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>
        </section>

        {/* Voice */}
        <section>
          <SectionTitle>Voice</SectionTitle>
          <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-4 flex flex-col gap-5">
            <div>
              <p className="text-xs font-medium text-gray-400 mb-2">Female</p>
              <div className="flex flex-wrap gap-2">
                {femaleVoices.map((v) => {
                  const active = speaker === v.id;
                  return (
                    <button
                      key={v.id}
                      onClick={() => setSpeaker(v.id as VoiceId)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        active
                          ? "bg-[#00BFA5] text-white shadow-sm"
                          : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-[#1C1C1E] dark:text-white hover:border-gray-300"
                      }`}
                    >
                      {v.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-400 mb-2">Male</p>
              <div className="flex flex-wrap gap-2">
                {maleVoices.map((v) => {
                  const active = speaker === v.id;
                  return (
                    <button
                      key={v.id}
                      onClick={() => setSpeaker(v.id as VoiceId)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        active
                          ? "bg-[#1C1C1E] dark:bg-white text-white dark:text-[#1C1C1E] shadow-sm"
                          : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-[#1C1C1E] dark:text-white hover:border-gray-300"
                      }`}
                    >
                      {v.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* About */}
        <section>
          <SectionTitle>About</SectionTitle>
          <div className="rounded-2xl border border-gray-100 dark:border-gray-800 p-4 flex flex-col gap-1">
            <p className="text-sm font-semibold text-[#1C1C1E] dark:text-white">BhashaSethu v1.0</p>
            <p className="text-xs text-gray-400">भाषा सेतु — Language Bridge</p>
            <p className="text-xs text-gray-300 dark:text-gray-600 mt-2">
              Powered by Sarvam AI · saaras:v3 · mayura:v1 · bulbul:v3
            </p>
          </div>
        </section>

      </div>
    </main>
  );
}
