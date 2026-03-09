"use client";

import { useEffect, useRef } from "react";
import { useTranslatorStore } from "@/store/translatorStore";
import { useAppStore } from "@/store/appStore";

/** Syncs all user settings to data/settings.json on the server.
 *  - On mount: loads server settings and hydrates both stores.
 *  - On any change: debounced POST to /api/settings.
 */
export function SettingsSync() {
  const { sourceLanguage, targetLanguage, speaker, setSourceLanguage, setTargetLanguage, setSpeaker } =
    useTranslatorStore();
  const { theme, profile, setTheme, setProfile } = useAppStore();

  const hydrated = useRef(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load from server on first mount
  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data.sourceLanguage) setSourceLanguage(data.sourceLanguage);
        if (data.targetLanguage) setTargetLanguage(data.targetLanguage);
        if (data.speaker)        setSpeaker(data.speaker);
        if (data.theme)          setTheme(data.theme);
        if (data.profile)        setProfile(data.profile);
        hydrated.current = true;
      })
      .catch(() => { hydrated.current = true; });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save to server whenever settings change (debounced 800ms)
  useEffect(() => {
    if (!hydrated.current) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceLanguage, targetLanguage, speaker, theme, profile }),
      }).catch(() => {});
    }, 800);
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
  }, [sourceLanguage, targetLanguage, speaker, theme, profile]);

  return null;
}
