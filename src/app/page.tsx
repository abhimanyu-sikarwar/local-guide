"use client";
import Link from "next/link";
import { useTranslatorStore } from "@/store/translatorStore";

export default function Home() {
  const { history } = useTranslatorStore();
  const LANG_NAMES: Record<string, string> = {
    "hi-IN": "Hindi",
    "kn-IN": "Kannada",
  };

  return (
    <main className="min-h-screen bg-white pb-24 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-14 pb-4">
        <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-lg">
          🧑
        </div>
        <h1 className="text-base font-bold tracking-tight">BhashaSethu</h1>
        <button className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
          <svg
            width="18"
            height="18"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        </button>
      </div>

      <div className="px-5 flex flex-col gap-4">
        {/* Hero card */}
        <Link
          href="/translate"
          className="block rounded-2xl bg-[#1C1C1E] p-5 overflow-hidden relative"
        >
          <p className="text-xs text-gray-400 mb-1">BhashaSethu</p>
          <h2 className="text-xl font-black text-white leading-tight mb-4">
            Speak &<br />
            Translate
          </h2>
          <span className="inline-flex items-center gap-1.5 bg-white text-[#1C1C1E] text-xs font-bold px-4 py-2 rounded-full">
            Start <span>&rarr;</span>
          </span>
          <div className="absolute right-4 top-4 text-5xl opacity-30">🌐</div>
        </Link>

        {/* Feature cards */}
        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/phrasebook"
            className="rounded-2xl bg-[#E8F5F0] p-4 flex flex-col gap-2"
          >
            <span className="text-2xl">📖</span>
            <p className="text-sm font-bold text-[#1C1C1E] leading-tight">
              Phrase
              <br />
              Book
            </p>
            <p className="text-xs text-gray-500">31 phrases</p>
          </Link>
          <Link
            href="/translate?mode=text"
            className="rounded-2xl bg-[#E8EEF5] p-4 flex flex-col gap-2"
          >
            <span className="text-2xl">⚡</span>
            <p className="text-sm font-bold text-[#1C1C1E] leading-tight">
              Quick
              <br />
              Cards
            </p>
            <p className="text-xs text-gray-500">One-tap phrases</p>
          </Link>
        </div>

        {/* Recent */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-bold text-[#1C1C1E]">
              Recent Translations
            </p>
            <Link
              href="/history"
              className="text-xs text-[#00BFA5] font-medium"
            >
              See All
            </Link>
          </div>
          {history.length === 0 ? (
            <div className="text-center py-8 text-gray-300">
              <p className="text-3xl mb-2">🗣️</p>
              <p className="text-sm">No translations yet</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {history.slice(0, 4).map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center gap-3 py-3 border-b border-gray-50"
                >
                  <div className="flex items-center gap-1">
                    <span className="text-xl">
                      {entry.sourceLang === "hi-IN" ? "🇮🇳" : "🏳️"}
                    </span>
                    <span className="text-xl">
                      {entry.targetLang === "kn-IN" ? "🏳️" : "🇮🇳"}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {LANG_NAMES[entry.sourceLang]} to{" "}
                      {LANG_NAMES[entry.targetLang]}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {entry.sourceText}
                    </p>
                  </div>
                  <span className="text-gray-300 text-xs">&rsaquo;</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
