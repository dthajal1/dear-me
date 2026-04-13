"use client";

import { useCallback, useEffect, useState } from "react";
import { listMemos } from "@/lib/db/memos";
import type { Memo, MemoStatus } from "@/lib/db/schema";

export function useMemoList(filter?: { status?: MemoStatus }): Memo[] | null {
  const [memos, setMemos] = useState<Memo[] | null>(null);
  const status = filter?.status;

  const fetchMemos = useCallback(async () => {
    const list = await listMemos(status ? { status } : undefined);
    setMemos(list);
  }, [status]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchMemos();
  }, [fetchMemos]);

  useEffect(() => {
    if (typeof BroadcastChannel === "undefined") return;
    const bc = new BroadcastChannel("dear-me-memos");
    const handler = (e: MessageEvent) => {
      if (e.data?.type === "memo-finalized" || e.data?.type === "memo-deleted") {
        void fetchMemos();
      }
    };
    bc.addEventListener("message", handler);
    return () => {
      bc.removeEventListener("message", handler);
      bc.close();
    };
  }, [fetchMemos]);

  return memos;
}
