import { NextRequest, NextResponse } from "next/server";
import { sarvam, DEFAULT_SPEAKER } from "@/lib/sarvam";

export async function POST(req: NextRequest) {
  let body: { text?: string; language?: string; speaker?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { text, language = "kn-IN", speaker = DEFAULT_SPEAKER } = body;

  if (!text || typeof text !== "string" || text.trim() === "") {
    return NextResponse.json({ error: "Missing text" }, { status: 400 });
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = await (sarvam.textToSpeech.convert as any)({
      text,
      target_language_code: language,
      speaker,
      model: "bulbul:v3",
      pace: 1.0,
      speech_sample_rate: 22050,
      enable_preprocessing: true,
    });

    const audios =
      typeof response === "object" && response !== null && "audios" in response
        ? (response as { audios: string[] }).audios
        : [];

    return NextResponse.json({ audio: audios[0] ?? "", sampleRate: 22050 });
  } catch (err) {
    console.error("[/api/speak]", err);
    const message = err instanceof Error ? err.message : "TTS failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
