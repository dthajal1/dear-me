"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { X, RefreshCw, ZapOff } from "lucide-react";
import { RecordButton } from "@/components/dear-me/record-button";
import { GlassIconButton } from "@/components/dear-me/glass-icon-button";
import { requestCameraAccess, type CameraAccessResult } from "@/lib/recording/permissions";
import { setStream } from "@/lib/recording/session";

type FacingMode = "user" | "environment";

export default function RecordCameraPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [facingMode, setFacingMode] = useState<FacingMode>("user");
  const [retryKey, setRetryKey] = useState(0);
  const [result, setResult] = useState<CameraAccessResult | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const navigatedToRecord = useRef(false);

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setResult(null);
    (async () => {
      let r = await requestCameraAccess({
        video: { facingMode },
        audio: true,
      });
      if (!r.ok && r.reason === "no-device") {
        r = await requestCameraAccess({ video: true, audio: true });
      }
      if (cancelled) {
        if (r.ok) r.stream.getTracks().forEach((t) => t.stop());
        return;
      }
      setResult(r);
      if (r.ok) {
        streamRef.current = r.stream;
        if (videoRef.current) videoRef.current.srcObject = r.stream;
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [facingMode, retryKey]);

  useEffect(() => {
    return () => {
      if (navigatedToRecord.current) return;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  function handleRecord() {
    if (!streamRef.current) return;
    setStream(streamRef.current);
    navigatedToRecord.current = true;
    router.push("/record/recording");
  }

  function handleFlip() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setFacingMode((m) => (m === "user" ? "environment" : "user"));
  }

  function handleClose() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
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
        <GlassIconButton onClick={handleClose} aria-label="Close camera">
          <X size={16} strokeWidth={2.5} className="text-foreground/75" aria-hidden />
        </GlassIconButton>

        <GlassIconButton onClick={handleFlip} aria-label="Flip camera">
          <RefreshCw size={15} strokeWidth={2.5} className="text-foreground/75" aria-hidden />
        </GlassIconButton>
      </div>

      <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center gap-5 px-6 pb-10 pt-4">
        <div className="flex w-full items-center justify-center gap-12">
          <div
            className="flex size-11 items-center justify-center rounded-[var(--radius-xl)] bg-white/53 backdrop-blur-md ring-[0.5px] ring-inset ring-[color:var(--color-glass-border)] shadow-[0_2px_6px_rgba(92,107,58,0.039)]"
            aria-label="Max duration"
          >
            <span className="text-[13px] font-semibold text-foreground/75">
              1m
            </span>
          </div>

          <RecordButton onPress={handleRecord} state="idle" size="lg" />

          <GlassIconButton shape="square" aria-label="Toggle flash">
            <ZapOff size={18} strokeWidth={2} className="text-foreground/75" aria-hidden />
          </GlassIconButton>
        </div>
      </div>

      {result && !result.ok && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/70 px-8">
          <div className="flex flex-col items-center gap-4 rounded-2xl bg-[var(--color-glass-surface)] p-6 text-center text-foreground backdrop-blur">
            <h2 className="text-base font-semibold">Camera access needed</h2>
            <p className="text-sm text-[color:var(--color-muted-foreground)]">
              {result.message}
            </p>
            <button
              type="button"
              onClick={() => setRetryKey((k) => k + 1)}
              className="rounded-full bg-[var(--color-primary)] px-5 py-2 text-sm font-semibold text-[color:var(--color-primary-foreground)]"
            >
              Try again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
