"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { listMemos } from "@/lib/db/memos";
import {
  appendMessage,
  getThread,
  replaceMessage,
} from "@/lib/db/insightThreads";
import type {
  InsightMessage,
  InsightThread,
  Memo,
} from "@/lib/db/schema";

const MEMO_LIMIT = 30;

type AskStatus = "loading" | "idle" | "ready" | "error";

interface UseInsightAskResult {
  thread: InsightThread | null | undefined;
  status: AskStatus;
  error: string | null;
  /** Append a new user message + fire the ask. */
  ask: (question: string) => Promise<void>;
  /** Fire the ask for a user message that's already persisted in the thread (first-ask trigger). */
  fireAskForExisting: (question: string) => Promise<void>;
}

type ApiMemo = {
  id: string;
  createdAt: number;
  transcript: string;
  moods: string[];
  tags: string[];
};

type ApiHistoryMessage = { role: "user" | "assistant"; text: string };

type AskResponse = { prose: string; citedMemoIds: string[] };

function projectMemos(memos: Memo[]): ApiMemo[] {
  return memos
    .filter((m) => m.status === "final" && typeof m.transcript === "string" && m.transcript.trim().length > 0)
    .slice(0, MEMO_LIMIT)
    .map((m) => ({
      id: m.id,
      createdAt: m.createdAt,
      transcript: m.transcript ?? "",
      moods: m.moods ?? [],
      tags: m.tags ?? [],
    }));
}

function projectHistory(messages: InsightMessage[]): ApiHistoryMessage[] {
  // History is everything prior to the current in-flight turn. Caller is
  // responsible for passing the right slice.
  return messages
    .filter((m) => m.text.trim().length > 0 && m.status !== "streaming" && m.status !== "error")
    .map((m) => ({ role: m.role, text: m.text }));
}

export function useInsightAsk(threadId: string): UseInsightAskResult {
  const [thread, setThread] = useState<InsightThread | null | undefined>(
    undefined,
  );
  const [status, setStatus] = useState<AskStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);

  // Load thread from IDB on mount / threadId change.
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const t = await getThread(threadId);
        if (cancelled) return;
        setThread(t ?? null);
      } catch (err) {
        console.error("[insights] getThread failed", err);
        if (!cancelled) setThread(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [threadId]);

  // Cancel any in-flight request when the hook unmounts.
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const runAsk = useCallback(
    async (question: string, appendUser: boolean) => {
      setStatus("loading");
      setError(null);

      const controller = new AbortController();
      abortRef.current?.abort();
      abortRef.current = controller;

      // Resolve current thread snapshot.
      let current = await getThread(threadId);
      if (!current) {
        setError("Thread not found");
        setStatus("error");
        return;
      }

      // Step 1: append the user message (if not already persisted).
      if (appendUser) {
        const userMessage: InsightMessage = {
          id: crypto.randomUUID(),
          role: "user",
          text: question,
          createdAt: Date.now(),
        };
        current = await appendMessage(threadId, userMessage);
        setThread(current);
      }

      // Step 1b: append the placeholder assistant message.
      const placeholder: InsightMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        text: "",
        citedMemoIds: [],
        status: "streaming",
        createdAt: Date.now(),
      };
      current = await appendMessage(threadId, placeholder);
      setThread(current);

      // Step 2: gather memo context.
      let memos: ApiMemo[] = [];
      try {
        const all = await listMemos({ status: "final" });
        memos = projectMemos(all);
      } catch (err) {
        console.error("[insights] listMemos failed", err);
      }

      // Step 3: build history — everything before the placeholder and the user message we just appended.
      // `current.messages` now ends with [...prior, userMessage?, placeholder]. Drop the last 1-2.
      const sliceEnd = appendUser
        ? current.messages.length - 2
        : current.messages.length - 1;
      const history = projectHistory(current.messages.slice(0, sliceEnd));

      // Step 4: POST to /api/insights/ask.
      try {
        const res = await fetch("/api/insights/ask", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question, history, memos }),
          signal: controller.signal,
        });

        if (!res.ok) {
          const body = (await res.json().catch(() => ({}))) as {
            error?: string;
          };
          throw new Error(body.error ?? `Request failed (${res.status})`);
        }

        const data = (await res.json()) as AskResponse;
        const next = await replaceMessage(threadId, placeholder.id, {
          text: data.prose,
          citedMemoIds: data.citedMemoIds,
          status: "ok",
        });
        setThread(next);
        setStatus("ready");
      } catch (err) {
        if (controller.signal.aborted) {
          // Unmounted mid-call. Leave the placeholder as-is; if the user returns,
          // they'll see the streaming state and can choose to retry later.
          return;
        }
        console.error("[insights] ask failed", err);
        const note =
          err instanceof Error
            ? err.message
            : "Couldn't reach the reflection service.";
        try {
          const next = await replaceMessage(threadId, placeholder.id, {
            text: "",
            citedMemoIds: [],
            status: "error",
            errorNote: `${note} Try again in a moment.`,
          });
          setThread(next);
        } catch (writeErr) {
          console.error("[insights] persist error-state failed", writeErr);
        }
        setError(note);
        setStatus("error");
      }
    },
    [threadId],
  );

  const ask = useCallback(
    (question: string) => runAsk(question, true),
    [runAsk],
  );

  const fireAskForExisting = useCallback(
    (question: string) => runAsk(question, false),
    [runAsk],
  );

  return { thread, status, error, ask, fireAskForExisting };
}
