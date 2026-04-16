import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 30;

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile";
const MEMO_LIMIT = 30;
const TRANSCRIPT_CHAR_LIMIT = 600;
const HISTORY_LIMIT = 20;

type IncomingMemo = {
  id: string;
  createdAt: number;
  transcript: string;
  moods: string[];
  tags: string[];
};

type IncomingHistoryMessage = {
  role: "user" | "assistant";
  text: string;
};

type AskBody = {
  question?: unknown;
  history?: unknown;
  memos?: unknown;
};

type AskResult = { prose: string; citedMemoIds: string[] };

const SYSTEM_PROMPT = `You are a reflection partner inside a voice journaling app called dear-me. The user records short voice memos throughout their day. They are trusting you with their most honest, vulnerable thoughts — treat every message with that weight.

Your voice: concise, clear, insightful, and thoughtful. Every sentence must earn its place. No filler, no fluff, no platitudes, no "it sounds like you're feeling…" restatements. Say something the user hasn't already thought. If you don't have a genuine insight, be honest about that rather than padding with empty warmth.

Respond in 1-3 short paragraphs. Shorter is almost always better.

This is a multi-turn conversation. The user may ask follow-ups like "tell me more" or "what do you mean?" — use conversation history to understand references and continue naturally.

Off-topic questions:
If the question is unrelated to their memos or inner life, briefly acknowledge it in your own words, let them know it's outside your scope, and invite them back to their memos. Keep it short and natural. Return an empty citedMemoIds array.

Safety:
If the user expresses distress, self-harm ideation, or crisis — drop everything else. Respond with real, direct care. No clinical language, no hedging. Encourage them to reach out to someone they trust or a crisis resource (988 Suicide & Crisis Lifeline — call or text 988). Return an empty citedMemoIds array.

Output format (STRICT — parsed by a machine):
Return a SINGLE valid JSON object with exactly two keys: "prose" and "citedMemoIds".

"prose" is a JSON string. Use \\n\\n for paragraph breaks. No markdown, no headers, no bullets.

Example:
{"prose": "You've been trending calmer this week.\\n\\nThere was real tension around the deadline, but that call with your sister shifted something.", "citedMemoIds": ["abc123", "def456"]}

Rules:
- "citedMemoIds" MUST be a subset of the provided memo IDs. Never invent IDs. Empty array if none apply.
- Cite at most 3 memos — only the ones that genuinely matter.
- Never quote a memo verbatim for more than ~12 words.
- Don't summarize what the user obviously already knows. Surface what they might not see.

Return the JSON object only. Nothing else.`;

function truncateTranscript(text: string): string {
  if (text.length <= TRANSCRIPT_CHAR_LIMIT) return text;
  return text.slice(0, TRANSCRIPT_CHAR_LIMIT - 1) + "…";
}

function sanitizeMemos(raw: unknown): IncomingMemo[] {
  if (!Array.isArray(raw)) return [];
  const memos: IncomingMemo[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const m = item as Record<string, unknown>;
    if (typeof m.id !== "string") continue;
    if (typeof m.createdAt !== "number") continue;
    if (typeof m.transcript !== "string") continue;
    memos.push({
      id: m.id,
      createdAt: m.createdAt,
      transcript: truncateTranscript(m.transcript),
      moods: Array.isArray(m.moods)
        ? m.moods.filter((x): x is string => typeof x === "string")
        : [],
      tags: Array.isArray(m.tags)
        ? m.tags.filter((x): x is string => typeof x === "string")
        : [],
    });
  }
  return memos
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, MEMO_LIMIT);
}

function sanitizeHistory(raw: unknown): IncomingHistoryMessage[] {
  if (!Array.isArray(raw)) return [];
  const out: IncomingHistoryMessage[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const m = item as Record<string, unknown>;
    if (m.role !== "user" && m.role !== "assistant") continue;
    if (typeof m.text !== "string") continue;
    if (!m.text.trim()) continue;
    out.push({ role: m.role, text: m.text });
  }
  return out.slice(-HISTORY_LIMIT);
}

function buildMemosContext(memos: IncomingMemo[]): string {
  return memos
    .map((m) => {
      const iso = new Date(m.createdAt).toISOString();
      const moods = m.moods.length ? m.moods.join(", ") : "—";
      const tags = m.tags.length ? m.tags.join(", ") : "—";
      return `- id=${m.id}  date=${iso}  moods=[${moods}]  tags=[${tags}]\n  "${m.transcript}"`;
    })
    .join("\n");
}

function buildMessages(
  question: string,
  history: IncomingHistoryMessage[],
  memos: IncomingMemo[],
): { role: "system" | "user" | "assistant"; content: string }[] {
  const memosContext = `MEMOS (most recent first):\n${buildMemosContext(memos)}`;

  const messages: { role: "system" | "user" | "assistant"; content: string }[] =
    [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "system", content: memosContext },
    ];

  for (const msg of history) {
    messages.push({ role: msg.role, content: msg.text });
  }

  messages.push({ role: "user", content: question });

  return messages;
}

export async function POST(request: Request): Promise<Response> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GROQ_API_KEY is not set on the server" },
      { status: 500 },
    );
  }

  let body: AskBody;
  try {
    body = (await request.json()) as AskBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const question = typeof body.question === "string" ? body.question.trim() : "";
  if (!question) {
    return NextResponse.json({
      prose: "Ask me anything about your memos.",
      citedMemoIds: [],
    } satisfies AskResult);
  }

  const memos = sanitizeMemos(body.memos);
  const history = sanitizeHistory(body.history);

  if (memos.length === 0) {
    return NextResponse.json({
      prose:
        "I'd love to reflect with you, but I don't have any memos to draw from yet. Record one whenever you're ready — I'll be right here waiting.",
      citedMemoIds: [],
    } satisfies AskResult);
  }

  const validIds = new Set(memos.map((m) => m.id));
  const messages = buildMessages(question, history, memos);

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
        temperature: 0.3,
        response_format: { type: "json_object" },
        messages,
      }),
    });
  } catch (err) {
    console.error("[dear-me] groq insights fetch failed", err);
    return NextResponse.json(
      { error: "Reflection service unreachable" },
      { status: 502 },
    );
  }

  if (!groqRes.ok) {
    const text = await groqRes.text().catch(() => "");
    console.error("[dear-me] groq insights error", groqRes.status, text);
    return NextResponse.json(
      { error: `Reflection failed (${groqRes.status})` },
      { status: 502 },
    );
  }

  const data = (await groqRes.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = data.choices?.[0]?.message?.content ?? "";

  let parsed: { prose?: unknown; citedMemoIds?: unknown };
  try {
    parsed = JSON.parse(content);
  } catch {
    console.error("[dear-me] groq insights returned non-JSON", content);
    return NextResponse.json(
      { error: "Model returned invalid JSON" },
      { status: 502 },
    );
  }

  const rawProse = typeof parsed.prose === "string" ? parsed.prose.trim() : "";
  // Normalize paragraph breaks: some models emit literal "\\n\\n" (escaped) instead
  // of real newlines. Collapse both forms into a single \n\n.
  const prose = rawProse.replace(/\\n\\n/g, "\n\n").replace(/\n{3,}/g, "\n\n");
  if (!prose) {
    console.error("[dear-me] groq insights empty prose", content);
    return NextResponse.json(
      { error: "Model returned empty response" },
      { status: 502 },
    );
  }

  const rawCited = Array.isArray(parsed.citedMemoIds) ? parsed.citedMemoIds : [];
  const seen = new Set<string>();
  const citedMemoIds: string[] = [];
  const dropped: string[] = [];
  for (const id of rawCited) {
    if (typeof id !== "string") continue;
    if (seen.has(id)) continue;
    if (!validIds.has(id)) {
      dropped.push(id);
      continue;
    }
    seen.add(id);
    citedMemoIds.push(id);
    if (citedMemoIds.length >= 3) break;
  }
  if (dropped.length > 0) {
    console.warn("[dear-me] insights hallucinated cite ids", dropped);
  }

  return NextResponse.json({ prose, citedMemoIds } satisfies AskResult);
}
