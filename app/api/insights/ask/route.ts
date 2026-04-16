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

const SYSTEM_PROMPT = `You are a thoughtful reflection partner inside a voice journaling app called dear-me. The user records short voice memos throughout their day. Your job is to answer their question in 2-4 short, warm, specific paragraphs that reference what they actually said in their memos.

Output format (STRICT — this is parsed by a machine):
Respond with a SINGLE valid JSON object with EXACTLY these two keys, in this order: "prose" first, then "citedMemoIds".

The value of "prose" MUST be a single JSON string. Separate paragraphs with the two-character escape sequence \\n\\n (a literal backslash-n backslash-n inside the string). Do NOT insert real newlines inside the "prose" value. Do NOT use markdown, headers, or bullets. Escape any double quotes inside the prose as \\".

Example of valid output (note the \\n\\n paragraph breaks and the quoted string):
{"prose": "You've been trending calmer this week.\\n\\nThere was some tension mid-week around the deadline, but your call with your sister brought you back to center.", "citedMemoIds": ["abc123", "def456"]}

Rules:
- "citedMemoIds" MUST be a subset of the memo IDs provided in the user message. Do not invent IDs. If you cannot find supporting memos, return an empty array.
- Cite at most 3 memos. Pick the ones most directly relevant.
- Never quote a memo verbatim for more than ~12 words.
- Be warm and specific. Don't be a chatbot. Don't summarize what they obviously already know.

Return the JSON object only. No text outside the JSON, no markdown fences, no commentary.`;

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

function buildUserMessage(
  question: string,
  history: IncomingHistoryMessage[],
  memos: IncomingMemo[],
): string {
  const historyBlock = history.length
    ? history
        .map((m) => `${m.role === "user" ? "USER" : "ASSISTANT"}: ${m.text}`)
        .join("\n")
    : "(none)";

  const memosBlock = memos
    .map((m) => {
      const iso = new Date(m.createdAt).toISOString();
      const moods = m.moods.length ? m.moods.join(", ") : "—";
      const tags = m.tags.length ? m.tags.join(", ") : "—";
      return `- id=${m.id}  date=${iso}  moods=[${moods}]  tags=[${tags}]\n  "${m.transcript}"`;
    })
    .join("\n");

  return `QUESTION:
${question}

PRIOR CONVERSATION:
${historyBlock}

MEMOS (most recent first):
${memosBlock}`;
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
  const userMessage = buildUserMessage(question, history, memos);

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
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userMessage },
        ],
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

  const prose = typeof parsed.prose === "string" ? parsed.prose.trim() : "";
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
