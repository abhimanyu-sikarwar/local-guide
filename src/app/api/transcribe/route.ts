import { NextRequest, NextResponse } from "next/server";
import { sarvam } from "@/lib/sarvam";

export async function POST(req: NextRequest) {
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const audioFile = formData.get("audio");
  const language = (formData.get("language") as string) || "hi-IN";

  if (!audioFile || !(audioFile instanceof File)) {
    return NextResponse.json({ error: "Missing audio file" }, { status: 400 });
  }

  if (audioFile.size === 0) {
    return NextResponse.json({ error: "Audio file is empty" }, { status: 400 });
  }

  try {
    // Normalize MIME type — strip codec params Sarvam doesn't accept (e.g. audio/webm;codecs=opus → audio/webm)
    const safeMime = audioFile.type.split(";")[0] || "audio/wav";
    const normalizedFile = new File([audioFile], audioFile.name || "audio.wav", { type: safeMime });

    const response = await sarvam.speechToText.transcribe({
      file: normalizedFile,
      model: "saaras:v3",
      mode: "transcribe",
      // @ts-expect-error — SDK typings may not include language_code
      language_code: language,
    });

    const transcript =
      typeof response === "object" && response !== null && "transcript" in response
        ? (response as { transcript: string }).transcript
        : String(response);

    return NextResponse.json({ transcript, language });
  } catch (err) {
    console.error("[/api/transcribe]", err);
    const message = err instanceof Error ? err.message : "Transcription failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
