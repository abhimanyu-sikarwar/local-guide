"use client";

import { useState, useRef, useCallback } from "react";

export interface AudioPlayerResult {
  isPlaying: boolean;
  play: (base64Audio: string) => Promise<void>;
  stop: () => void;
}

export function useAudioPlayer(): AudioPlayerResult {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  const play = useCallback(async (base64Audio: string) => {
    stop();
    const audio = new Audio(`data:audio/wav;base64,${base64Audio}`);
    audioRef.current = audio;
    audio.onended = () => setIsPlaying(false);
    audio.onerror = () => setIsPlaying(false);
    setIsPlaying(true);
    try {
      await audio.play();
    } catch {
      setIsPlaying(false);
    }
  }, [stop]);

  return { isPlaying, play, stop };
}
