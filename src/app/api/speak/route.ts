import { NextRequest, NextResponse } from "next/server";
import { sarvam, TTS_SPEAKERS, type LanguageCode } from "@/lib/sarvam";

export async function POST(req: NextRequest) {
  let body: { text?: string; language?: string; gender?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { text, language = "kn-IN", gender = "female" } = body;

  if (!text || typeof text !== "string" || text.trim() === "") {
    return NextResponse.json({ error: "Missing text" }, { status: 400 });
  }

  const langCode = language as LanguageCode;
  const speakers = TTS_SPEAKERS[langCode] ?? TTS_SPEAKERS["kn-IN"];
  const speaker = gender === "male" ? speakers.male : speakers.female;

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = await (sarvam.textToSpeech.convert as any)({
      text,
      target_language_code: langCode,
      speaker,
      model: "bulbul:v3",
      pace: 1.0,
      speech_sample_rate: 22050,
      enable_preprocessing: true,
    });

    // SDK returns { audios: string[] } where each string is base64 encoded audio
    const audios =
      typeof response === "object" && response !== null && "audios" in response
        ? (response as { audios: string[] }).audios
        : [];

    const audio = audios[0] ?? "";

    return NextResponse.json({ audio, sampleRate: 22050, language, speaker });
  } catch (err) {
    console.error("[/api/speak]", err);
    const message = err instanceof Error ? err.message : "TTS failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
