"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getMemo, updateDraft, finalizeDraft } from "@/lib/db/memos";
import type { Memo } from "@/lib/db/schema";

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
