"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { X, Pause, RefreshCw } from "lucide-react";
import { RecordButton } from "@/components/dear-me/record-button";
import { GlassIconButton } from "@/components/dear-me/glass-icon-button";
import { createRecorder, type Recorder } from "@/lib/recording/recorder";
import { pickSupportedMimeType } from "@/lib/recording/mime";
import { getStream, setRecording, clearStream } from "@/lib/recording/session";
import { formatDuration } from "@/lib/format/time";

const MAX_DURATION_MS = 60_000;

export default function RecordRecordingPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const recorderRef = useRef<Recorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const stoppedRef = useRef(false);
  const startedRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleStop = useCallback(async () => {
    if (stoppedRef.current) return;
    stoppedRef.current = true;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    const recorder = recorderRef.current;
    if (!recorder) {
      router.replace("/record/camera");
      return;
    }
    try {
      const result = await recorder.stop();
      setRecording(result);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      clearStream();
      router.push("/record/processing");
    } catch (err) {
      console.error("[dear-me] recorder stop failed", err);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      clearStream();
      router.replace("/record/camera");
    }
  }, [router]);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const stream = getStream();
    if (!stream) {
      router.replace("/record/camera");
      return;
    }
    streamRef.current = stream;
    if (videoRef.current) videoRef.current.srcObject = stream;

    const mimeType = pickSupportedMimeType();
    const recorder = createRecorder(stream, mimeType);
    recorderRef.current = recorder;
    recorder.start();

    const startedAt = Date.now();
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startedAt;
      setElapsedMs(elapsed);
      if (elapsed >= MAX_DURATION_MS) {
        void handleStop();
      }
    }, 100);
  }, [router, handleStop]);

  function handleClose() {
    if (stoppedRef.current) return;
    stoppedRef.current = true;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    const recorder = recorderRef.current;
    if (recorder) {
      try {
        if (recorder.isRecording()) void recorder.stop().catch(() => {});
      } catch {}
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    clearStream();
    router.push("/");
  }

  return (
    <div className="relative min-h-dvh overflow-hidden bg-black">
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="absolute inset-0 size-full object-cover"
        aria-hidden
      />

      <div className="absolute left-0 right-0 top-14 flex items-center justify-between px-5">
        <GlassIconButton onClick={handleClose} aria-label="Stop recording and go back">
          <X size={16} strokeWidth={2.5} className="text-foreground/75" aria-hidden />
        </GlassIconButton>

        <div
          className="flex min-h-11 items-center gap-1.5 rounded-[var(--radius-lg)] bg-white/53 px-3 py-1.5 backdrop-blur-md ring-[0.5px] ring-inset ring-[color:var(--color-glass-border)] shadow-[0_2px_6px_rgba(92,107,58,0.031)]"
          aria-label={`Recording — elapsed time ${formatDuration(elapsedMs)}`}
        >
          <span
            className="block size-2 rounded-full bg-[#E53E3E] shadow-[0_0_6px_rgba(229,62,62,0.333)]"
            aria-hidden
          />
          <span className="text-[13px] font-semibold text-foreground/75">
            {formatDuration(elapsedMs)}
          </span>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center gap-5 px-6 pb-10 pt-4">
        <div className="flex w-full items-center justify-center gap-12">
          <GlassIconButton shape="square" aria-label="Pause recording">
            <Pause size={18} strokeWidth={2} className="text-foreground/75" aria-hidden />
          </GlassIconButton>

          <RecordButton onPress={handleStop} state="recording" size="lg" />

          <GlassIconButton shape="square" aria-label="Flip camera">
            <RefreshCw size={15} strokeWidth={2.5} className="text-foreground/75" aria-hidden />
          </GlassIconButton>
        </div>
      </div>
    </div>
  );
}
