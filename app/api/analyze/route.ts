import { NextResponse } from "next/server";
import { MOODS, isMood } from "@/lib/analysis/moods";

export const runtime = "nodejs";
export const maxDuration = 30;

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile";

const SYSTEM_PROMPT = `You analyze short voice journal transcripts and extract structured emotional metadata.

You MUST respond with valid JSON matching this exact shape:
{"moods": string[], "tags": string[]}

Rules:
- "moods": 1 to 3 items, chosen ONLY from this fixed list: ${MOODS.join(", ")}. Pick the ones that best describe the speaker's emotional tone. Do not invent new moods.
- "tags": 1 to 5 short topic tags describing what the memo is about (e.g. "work", "sleep", "family", "deadline"). Lowercase, 1-2 words each. No emotions — those go in moods.
- If the transcript is empty, silent, or unintelligible, return {"moods": [], "tags": []}.
- Return JSON only. No prose, no markdown fences.`;

type AnalyzeResult = { moods: string[]; tags: string[] };

export async function POST(request: Request): Promise<Response> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GROQ_API_KEY is not set on the server" },
      { status: 500 },
    );
  }

  let body: { transcript?: unknown };
  try {
    body = (await request.json()) as { transcript?: unknown };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const transcript =
    typeof body.transcript === "string" ? body.transcript.trim() : "";
  if (!transcript) {
    return NextResponse.json({ moods: [], tags: [] } satisfies AnalyzeResult);
  }

  let groqRes: Response;
  try {
    groqRes = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: transcript },
        ],
      }),
    });
  } catch (err) {
    console.error("[dear-me] groq analyze fetch failed", err);
    return NextResponse.json(
      { error: "Analysis service unreachable" },
      { status: 502 },
    );
  }

  if (!groqRes.ok) {
    const text = await groqRes.text().catch(() => "");
    console.error("[dear-me] groq analyze error", groqRes.status, text);
    return NextResponse.json(
      { error: `Analysis failed (${groqRes.status})` },
      { status: 502 },
    );
  }

  const data = (await groqRes.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = data.choices?.[0]?.message?.content ?? "";

  let parsed: { moods?: unknown; tags?: unknown };
  try {
    parsed = JSON.parse(content);
  } catch {
    console.error("[dear-me] groq analyze returned non-JSON", content);
    return NextResponse.json(
      { error: "Model returned invalid JSON" },
      { status: 502 },
    );
  }

  const rawMoods = Array.isArray(parsed.moods) ? parsed.moods : [];
  const rawTags = Array.isArray(parsed.tags) ? parsed.tags : [];

  const moods = Array.from(
    new Set(
      rawMoods
        .filter((m): m is string => typeof m === "string")
        .map((m) => m.toLowerCase().trim())
        .filter(isMood),
    ),
  ).slice(0, 3);

  const tags = Array.from(
    new Set(
      rawTags
        .filter((t): t is string => typeof t === "string")
        .map((t) => t.toLowerCase().trim())
        .filter((t) => t.length > 0 && t.length <= 24),
    ),
  ).slice(0, 5);

  return NextResponse.json({ moods, tags } satisfies AnalyzeResult);
}
