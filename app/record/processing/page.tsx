"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Leaf } from "lucide-react";
import { createDraft } from "@/lib/db/memos";
import { writeBlob, isOpfsSupported } from "@/lib/db/opfs";
import { extensionForMimeType } from "@/lib/recording/mime";
import { getRecording, clearRecording } from "@/lib/recording/session";

type State =
  | { kind: "writing" }
  | { kind: "error"; message: string };

export default function RecordProcessingPage() {
  const router = useRouter();
  const [state, setState] = useState<State>({ kind: "writing" });
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    const recording = getRecording();
    if (!recording) {
      router.replace("/record/camera");
      return;
    }
    if (!isOpfsSupported()) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setState({
        kind: "error",
        message: "Your browser doesn't support local video storage.",
      });
      return;
    }

    const id = crypto.randomUUID();
    const ext = extensionForMimeType(recording.mimeType);
    const filename = `memo-${id}.${ext}`;
    const now = Date.now();

    (async () => {
      try {
        await writeBlob(filename, recording.blob);
        await createDraft({
          id,
          filename,
          mimeType: recording.mimeType,
          durationMs: recording.durationMs,
          sizeBytes: recording.blob.size,
          title: "",
          notes: "",
          tags: [],
          status: "draft",
          createdAt: now,
          updatedAt: now,
        });
        clearRecording();
        router.replace(`/record/add-notes?id=${id}`);
      } catch (err) {
        const e = err as DOMException;
        const isQuota =
          e.name === "QuotaExceededError" ||
          /quota/i.test(e.message ?? "");
        setState({
          kind: "error",
          message: isQuota
            ? "Your device is out of space. Free up some room and try again."
            : "Couldn't save your memo. Please try again.",
        });
      }
    })();
  }, [router]);

  function handleRetry() {
    setState({ kind: "writing" });
    router.refresh();
  }

  function handleDiscard() {
    clearRecording();
    router.replace("/home");
  }

  if (state.kind === "error") {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-6 px-8 text-center">
        <h1 className="text-xl font-semibold text-foreground">
          Couldn&apos;t save your memo
        </h1>
        <p className="max-w-[280px] text-sm text-[color:var(--color-muted-foreground)]">
          {state.message}
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleRetry}
            className="rounded-full bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-[color:var(--color-primary-foreground)] shadow-[var(--shadow-floating)]"
          >
            Try again
          </button>
          <button
            type="button"
            onClick={handleDiscard}
            className="rounded-full border border-[color:var(--color-glass-border)] bg-[var(--color-glass-surface)] px-5 py-2.5 text-sm font-semibold text-foreground backdrop-blur"
          >
            Discard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-8 px-8 text-center">
      <div className="relative size-40 flex-none">
        <div
          className="absolute inset-0 animate-pulse rounded-full"
          style={{
            background:
              "radial-gradient(circle, #8A9A5B 0%, transparent 100%)",
            opacity: 0.3,
            filter: "blur(10px)",
          }}
          aria-hidden
        />
        <div
          className="absolute inset-[10px] animate-pulse rounded-full [animation-delay:200ms]"
          style={{
            background:
              "radial-gradient(circle at 45% 40%, #A8B878 0%, #8A9A5B22 100%)",
            opacity: 0.5,
            filter: "blur(6px)",
          }}
          aria-hidden
        />
        <div
          className="absolute inset-[30px] animate-pulse rounded-full [animation-delay:400ms]"
          style={{
            background:
              "radial-gradient(circle at 45% 40%, #C8D8A8 10%, #8A9A5B 100%)",
            opacity: 0.7,
            filter: "blur(2px)",
          }}
          aria-hidden
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <Leaf size={28} strokeWidth={1.5} className="text-[#EFF2E6DD]" aria-hidden />
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <h1
          className="text-2xl font-bold text-[#2C331EDD]"
          style={{ fontFamily: "var(--font-geist-sans, Geist, sans-serif)" }}
        >
          Sitting with your words...
        </h1>
        <p
          className="text-[15px] text-[#5C6B3A99]"
          style={{ fontFamily: "var(--font-geist-sans, Geist, sans-serif)" }}
        >
          listening carefully
        </p>
      </div>

      <div
        className="relative h-[3px] w-[120px] overflow-hidden rounded-full"
        style={{ background: "rgba(138,154,91,0.133)" }}
        role="progressbar"
        aria-label="Processing your memo"
        aria-busy="true"
      >
        <div
          className="h-full w-12 animate-pulse rounded-full"
          style={{
            background: "linear-gradient(90deg, #5C6B3A 0%, #8A9A5B 100%)",
          }}
        />
      </div>
    </div>
  );
}
