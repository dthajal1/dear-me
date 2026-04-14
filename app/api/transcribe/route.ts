import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

const GROQ_URL = "https://api.groq.com/openai/v1/audio/transcriptions";
const MODEL = "whisper-large-v3-turbo";
const MAX_BYTES = 25 * 1024 * 1024;

export async function POST(request: Request): Promise<Response> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GROQ_API_KEY is not set on the server" },
      { status: 500 },
    );
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "Expected multipart/form-data" },
      { status: 400 },
    );
  }

  const file = form.get("file");
  if (!(file instanceof Blob)) {
    return NextResponse.json(
      { error: "Missing 'file' field" },
      { status: 400 },
    );
  }
  if (file.size === 0) {
    return NextResponse.json({ error: "File is empty" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: `File too large (${file.size} > ${MAX_BYTES} bytes)` },
      { status: 413 },
    );
  }

  const upstream = new FormData();
  const filename =
    file instanceof File && file.name ? file.name : "memo.webm";
  upstream.append("file", file, filename);
  upstream.append("model", MODEL);
  upstream.append("response_format", "json");
  upstream.append("temperature", "0");

  let groqRes: Response;
  try {
    groqRes = await fetch(GROQ_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}` },
      body: upstream,
    });
  } catch (err) {
    console.error("[dear-me] groq fetch failed", err);
    return NextResponse.json(
      { error: "Transcription service unreachable" },
      { status: 502 },
    );
  }

  if (!groqRes.ok) {
    const bodyText = await groqRes.text().catch(() => "");
    console.error("[dear-me] groq error", groqRes.status, bodyText);
    return NextResponse.json(
      { error: `Transcription failed (${groqRes.status})` },
      { status: 502 },
    );
  }

  const data = (await groqRes.json()) as { text?: string };
  const text = (data.text ?? "").trim();
  return NextResponse.json({ text });
}
