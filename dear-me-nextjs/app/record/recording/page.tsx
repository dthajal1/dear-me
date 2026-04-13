"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { X, Pause, RefreshCw } from "lucide-react";
import { RecordButton } from "@/components/dear-me/record-button";
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
    router.push("/record/trigger");
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
        <button
          type="button"
          onClick={handleClose}
          aria-label="Stop recording and go back"
          className="flex size-9 items-center justify-center rounded-full bg-white/53 backdrop-blur-md ring-[0.5px] ring-inset ring-[#8A9A5B18] transition-opacity active:opacity-70"
          style={{ boxShadow: "0 2px 6px rgba(92,107,58,0.031)" }}
        >
          <X size={16} strokeWidth={2.5} className="text-[#2C331EBB]" aria-hidden />
        </button>

        <div
          className="flex items-center gap-[7px] rounded-[20px] bg-white/53 px-3 py-[7px] backdrop-blur-md ring-[0.5px] ring-inset ring-[#8A9A5B18]"
          style={{ boxShadow: "0 2px 6px rgba(92,107,58,0.031)" }}
          aria-label={`Recording — elapsed time ${formatDuration(elapsedMs)}`}
        >
          <span
            className="block size-2 rounded-full bg-[#E53E3E]"
            style={{ boxShadow: "0 0 6px rgba(229,62,62,0.333)" }}
            aria-hidden
          />
          <span className="font-['Geist',sans-serif] text-[13px] font-semibold text-[#2C331EBB]">
            {formatDuration(elapsedMs)}
          </span>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center gap-5 px-6 pb-10 pt-4">
        <div className="flex w-full items-center justify-center gap-12">
          <button
            type="button"
            aria-label="Pause recording"
            className="flex size-11 items-center justify-center rounded-[22px] bg-white/53 backdrop-blur-md ring-[0.5px] ring-inset ring-[#8A9A5B20] transition-opacity active:opacity-70"
            style={{ boxShadow: "0 2px 6px rgba(92,107,58,0.039)" }}
          >
            <Pause size={18} strokeWidth={2} className="text-[#2C331EBB]" aria-hidden />
          </button>

          <RecordButton onPress={handleStop} state="recording" size="lg" />

          <button
            type="button"
            aria-label="Flip camera"
            className="flex size-11 items-center justify-center rounded-[22px] bg-white/53 backdrop-blur-md ring-[0.5px] ring-inset ring-[#8A9A5B20] transition-opacity active:opacity-70"
            style={{ boxShadow: "0 2px 6px rgba(92,107,58,0.039)" }}
          >
            <RefreshCw size={15} strokeWidth={2.5} className="text-[#2C331EBB]" aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
}
