"use client";

import { useState } from "react";
import { PHRASES, CATEGORY_META, type PhraseCategory, type Phrase } from "@/data/phrasebook";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

function PhraseCard({ phrase, targetLanguage }: { phrase: Phrase; targetLanguage: string }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSpeak = async () => {
    if (isPlaying) return;
    setIsPlaying(true);
    try {
      const res = await fetch("/api/speak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: targetLanguage === "kn-IN" ? phrase.kannada : phrase.hindi, language: targetLanguage }),
      });
      const data = await res.json();
      if (data.audio) {
        const audio = new Audio(`data:audio/wav;base64,${data.audio}`);
        audio.onended = () => setIsPlaying(false);
        audio.play();
      } else {
        setIsPlaying(false);
      }
    } catch {
      setIsPlaying(false);
    }
  };

  const handleLongPress = () => {
    navigator.clipboard.writeText(phrase.kannada).then(() => {
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
          <p className="font-medium text-sm truncate">{phrase.hindi}</p>
          <p className="text-muted-foreground text-sm truncate">{phrase.kannada}</p>
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

export default function PhrasebookPage() {
  const [targetLanguage] = useState("kn-IN");
  const categories = Object.keys(CATEGORY_META) as PhraseCategory[];

  return (
    <main className="min-h-screen bg-background px-4 py-6 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-1">Phrasebook</h1>
      <p className="text-sm text-muted-foreground mb-6">Tap any phrase to hear it in Kannada</p>

      <Tabs defaultValue="cab">
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
                <PhraseCard key={phrase.id} phrase={phrase} targetLanguage={targetLanguage} />
              ))}
            </TabsContent>
          );
        })}
      </Tabs>
    </main>
  );
}
