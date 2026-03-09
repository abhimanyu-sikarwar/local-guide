"use client";

import { useState } from "react";
import { PHRASES, QUICK_PHRASES } from "@/data/phrasebook";

export function QuickCards() {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const quickPhrases = QUICK_PHRASES.map((id) => PHRASES.find((p) => p.id === id)!).filter(Boolean);

  const handleTap = async (phrase: typeof quickPhrases[0]) => {
    if (playingId === phrase.id) return;
    setPlayingId(phrase.id);
    try {
      const res = await fetch("/api/speak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: phrase.kannada, language: "kn-IN" }),
      });
      const data = await res.json();
      if (data.audio) {
        const audio = new Audio(`data:audio/wav;base64,${data.audio}`);
        audio.onended = () => setPlayingId(null);
        audio.play();
      } else {
        setPlayingId(null);
      }
    } catch {
      setPlayingId(null);
    }
  };

  return (
    <div className="w-full">
      <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Quick Phrases</p>
      <div className="grid grid-cols-2 gap-2">
        {quickPhrases.map((phrase) => (
          <button
            key={phrase.id}
            onClick={() => handleTap(phrase)}
            className={`p-3 rounded-xl border text-left transition-all active:scale-95 ${
              playingId === phrase.id
                ? "border-primary bg-primary/5"
                : "border-border bg-card hover:bg-muted/50"
            }`}
          >
            <p className="text-xs font-medium leading-snug">{phrase.hindi}</p>
            <p className="text-xs text-muted-foreground leading-snug mt-0.5">{phrase.kannada}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
