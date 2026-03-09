import { NextRequest, NextResponse } from "next/server";
import { sarvam } from "@/lib/sarvam";

const VALID_CODES = new Set(["bn-IN","en-IN","gu-IN","hi-IN","kn-IN","ml-IN","mr-IN","od-IN","pa-IN","ta-IN","te-IN"]);
function validCode(code: unknown, fallback: string): string {
  return typeof code === "string" && VALID_CODES.has(code) ? code : fallback;
}

export async function POST(req: NextRequest) {
  let body: { text?: string; from?: string; to?: string; mode?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const text = body.text;
  const from = validCode(body.from, "hi-IN");
  const to   = validCode(body.to,   "kn-IN");
  const mode = body.mode ?? "modern-colloquial";

  if (!text || typeof text !== "string" || text.trim() === "") {
    return NextResponse.json({ translatedText: "" });
  }

  // Same language — return as-is, no API call needed
  if (from === to) {
    return NextResponse.json({ translatedText: text });
  }

  try {
    const response = await sarvam.text.translate({
      input: text,
      source_language_code: from as "hi-IN" | "kn-IN",
      target_language_code: to as "hi-IN" | "kn-IN",
      model: "mayura:v1",
      // @ts-expect-error — SDK typings may not expose mode
      mode,
      speaker_gender: "Male",
      enable_preprocessing: true,
    });

    const translatedText =
      typeof response === "object" && response !== null && "translated_text" in response
        ? (response as { translated_text: string }).translated_text
        : String(response);

    return NextResponse.json({ translatedText });
  } catch (err) {
    console.error("[/api/translate]", err);
    const message = err instanceof Error ? err.message : "Translation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
