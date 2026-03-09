"use client";

import { useState, useRef, useCallback } from "react";

export type RecorderState = "idle" | "recording" | "processing" | "error";

export interface AudioRecorderResult {
  state: RecorderState;
  isRecording: boolean;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<Blob | null>;
  cancelRecording: () => void;
  error: string | null;
}

/**
 * Converts a MediaRecorder audio blob to 16kHz WAV for Sarvam STT compatibility.
 * Falls back to original blob if AudioContext is unavailable.
 */
async function toWav16k(blob: Blob): Promise<Blob> {
  if (typeof window === "undefined" || !window.AudioContext) return blob;

  const arrayBuffer = await blob.arrayBuffer();
  const audioCtx = new AudioContext();
  const decoded = await audioCtx.decodeAudioData(arrayBuffer);

  // Resample to 16000 Hz mono
  const targetSampleRate = 16000;
  const offlineCtx = new OfflineAudioContext(
    1,
    Math.ceil(decoded.duration * targetSampleRate),
    targetSampleRate
  );
  const source = offlineCtx.createBufferSource();
  source.buffer = decoded;
  source.connect(offlineCtx.destination);
  source.start();

  const rendered = await offlineCtx.startRendering();
  audioCtx.close();

  return audioBufferToWavBlob(rendered);
}

function audioBufferToWavBlob(buffer: AudioBuffer): Blob {
  const numChannels = 1;
  const sampleRate = buffer.sampleRate;
  const samples = buffer.getChannelData(0);
  const dataLength = samples.length * 2; // 16-bit
  const wavBuffer = new ArrayBuffer(44 + dataLength);
  const view = new DataView(wavBuffer);

  // WAV header
  const writeStr = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  };
  writeStr(0, "RIFF");
  view.setUint32(4, 36 + dataLength, true);
  writeStr(8, "WAVE");
  writeStr(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * 2, true);
  view.setUint16(32, numChannels * 2, true);
  view.setUint16(34, 16, true);
  writeStr(36, "data");
  view.setUint32(40, dataLength, true);

  // PCM samples (clamped to int16)
  let offset = 44;
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    offset += 2;
  }

  return new Blob([wavBuffer], { type: "audio/wav" });
}

export function useAudioRecorder(): AudioRecorderResult {
  const [state, setState] = useState<RecorderState>("idle");
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const startRecording = useCallback(async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
          ? "audio/webm;codecs=opus"
          : "audio/webm",
      });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.start(100); // collect data every 100ms
      setState("recording");
    } catch (err) {
      const message =
        err instanceof DOMException && err.name === "NotAllowedError"
          ? "Microphone permission denied. Please allow access and try again."
          : "Could not access microphone. Please check your device settings.";
      setError(message);
      setState("error");
    }
  }, []);

  const stopRecording = useCallback(async (): Promise<Blob | null> => {
    return new Promise((resolve) => {
      const recorder = mediaRecorderRef.current;
      if (!recorder || recorder.state === "inactive") {
        resolve(null);
        return;
      }

      setState("processing");

      recorder.onstop = async () => {
        // Strip codec params — Sarvam rejects "audio/webm;codecs=opus" but accepts "audio/webm"
        const baseMime = recorder.mimeType.split(";")[0] || "audio/webm";
        const rawBlob = new Blob(chunksRef.current, { type: baseMime });
        streamRef.current?.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        mediaRecorderRef.current = null;

        try {
          const wavBlob = await toWav16k(rawBlob);
          setState("idle");
          resolve(wavBlob);
        } catch {
          setState("idle");
          resolve(rawBlob); // fallback — baseMime already has codec stripped
        }
      };

      recorder.stop();
    });
  }, []);

  const cancelRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      recorder.ondataavailable = null;
      recorder.onstop = null;
      recorder.stop();
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    mediaRecorderRef.current = null;
    chunksRef.current = [];
    setState("idle");
    setError(null);
  }, []);

  return {
    state,
    isRecording: state === "recording",
    startRecording,
    stopRecording,
    cancelRecording,
    error,
  };
}
