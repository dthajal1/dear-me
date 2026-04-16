"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

import { BackHeader } from "@/components/dear-me/back-header";
import { ConfirmDialog } from "@/components/dear-me/confirm-dialog";
import { MemoStack } from "@/components/dear-me/memo-stack";
import { ScreenBackground } from "@/components/dear-me/screen-background";
import {
  deleteMemo,
  getMemo,
  updateMoodsAndTags,
  updateNote,
  updateTitle,
} from "@/lib/db/memos";
import type { Memo } from "@/lib/db/schema";

export default function PlaybackPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [memo, setMemo] = useState<Memo | null | undefined>(undefined);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const m = await getMemo(id);
      if (cancelled) return;
      if (!m || m.status !== "final") {
        setMemo(null);
        return;
      }
      setMemo(m);
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (memo === undefined) {
    return (
      <div className="flex min-h-dvh items-center justify-center text-sm text-[color:var(--color-muted-foreground)]">
        Loading…
      </div>
    );
  }
  if (memo === null) {
    return (
      <div className="relative flex min-h-dvh flex-col">
        <ScreenBackground />
        <BackHeader title="Playing" backHref="/memo" />
        <div className="relative flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center">
          <p className="text-base font-semibold text-foreground">
            Memo not found
          </p>
          <p className="text-sm text-[color:var(--color-muted-foreground)]">
            It may have been deleted.
          </p>
          <button
            type="button"
            onClick={() => router.push("/memo")}
            className="mt-2 rounded-full bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-[color:var(--color-primary-foreground)]"
          >
            Back to memos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-dvh flex-col">
      <ScreenBackground />
      <BackHeader title="Playing" />

      <div className="relative flex flex-1 flex-col gap-6 px-5 pb-8 pt-0">
        <MemoStack
          memo={memo}
          mode="final"
          autoPlayVideo
          onTitleSave={(next) => {
            setMemo({ ...memo, title: next });
            void updateTitle(memo.id, next).catch((err) => {
              console.error("[dear-me] updateTitle failed", err);
            });
          }}
          onNoteSave={(next) => {
            setMemo({ ...memo, notes: next });
            void updateNote(memo.id, next).catch((err) => {
              console.error("[dear-me] updateNote failed", err);
            });
          }}
          onMoodsChange={(next) => {
            setMemo({
              ...memo,
              moods: next.moods,
              tags: next.tags,
              moodSources: next.moodSources,
            });
            void updateMoodsAndTags(memo.id, next).catch((err) => {
              console.error("[dear-me] updateMoodsAndTags failed", err);
            });
          }}
        />

        <div className="mt-2 flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            aria-label="Delete memo"
            className="flex items-center gap-1.5 text-[length:var(--text-small)] text-[color:var(--color-muted-foreground)] transition-opacity active:opacity-60"
          >
            <Trash2 className="size-3.5" />
            Delete
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete this memo?"
        description="This memo and its recording will be removed from your device. This can't be undone."
        confirmLabel="Delete"
        destructive
        onConfirm={async () => {
          try {
            await deleteMemo(memo.id);
            router.replace("/memo");
          } catch (err) {
            console.error("[dear-me] deleteMemo failed", err);
          }
        }}
      />
    </div>
  );
}
