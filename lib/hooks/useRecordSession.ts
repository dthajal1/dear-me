"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  getMemo,
  updateDraft,
  updateMoodsAndTags,
  finalizeDraft,
} from "@/lib/db/memos";
import { findRecentChipCheckIn } from "@/lib/db/checkIns";
import type { Memo } from "@/lib/db/schema";

const RECENT_CHECK_IN_WINDOW_MS = 10 * 60 * 1000;

type State =
  | { status: "loading" }
  | { status: "ready"; memo: Memo }
  | { status: "not-found" };

export function useRecordSession() {
  const params = useSearchParams();
  const id = params.get("id");
  const [state, setState] = useState<State>({ status: "loading" });

  const refresh = useCallback(async () => {
    if (!id) {
      setState({ status: "not-found" });
      return;
    }
    const memo = await getMemo(id);
    if (!memo) {
      setState({ status: "not-found" });
    } else {
      setState({ status: "ready", memo });
    }
  }, [id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refresh();
  }, [refresh]);

  const update = useCallback(
    async (patch: Parameters<typeof updateDraft>[1]) => {
      if (!id) throw new Error("No memo id in URL");
      const updated = await updateDraft(id, patch);
      setState({ status: "ready", memo: updated });
      return updated;
    },
    [id],
  );

  const finalize = useCallback(async () => {
    if (!id) throw new Error("No memo id in URL");

    // If the user tapped a mood chip on Home recently, auto-inherit it
    // onto this memo — but don't overwrite any mood the AI analyzer
    // already assigned.
    try {
      const recent = await findRecentChipCheckIn(RECENT_CHECK_IN_WINDOW_MS);
      if (recent) {
        const current = await getMemo(id);
        if (current && current.status === "draft") {
          const existing = current.moods ?? [];
          if (!existing.includes(recent.mood)) {
            // The chip-check-in mood comes from a user tap on Home, so its
            // provenance is "user" — merge it into the existing sources map
            // (which was populated as "ai" by the analyzer) without
            // clobbering anything.
            const nextSources = {
              ...(current.moodSources ?? {}),
              [recent.mood]: "user" as const,
            };
            await updateMoodsAndTags(id, {
              moods: [...existing, recent.mood],
              moodSources: nextSources,
            });
          }
        }
      }
    } catch (err) {
      console.warn("[dear-me] auto check-in mood apply failed", err);
    }

    const finalized = await finalizeDraft(id);
    setState({ status: "ready", memo: finalized });
    if (typeof BroadcastChannel !== "undefined") {
      const bc = new BroadcastChannel("dear-me-memos");
      bc.postMessage({ type: "memo-finalized", id });
      bc.close();
    }
    return finalized;
  }, [id]);

  return { state, refresh, update, finalize, id } as const;
}
