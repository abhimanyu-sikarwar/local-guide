"use client";

import { useTranslator } from "@/hooks/useTranslator";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useRef } from "react";

// Status label map
const STATUS_LABELS: Record<string, string> = {
  idle: "Hold to speak",
  recording: "Recording...",
  transcribing: "Transcribing...",
  translating: "Translating...",
  speaking: "Playing...",
  error: "Error",
};

// Language display map
const LANG_LABELS: Record<string, { name: string; flag: string }> = {
  "hi-IN": { name: "Hindi", flag: "🇮🇳" },
  "kn-IN": { name: "Kannada", flag: "🏳️" },
};

export default function Home() {
  const {
    status,
    transcript,
    translation,
    audioSrc,
    sourceLanguage,
    targetLanguage,
    error,
    toggleLanguage,
    handleRecord,
    handleRelease,
    reset,
  } = useTranslator();

  const audioRef = useRef<HTMLAudioElement>(null);

  // Auto-play translated audio
  useEffect(() => {
    if (audioSrc && audioRef.current) {
      audioRef.current.src = audioSrc;
      audioRef.current.play().catch(() => {});
    }
  }, [audioSrc]);

  const isActive = status !== "idle" && status !== "error";
  const src = LANG_LABELS[sourceLanguage];
  const tgt = LANG_LABELS[targetLanguage];

  return (
    <main className="min-h-screen bg-background flex flex-col items-center px-4 py-8 max-w-md mx-auto">
      {/* Header */}
      <div className="w-full text-center mb-8">
        <h1 className="text-2xl font-bold tracking-tight">BhashaSethu</h1>
        <p className="text-sm text-muted-foreground">भाषा सेतु · Language Bridge</p>
      </div>

      {/* Language Toggle */}
      <div className="flex items-center gap-3 mb-10">
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 border border-orange-200 text-orange-700 font-medium text-sm">
          <span>{src.flag}</span>
          <span>{src.name}</span>
        </div>
        <button
          onClick={toggleLanguage}
          disabled={isActive}
          className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-lg shadow-sm hover:opacity-90 disabled:opacity-40 transition-opacity"
          aria-label="Swap languages"
        >
          ⇄
        </button>
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 border border-red-200 text-red-700 font-medium text-sm">
          <span>{tgt.flag}</span>
          <span>{tgt.name}</span>
        </div>
      </div>

      {/* Record Button */}
      <div className="flex flex-col items-center gap-4 mb-10">
        {/* Waveform animation */}
        <div className={`flex items-center gap-[3px] h-8 ${status === "recording" ? "opacity-100" : "opacity-0"} transition-opacity`}>
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className="w-1 bg-primary rounded-full animate-bounce"
              style={{
                height: `${Math.floor(Math.random() * 20 + 10)}px`,
                animationDelay: `${i * 0.1}s`,
                animationDuration: "0.6s",
              }}
            />
          ))}
        </div>

        <button
          onPointerDown={handleRecord}
          onPointerUp={handleRelease}
          onPointerLeave={handleRelease}
          disabled={isActive && status !== "recording"}
          className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl shadow-lg transition-all select-none touch-none
            ${status === "recording"
              ? "bg-red-500 scale-110 shadow-red-200 shadow-xl"
              : isActive
              ? "bg-muted text-muted-foreground cursor-not-allowed"
              : "bg-primary text-primary-foreground hover:scale-105 active:scale-95"
            }`}
          aria-label="Hold to speak"
        >
          🎙️
        </button>

        <p className={`text-sm font-medium transition-colors ${status === "error" ? "text-destructive" : "text-muted-foreground"}`}>
          {STATUS_LABELS[status]}
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="w-full mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={reset} className="ml-2 underline text-xs">Retry</button>
        </div>
      )}

      {/* Transcript & Translation Cards */}
      <div className="w-full flex flex-col gap-3">
        {(transcript || status === "transcribing") && (
          <Card className="border-orange-100">
            <CardContent className="pt-4 pb-4">
              <p className="text-xs text-muted-foreground mb-1">You said ({src.name})</p>
              {transcript ? (
                <p className="text-base font-medium">{transcript}</p>
              ) : (
                <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
              )}
            </CardContent>
          </Card>
        )}

        {(translation || status === "translating" || status === "speaking") && (
          <Card className="border-red-100">
            <CardContent className="pt-4 pb-4">
              <p className="text-xs text-muted-foreground mb-1">Translation ({tgt.name})</p>
              {translation ? (
                <p className="text-base font-medium">{translation}</p>
              ) : (
                <div className="h-4 bg-muted rounded animate-pulse w-2/3" />
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Hidden audio player */}
      <audio ref={audioRef} className="hidden" />
    </main>
  );
}
