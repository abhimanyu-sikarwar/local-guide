"use client";
import Link from "next/link";
import { useTranslatorStore } from "@/store/translatorStore";
import { Header, SearchIcon } from "@/components/Header";
import { getLangMeta } from "@/lib/sarvam";
import { useAppStore } from "@/store/appStore";

export default function Home() {
  const { history } = useTranslatorStore();
  const { profile } = useAppStore();

  return (
    <main className="min-h-screen bg-white dark:bg-[#1C1C1E] pb-24 max-w-md mx-auto transition-colors">
      <Header
        title="BhashaSethu"
        left={
          <div
            className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-lg"
            title={profile.name || "Profile"}
          >
            {profile.avatar}
          </div>
        }
        right={
          <Link
            href="/phrasebook?search=1"
            className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-[#1C1C1E] dark:text-white"
          >
            <SearchIcon />
          </Link>
        }
      />

      <div className="px-5 flex flex-col gap-4">
        {/* Hero card */}
        <Link
          href="/translate"
          className="block rounded-2xl bg-[#1C1C1E] dark:bg-white p-5 overflow-hidden relative"
        >
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">BhashaSethu</p>
          <h2 className="text-xl font-black text-white dark:text-[#1C1C1E] leading-tight mb-4">
            Speak &<br />
            Translate
          </h2>
          <span className="inline-flex items-center gap-1.5 bg-white dark:bg-[#1C1C1E] text-[#1C1C1E] dark:text-white text-xs font-bold px-4 py-2 rounded-full">
            Start <span>&rarr;</span>
          </span>
          <div className="absolute right-4 top-4 text-5xl opacity-20">🌐</div>
        </Link>

        {/* Feature cards */}
        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/phrasebook"
            className="rounded-2xl bg-[#E8F5F0] dark:bg-[#0D2E28] p-4 flex flex-col gap-2"
          >
            <span className="text-2xl">📖</span>
            <p className="text-sm font-bold text-[#1C1C1E] dark:text-white leading-tight">
              Phrase<br />Book
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {/* count all PHRASES */}
              Tap to speak
            </p>
          </Link>
          <Link
            href="/translate?mode=text"
            className="rounded-2xl bg-[#E8EEF5] dark:bg-[#1A2333] p-4 flex flex-col gap-2"
          >
            <span className="text-2xl">⚡</span>
            <p className="text-sm font-bold text-[#1C1C1E] dark:text-white leading-tight">
              Quick<br />Cards
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">One-tap phrases</p>
          </Link>
        </div>

        {/* Recent */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-bold text-[#1C1C1E] dark:text-white">
              Recent Translations
            </p>
            <Link href="/history" className="text-xs text-[#00BFA5] font-medium">
              See All
            </Link>
          </div>

          {history.length === 0 ? (
            <div className="text-center py-8 text-gray-300 dark:text-gray-600">
              <p className="text-3xl mb-2">🗣️</p>
              <p className="text-sm">No translations yet</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {history.slice(0, 4).map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center gap-3 py-3 border-b border-gray-50 dark:border-gray-800"
                >
                  <div className="flex items-center gap-1">
                    <span className="text-xl">{getLangMeta(entry.sourceLang).flag}</span>
                    <span className="text-xl">{getLangMeta(entry.targetLang).flag}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1C1C1E] dark:text-white truncate">
                      {getLangMeta(entry.sourceLang).name} → {getLangMeta(entry.targetLang).name}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
                      {entry.sourceText}
                    </p>
                  </div>
                  <span className="text-gray-300 dark:text-gray-600 text-xs">&rsaquo;</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
