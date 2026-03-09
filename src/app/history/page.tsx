"use client";

import { useTranslatorStore } from "@/store/translatorStore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function formatTime(ts: number) {
  return new Intl.DateTimeFormat("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }).format(new Date(ts));
}

const LANG_NAMES: Record<string, string> = { "hi-IN": "Hindi", "kn-IN": "Kannada" };

export default function HistoryPage() {
  const { history, removeFromHistory, clearHistory } = useTranslatorStore();

  const handleReplay = async (entry: typeof history[0]) => {
    if (!entry.translatedText) return;
    const res = await fetch("/api/speak", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: entry.translatedText, language: entry.targetLang }),
    });
    const data = await res.json();
    if (data.audio) {
      new Audio(`data:audio/wav;base64,${data.audio}`).play();
    }
  };

  return (
    <main className="min-h-screen bg-background px-4 py-6 max-w-md mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">History</h1>
          <p className="text-sm text-muted-foreground">{history.length} translations</p>
        </div>
        {history.length > 0 && (
          <Button variant="ghost" size="sm" onClick={clearHistory} className="text-destructive hover:text-destructive">
            Clear all
          </Button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-4xl mb-3">🗣️</p>
          <p className="font-medium">No translations yet</p>
          <p className="text-sm text-muted-foreground mt-1">Your translations will appear here</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {history.map((entry) => (
            <Card key={entry.id} className="relative">
              <CardContent className="pt-3 pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground mb-1">
                      {LANG_NAMES[entry.sourceLang]} → {LANG_NAMES[entry.targetLang]} · {formatTime(entry.timestamp)}
                    </p>
                    <p className="text-sm font-medium">{entry.sourceText}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">{entry.translatedText}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button
                      onClick={() => handleReplay(entry)}
                      className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm hover:bg-muted/80"
                      aria-label="Replay"
                    >
                      🔊
                    </button>
                    <button
                      onClick={() => removeFromHistory(entry.id)}
                      className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm hover:bg-destructive/10 hover:text-destructive"
                      aria-label="Delete"
                    >
                      ×
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
