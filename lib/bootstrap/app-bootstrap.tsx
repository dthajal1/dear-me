"use client";

import { useEffect } from "react";
import { cleanupOrphanedDrafts } from "@/lib/db/memos";
import { isOpfsSupported } from "@/lib/db/opfs";

export function AppBootstrap() {
  useEffect(() => {
    if (!isOpfsSupported()) return;
    void cleanupOrphanedDrafts().catch((err) => {
      console.error("[dear-me] cleanupOrphanedDrafts failed", err);
    });
  }, []);
  return null;
}
