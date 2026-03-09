"use client";

import { useTranslator } from "@/hooks/useTranslator";
import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

// Animated waveform component with requestAnimationFrame
function Waveform({ active }: { active: boolean }) {
  const barCount = 40;
  const [heights, setHeights] = useState<number[]>(
    Array.from({ length: barCount }, () => 4)
  );
  const rafRef = useRef<number>(0);
  const activeRef = useRef(active);
  activeRef.current = active;

  const animate = useCallback(() => {
    if (!activeRef.current) {
      setHeights(Array.from({ length: barCount }, () => 4));
      return;
    }
    const now = Date.now();
    setHeights(
      Array.from({ length: barCount }, (_, i) => {
        const wave1 = Math.sin((i / barCount) * Math.PI * 3 + now / 300) * 20;
        const wave2 =
          Math.sin((i / barCount) * Math.PI * 5 + now / 200) * 8;
        return Math.max(4, wave1 + wave2 + 28);
      })
    );
    rafRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    if (active) {
      rafRef.current = requestAnimationFrame(animate);
    } else {
      setHeights(Array.from({ length: barCount }, () => 4));
    }
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [active, animate]);

  return (
    <div className="flex items-center justify-center gap-[2px] h-16 w-full">
      {heights.map((h, i) => (
        <div
          key={i}
          className={`rounded-full transition-colors duration-150 ${
            active ? "bg-[#00BFA5]" : "bg-gray-200"
          }`}
          style={{
            width: "3px",
            height: `${h}px`,
          }}
        />
      ))}
    </div>
  );
}

// Animated dots for "Listening..."
function AnimatedDots() {
  const [dots, setDots] = useState(".");
  useEffect(() => {
    const t = setInterval(
      () => setDots((d) => (d.length >= 3 ? "." : d + ".")),
      500
    );
    return () => clearInterval(t);
  }, []);
  return <span className="text-[#00BFA5]">{dots}</span>;
}

const LANG_META: Record<string, { name: string; flag: string }> = {
  "hi-IN": { name: "Hindi", flag: "🇮🇳" },
  "kn-IN": { name: "Kannada", flag: "🏳️" },
};

export default function TranslatePage() {
  const router = useRouter();
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

  useEffect(() => {
    if (audioSrc && audioRef.current) {
      audioRef.current.src = audioSrc;
      audioRef.current.play().catch(() => {});
    }
  }, [audioSrc]);

  const isListening = status === "recording";
  const isProcessing =
    status === "transcribing" ||
    status === "translating" ||
    status === "speaking";
  const src = LANG_META[sourceLanguage];
  const tgt = LANG_META[targetLanguage];

  // SCREEN 4: Listening / Processing mode
  if (isListening || isProcessing) {
    return (
      <main className="min-h-screen bg-white flex flex-col max-w-md mx-auto pb-24">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-14 pb-6">
          <button
            onClick={reset}
            className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center"
          >
            <svg
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <h2 className="text-base font-bold">
            {isListening ? (
              <>
                Listening
                <AnimatedDots />
              </>
            ) : isProcessing ? (
              "Processing..."
            ) : (
              "Translate"
            )}
          </h2>
          <button className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
            <svg
              width="16"
              height="16"
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

        {/* Language selector */}
        <div className="px-5 mb-8">
          <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-2 w-fit">
            <span className="text-xl">{src.flag}</span>
            <span className="text-sm font-medium">{src.name}</span>
            <svg
              width="14"
              height="14"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </div>
        </div>

        {/* Transcript text */}
        <div className="flex-1 px-5 flex flex-col justify-center">
          {transcript ? (
            <p className="text-2xl font-bold text-[#1C1C1E] leading-snug">
              {transcript}
            </p>
          ) : (
            <p className="text-2xl font-bold text-gray-200 leading-snug">
              {isListening ? "Say something..." : "Processing audio..."}
            </p>
          )}
          {translation && (
            <p className="text-lg text-gray-400 mt-4 leading-snug">
              {translation}
            </p>
          )}
        </div>

        {/* Waveform */}
        <div className="px-5 mb-6">
          <Waveform active={isListening} />
        </div>

        {/* Stop button */}
        <div className="flex justify-center mb-8">
          <button
            onPointerUp={handleRelease}
            className="w-16 h-16 rounded-full bg-[#1C1C1E] flex items-center justify-center shadow-xl active:scale-95 transition-transform"
            aria-label="Stop"
          >
            <div className="w-5 h-5 bg-white rounded-sm" />
          </button>
        </div>

        <audio ref={audioRef} className="hidden" />
      </main>
    );
  }

  // SCREEN 3: Text translate / idle mode
  return (
    <main className="min-h-screen bg-white flex flex-col max-w-md mx-auto pb-24">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-14 pb-6">
        <button
          onClick={() => router.push("/")}
          className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center"
        >
          <svg
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            viewBox="0 0 24 24"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <h2 className="text-base font-bold">Translate</h2>
        <button className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
          <svg
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
        </button>
      </div>

      {/* Language row */}
      <div className="flex items-center justify-center gap-3 px-5 mb-6">
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-full px-4 py-2">
          <span className="text-lg">{src.flag}</span>
          <span className="text-sm font-medium">{src.name}</span>
        </div>
        <button
          onClick={toggleLanguage}
          className="w-10 h-10 rounded-full bg-[#00BFA5] flex items-center justify-center text-white shadow-sm hover:bg-[#00A896] transition-colors"
          aria-label="Swap"
        >
          <svg
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            viewBox="0 0 24 24"
          >
            <path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
          </svg>
        </button>
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-full px-4 py-2">
          <span className="text-lg">{tgt.flag}</span>
          <span className="text-sm font-medium">{tgt.name}</span>
        </div>
      </div>

      <div className="px-5 flex flex-col gap-3">
        {/* Source box */}
        <div className="rounded-2xl bg-gray-50 p-4 min-h-[130px] flex flex-col justify-between">
          <p
            className={`text-sm flex-1 ${
              transcript ? "text-[#1C1C1E]" : "text-gray-300"
            }`}
          >
            {transcript || `Tap the mic to speak in ${src.name}...`}
          </p>
          <div className="flex items-center justify-between mt-3">
            <span className="text-xs text-gray-300">
              {transcript.length} / 5,000
            </span>
            <div className="flex gap-3">
              {transcript && (
                <button className="text-gray-400 hover:text-gray-600">
                  <svg
                    width="18"
                    height="18"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                  </svg>
                </button>
              )}
              <button
                onPointerDown={handleRecord}
                className="text-gray-400 hover:text-[#00BFA5] transition-colors"
                aria-label="Speak"
              >
                <svg
                  width="18"
                  height="18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v3M8 23h8" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Translation box */}
        <div className="rounded-2xl bg-white border border-gray-100 p-4 min-h-[130px] flex flex-col justify-between shadow-sm">
          <p
            className={`text-sm flex-1 ${
              translation ? "text-[#1C1C1E]" : "text-gray-300"
            }`}
          >
            {translation || `Translation in ${tgt.name} will appear here`}
          </p>
          <div className="flex items-center justify-between mt-3">
            <span className="text-xs text-gray-300">
              {translation.length} / 5,000
            </span>
            <div className="flex gap-3">
              {translation && (
                <>
                  <button className="text-gray-400 hover:text-gray-600">
                    <svg
                      width="18"
                      height="18"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                    </svg>
                  </button>
                  <button
                    onClick={() => navigator.clipboard.writeText(translation)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg
                      width="18"
                      height="18"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <rect x="9" y="9" width="13" height="13" rx="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-xl bg-red-50 border border-red-100 p-3 flex items-center justify-between">
            <p className="text-sm text-red-500">{error}</p>
            <button
              onClick={reset}
              className="text-xs text-red-400 underline ml-2"
            >
              Retry
            </button>
          </div>
        )}

        {/* Big mic button */}
        <div className="flex justify-center pt-4">
          <button
            onPointerDown={handleRecord}
            onPointerUp={handleRelease}
            onPointerLeave={handleRelease}
            className="w-16 h-16 rounded-full bg-[#1C1C1E] flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform"
            aria-label="Hold to speak"
          >
            <svg width="24" height="24" fill="white" viewBox="0 0 24 24">
              <path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z" />
              <path
                d="M19 10v2a7 7 0 0 1-14 0v-2"
                stroke="white"
                strokeWidth="2"
                fill="none"
              />
              <path
                d="M12 19v3M8 23h8"
                stroke="white"
                strokeWidth="2"
                fill="none"
              />
            </svg>
          </button>
        </div>
      </div>

      <audio ref={audioRef} className="hidden" />
    </main>
  );
}
