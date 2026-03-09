import { NextRequest, NextResponse } from "next/server";
import { sarvam } from "@/lib/sarvam";
import { readFile, writeFile } from "fs/promises";
import { join } from "path";

const TRANSLATIONS_FILE = join(process.cwd(), "data", "translations.json");

async function readCache(): Promise<Record<string, string>> {
  try {
    const raw = await readFile(TRANSLATIONS_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

async function writeCache(cache: Record<string, string>) {
  try {
    await writeFile(TRANSLATIONS_FILE, JSON.stringify(cache, null, 2), "utf-8");
  } catch (err) {
    console.warn("[/api/phrase-translate] cache write failed:", err);
  }
}

export async function POST(req: NextRequest) {
  let body: { phraseId?: string; text?: string; from?: string; to?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { phraseId, text, from = "hi-IN", to } = body;

  if (!text || !to || !phraseId) {
    return NextResponse.json({ error: "Missing phraseId, text, or to" }, { status: 400 });
  }

  const cacheKey = `${phraseId}::${to}`;
  const cache = await readCache();

  if (cache[cacheKey]) {
    return NextResponse.json({ translatedText: cache[cacheKey], cached: true });
  }

  try {
    const response = await sarvam.text.translate({
      input: text,
      source_language_code: from as "hi-IN" | "kn-IN",
      target_language_code: to as "hi-IN" | "kn-IN",
      model: "mayura:v1",
      // @ts-expect-error — SDK typings may not expose mode
      mode: "modern-colloquial",
      speaker_gender: "Male",
      enable_preprocessing: true,
    });

    const translatedText =
      typeof response === "object" && response !== null && "translated_text" in response
        ? (response as { translated_text: string }).translated_text
        : String(response);

    cache[cacheKey] = translatedText;
    await writeCache(cache);

    return NextResponse.json({ translatedText });
  } catch (err) {
    console.error("[/api/phrase-translate]", err);
    const message = err instanceof Error ? err.message : "Translation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
