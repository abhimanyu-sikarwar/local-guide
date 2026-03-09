"use client";

import { useTranslatorStore } from "@/store/translatorStore";
import { SUPPORTED_LANGUAGES, TTS_VOICES, type VoiceId } from "@/lib/sarvam";

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">{children}</p>;
}

export default function SettingsPage() {
  const { sourceLanguage, targetLanguage, speaker, setSourceLanguage, setTargetLanguage, setSpeaker } =
    useTranslatorStore();

  const maleVoices = TTS_VOICES.filter((v) => v.gender === "male");
  const femaleVoices = TTS_VOICES.filter((v) => v.gender === "female");

  return (
    <main className="min-h-screen bg-white pb-28 max-w-md mx-auto">
      {/* Header */}
      <div className="px-5 pt-14 pb-6">
        <h1 className="text-2xl font-black text-[#1C1C1E]">Settings</h1>
        <p className="text-sm text-gray-400 mt-0.5">Language & voice preferences</p>
      </div>

      <div className="px-5 flex flex-col gap-8">

        {/* Language pair */}
        <section>
          <SectionTitle>Language</SectionTitle>
          <div className="flex flex-col gap-3">

            {/* Source language */}
            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
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
                          ? "bg-[#1C1C1E] text-white shadow-sm"
                          : "bg-white border border-gray-100 text-[#1C1C1E] hover:border-gray-200"
                      }`}
                    >
                      <span className="text-base">{lang.flag}</span>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold truncate">{lang.name}</p>
                        <p className={`text-[10px] truncate ${active ? "text-gray-300" : "text-gray-400"}`}>
                          {lang.native}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Target language */}
            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
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
                          : "bg-white border border-gray-100 text-[#1C1C1E] hover:border-gray-200"
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
          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 flex flex-col gap-5">

            {/* Female */}
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
                          : "bg-white border border-gray-200 text-[#1C1C1E] hover:border-gray-300"
                      }`}
                    >
                      {v.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Male */}
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
                          ? "bg-[#1C1C1E] text-white shadow-sm"
                          : "bg-white border border-gray-200 text-[#1C1C1E] hover:border-gray-300"
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
          <div className="rounded-2xl border border-gray-100 p-4 flex flex-col gap-1">
            <p className="text-sm font-semibold text-[#1C1C1E]">BhashaSethu v1.0</p>
            <p className="text-xs text-gray-400">भाषा सेतु — Language Bridge</p>
            <p className="text-xs text-gray-300 mt-2">
              Powered by Sarvam AI · saaras:v3 · mayura:v1 · bulbul:v3
            </p>
          </div>
        </section>

      </div>
    </main>
  );
}
