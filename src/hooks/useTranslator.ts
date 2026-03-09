"use client";

import { useState, useCallback, useRef } from "react";
import { useAudioRecorder } from "./useAudioRecorder";

export type TranslatorStatus =
  | "idle"
  | "recording"
  | "transcribing"
  | "translating"
  | "speaking"
  | "error";

export interface TranslatorState {
  status: TranslatorStatus;
  transcript: string;
  translation: string;
  audioSrc: string | null;
  sourceLanguage: string;
  targetLanguage: string;
  error: string | null;
  toggleLanguage: () => void;
  handleRecord: () => Promise<void>;
  handleRelease: () => Promise<void>;
  reset: () => void;
}

export function useTranslator(): TranslatorState {
  const [status, setStatus] = useState<TranslatorStatus>("idle");
  const [transcript, setTranscript] = useState("");
  const [translation, setTranslation] = useState("");
  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  const [sourceLanguage, setSourceLanguage] = useState("hi-IN");
  const [targetLanguage, setTargetLanguage] = useState("kn-IN");
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef(false);

  const recorder = useAudioRecorder();

  const toggleLanguage = useCallback(() => {
    setSourceLanguage((s) => (s === "hi-IN" ? "kn-IN" : "hi-IN"));
    setTargetLanguage((t) => (t === "kn-IN" ? "hi-IN" : "kn-IN"));
    setTranscript("");
    setTranslation("");
    setAudioSrc(null);
    setError(null);
  }, []);

  const handleRecord = useCallback(async () => {
    abortRef.current = false;
    setError(null);
    setTranscript("");
    setTranslation("");
    setAudioSrc(null);
    setStatus("recording");
    await recorder.startRecording();
    if (recorder.error) {
      setError(recorder.error);
      setStatus("error");
    }
  }, [recorder]);

  const handleRelease = useCallback(async () => {
    if (status !== "recording") return;

    const audioBlob = await recorder.stopRecording();
    if (!audioBlob || abortRef.current) {
      setStatus("idle");
      return;
    }

    // Step 1: Transcribe
    setStatus("transcribing");
    let transcriptText = "";
    try {
      const formData = new FormData();
      formData.append("audio", audioBlob, "audio.wav");
      formData.append("language", sourceLanguage);
      const res = await fetch("/api/transcribe", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Transcription failed");
      transcriptText = data.transcript ?? "";
      setTranscript(transcriptText);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Transcription failed");
      setStatus("error");
      return;
    }

    if (!transcriptText.trim() || abortRef.current) {
      setStatus("idle");
      return;
    }

    // Step 2: Translate
    setStatus("translating");
    let translatedText = "";
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: transcriptText, from: sourceLanguage, to: targetLanguage }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Translation failed");
      translatedText = data.translatedText ?? "";
      setTranslation(translatedText);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Translation failed");
      setStatus("error");
      return;
    }

    if (!translatedText.trim() || abortRef.current) {
      setStatus("idle");
      return;
    }

    // Step 3: TTS
    setStatus("speaking");
    try {
      const res = await fetch("/api/speak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: translatedText, language: targetLanguage }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "TTS failed");
      if (data.audio) {
        setAudioSrc(`data:audio/wav;base64,${data.audio}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Audio generation failed");
      setStatus("error");
      return;
    }

    setStatus("idle");
  }, [status, recorder, sourceLanguage, targetLanguage]);

  const reset = useCallback(() => {
    abortRef.current = true;
    recorder.cancelRecording();
    setStatus("idle");
    setTranscript("");
    setTranslation("");
    setAudioSrc(null);
    setError(null);
  }, [recorder]);

  return {
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
  };
}
