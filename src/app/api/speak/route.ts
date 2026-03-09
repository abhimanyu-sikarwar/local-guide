import { NextRequest, NextResponse } from "next/server";
import { sarvam, DEFAULT_SPEAKER } from "@/lib/sarvam";
import { phraseAudioFilename } from "@/data/phrasebook";
import { createHash } from "crypto";
import { readFile, writeFile } from "fs/promises";
import { join } from "path";

const AUDIO_DIR = join(process.cwd(), "data", "audio");

// Phrase audio: data/audio/{phraseId}-{language}-{speaker}.txt  (via phraseAudioFilename)
// Generic audio: data/audio/{sha256}.txt
function cacheFilename(text: string, language: string, speaker: string, phraseId?: string): string {
  if (phraseId) return phraseAudioFilename(phraseId, language, speaker);
  const hash = createHash("sha256").update(`${text}::${language}::${speaker}`).digest("hex");
  return `${hash}.txt`;
}

async function readAudioCache(filename: string): Promise<string | null> {
  try {
    return (await readFile(join(AUDIO_DIR, filename), "utf-8")).trim();
  } catch {
    return null;
  }
}

async function writeAudioCache(filename: string, audio: string) {
  try {
    await writeFile(join(AUDIO_DIR, filename), audio, "utf-8");
  } catch (err) {
    console.warn("[/api/speak] cache write failed:", err);
  }
}

/** GET /api/speak?phraseId=X&language=Y&speaker=Z
 *  Returns cached audio if it exists, 404 otherwise. Never calls Sarvam. */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const phraseId = searchParams.get("phraseId");
  const language = searchParams.get("language") ?? "kn-IN";
  const speaker  = searchParams.get("speaker")  ?? DEFAULT_SPEAKER;

  if (!phraseId) {
    return NextResponse.json({ error: "Missing phraseId" }, { status: 400 });
  }

  const filename = phraseAudioFilename(phraseId, language, speaker);
  const cached   = await readAudioCache(filename);
  if (cached) {
    return NextResponse.json({ audio: cached, sampleRate: 22050, cached: true });
  }
  return NextResponse.json({ audio: null }, { status: 404 });
}

export async function POST(req: NextRequest) {
  let body: { text?: string; language?: string; speaker?: string; phraseId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { text, language = "kn-IN", speaker = DEFAULT_SPEAKER, phraseId } = body;

  if (!text || typeof text !== "string" || text.trim() === "") {
    return NextResponse.json({ error: "Missing text" }, { status: 400 });
  }

  const filename = cacheFilename(text, language, speaker, phraseId);
  const cached = await readAudioCache(filename);
  if (cached) {
    return NextResponse.json({ audio: cached, sampleRate: 22050, cached: true });
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

    const audio = audios[0] ?? "";
    if (audio) await writeAudioCache(filename, audio);

    return NextResponse.json({ audio, sampleRate: 22050 });
  } catch (err) {
    console.error("[/api/speak]", err);
    const message = err instanceof Error ? err.message : "TTS failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
