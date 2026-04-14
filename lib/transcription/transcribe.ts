export type TranscribeResult =
  | { ok: true; text: string }
  | { ok: false; error: string };

export async function transcribeBlob(
  blob: Blob,
  filename = "memo.webm",
): Promise<TranscribeResult> {
  const form = new FormData();
  form.append("file", blob, filename);

  let res: Response;
  try {
    res = await fetch("/api/transcribe", { method: "POST", body: form });
  } catch (err) {
    return { ok: false, error: (err as Error).message || "Network error" };
  }

  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    return { ok: false, error: data.error ?? `HTTP ${res.status}` };
  }
  const data = (await res.json()) as { text?: string };
  return { ok: true, text: (data.text ?? "").trim() };
}
