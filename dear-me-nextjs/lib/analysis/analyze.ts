export type AnalyzeResult =
  | { ok: true; moods: string[]; tags: string[] }
  | { ok: false; error: string };

export async function analyzeTranscript(
  transcript: string,
): Promise<AnalyzeResult> {
  let res: Response;
  try {
    res = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transcript }),
    });
  } catch (err) {
    return { ok: false, error: (err as Error).message || "Network error" };
  }

  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    return { ok: false, error: data.error ?? `HTTP ${res.status}` };
  }

  const data = (await res.json()) as { moods?: string[]; tags?: string[] };
  return {
    ok: true,
    moods: Array.isArray(data.moods) ? data.moods : [],
    tags: Array.isArray(data.tags) ? data.tags : [],
  };
}
