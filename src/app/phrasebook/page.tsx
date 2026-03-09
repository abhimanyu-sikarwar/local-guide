"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { PHRASES, CATEGORY_META, type PhraseCategory, type Phrase } from "@/data/phrasebook";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useTranslatorStore } from "@/store/translatorStore";
import { getLangMeta } from "@/lib/sarvam";
import { phraseAudioFilename } from "@/data/phrasebook";
import { Header, SearchIcon } from "@/components/Header";

function getBuiltinText(phrase: Phrase, langCode: string): string | null {
  return phrase.translations[langCode as keyof typeof phrase.translations] ?? null;
}

async function translatePhrase(phraseId: string, text: string, from: string, to: string): Promise<string> {
  const res = await fetch("/api/phrase-translate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phraseId, text, from, to }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Translation failed");
  return data.translatedText ?? text;
}

function PhraseCard({
  phrase,
  sourceLanguage,
  targetLanguage,
  speaker,
}: {
  phrase: Phrase;
  sourceLanguage: string;
  targetLanguage: string;
  speaker: string;
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [copied, setCopied] = useState(false);
  const [translatedTarget, setTranslatedTarget] = useState<string | null>(null);

  const sourceText = getBuiltinText(phrase, sourceLanguage) ?? phrase.translations["hi-IN"] ?? phrase.english;
  const builtinTarget = getBuiltinText(phrase, targetLanguage);
  const cachedTarget = builtinTarget ?? translatedTarget;

  const getTargetText = async (): Promise<string> => {
    if (builtinTarget) return builtinTarget;
    if (translatedTarget) return translatedTarget;
    const from = sourceLanguage === "hi-IN" ? "hi-IN" : "kn-IN";
    const translated = await translatePhrase(phrase.id, sourceText, from, targetLanguage);
    setTranslatedTarget(translated);
    return translated;
  };

  const handleSpeak = async () => {
    if (isPlaying) return;
    setIsPlaying(true);
    try {
      // Check local server cache first (no Sarvam call)
      const filename = phraseAudioFilename(phrase.id, targetLanguage, speaker);
      const cacheRes = await fetch(
        `/api/speak?phraseId=${phrase.id}&language=${targetLanguage}&speaker=${speaker}`
      );

      let audioB64: string | null = null;

      if (cacheRes.ok) {
        const cached = await cacheRes.json();
        audioB64 = cached.audio ?? null;
      }

      if (!audioB64) {
        // Cache miss — generate via Sarvam and save to data/audio/{filename}
        const textToSpeak = await getTargetText();
        const res = await fetch("/api/speak", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: textToSpeak, language: targetLanguage, speaker, phraseId: phrase.id }),
        });
        const data = await res.json();
        audioB64 = data.audio ?? null;
      }

      if (audioB64) {
        const audio = new Audio(`data:audio/wav;base64,${audioB64}`);
        audio.onended = () => setIsPlaying(false);
        audio.play();
      } else {
        setIsPlaying(false);
      }
    } catch {
      setIsPlaying(false);
    }
  };

  const handleLongPress = async () => {
    const text = await getTargetText();
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <Card
      className="cursor-pointer active:scale-[0.98] transition-transform"
      onClick={handleSpeak}
      onContextMenu={(e) => { e.preventDefault(); handleLongPress(); }}
    >
      <CardContent className="pt-4 pb-4 flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{sourceText}</p>
          <p className="text-muted-foreground text-sm truncate">
            {cachedTarget ?? <span className="italic text-muted-foreground/50">Tap to translate</span>}
          </p>
          <p className="text-xs text-muted-foreground/70 truncate">{phrase.english}</p>
        </div>
        <button
          className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-lg transition-colors ${
            isPlaying ? "bg-primary/10 text-primary" : "bg-muted hover:bg-muted/80"
          }`}
          aria-label="Speak"
        >
          {copied ? "✓" : isPlaying ? "🔊" : "▶"}
        </button>
      </CardContent>
    </Card>
  );
}

function PhrasebookContent() {
  const { sourceLanguage, targetLanguage, speaker } = useTranslatorStore();
  const tgtMeta = getLangMeta(targetLanguage);
  const categories = Object.keys(CATEGORY_META) as PhraseCategory[];
  const searchParams = useSearchParams();
  const router = useRouter();

  const activeCategory = (searchParams.get("cat") as PhraseCategory) || "cab";
  const [searchOpen, setSearchOpen] = useState(searchParams.get("search") === "1");
  const [query, setQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  const setCategory = useCallback((cat: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("cat", cat);
    params.delete("search");
    router.replace(`/phrasebook?${params.toString()}`, { scroll: false });
    setSearchOpen(false);
    setQuery("");
  }, [router, searchParams]);

  const q = query.trim().toLowerCase();
  const searchResults = q
    ? PHRASES.filter((p) => {
        const src = (p.translations[sourceLanguage as keyof typeof p.translations] ?? "").toLowerCase();
        const tgt = (p.translations[targetLanguage as keyof typeof p.translations] ?? "").toLowerCase();
        return src.includes(q) || tgt.includes(q) || p.english.toLowerCase().includes(q);
      })
    : [];

  return (
    <main className="min-h-screen bg-background max-w-md mx-auto">
      <Header
        title="Phrasebook"
        subtitle={`Tap any phrase to hear it in ${tgtMeta.name}`}
        left={false}
        right={
          <button
            onClick={() => { setSearchOpen((v) => !v); setQuery(""); }}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
              searchOpen ? "bg-[#00BFA5] text-white" : "bg-gray-100 text-[#1C1C1E]"
            }`}
            aria-label="Search"
          >
            <SearchIcon />
          </button>
        }
      />

      <div className="px-4 pb-6">
        {/* Search bar */}
        {searchOpen && (
          <div className="mb-4">
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5">
              <SearchIcon className="text-gray-400 shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search phrases..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
              />
              {query && (
                <button onClick={() => setQuery("")} className="text-gray-400 hover:text-gray-600 text-lg leading-none">
                  ×
                </button>
              )}
            </div>

            {q && (
              <div className="mt-3 flex flex-col gap-2">
                {searchResults.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">No phrases found</p>
                ) : (
                  searchResults.map((phrase) => (
                    <PhraseCard
                      key={phrase.id}
                      phrase={phrase}
                      sourceLanguage={sourceLanguage}
                      targetLanguage={targetLanguage}
                      speaker={speaker}
                    />
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* Category tabs (hidden while searching with a query) */}
        {(!searchOpen || !q) && (
          <Tabs value={activeCategory} onValueChange={setCategory}>
            <TabsList className="w-full flex overflow-x-auto mb-4 h-auto flex-wrap gap-1 bg-transparent p-0">
              {categories.map((cat) => {
                const meta = CATEGORY_META[cat];
                return (
                  <TabsTrigger
                    key={cat}
                    value={cat}
                    className={`flex items-center gap-1 text-xs px-3 py-2 rounded-full border data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border-primary ${
                      cat === "emergency" ? "border-red-300 data-[state=active]:bg-red-500" : "border-border"
                    }`}
                  >
                    <span>{meta.emoji}</span>
                    <span>{meta.label}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {categories.map((cat) => {
              const phrases = PHRASES.filter((p) => p.category === cat);
              return (
                <TabsContent key={cat} value={cat} className="flex flex-col gap-2 mt-0">
                  {phrases.map((phrase) => (
                    <PhraseCard
                      key={phrase.id}
                      phrase={phrase}
                      sourceLanguage={sourceLanguage}
                      targetLanguage={targetLanguage}
                      speaker={speaker}
                    />
                  ))}
                </TabsContent>
              );
            })}
          </Tabs>
        )}
      </div>
    </main>
  );
}

export default function PhrasebookPage() {
  return (
    <Suspense>
      <PhrasebookContent />
    </Suspense>
  );
}
