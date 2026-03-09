import { NextRequest, NextResponse } from "next/server";
import { sarvam } from "@/lib/sarvam";

export async function POST(req: NextRequest) {
  let body: { text?: string; from?: string; to?: string; mode?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { text, from = "hi-IN", to = "kn-IN", mode = "modern-colloquial" } = body;

  if (!text || typeof text !== "string" || text.trim() === "") {
    return NextResponse.json({ translatedText: "" });
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
