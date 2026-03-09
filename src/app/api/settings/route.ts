import { NextRequest, NextResponse } from "next/server";
import { readFile, writeFile } from "fs/promises";
import { join } from "path";

const FILE = join(process.cwd(), "data", "settings.json");

async function read(): Promise<Record<string, unknown>> {
  try {
    return JSON.parse(await readFile(FILE, "utf-8"));
  } catch {
    return {};
  }
}

export async function GET() {
  const data = await read();
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const current = await read();
  const merged = { ...current, ...body, updatedAt: new Date().toISOString() };
  await writeFile(FILE, JSON.stringify(merged, null, 2), "utf-8");
  return NextResponse.json({ ok: true });
}
