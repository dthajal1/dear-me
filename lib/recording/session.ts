import type { RecordingResult } from "./recorder";

function ensure(): NonNullable<Window["__recordSession"]> {
  if (typeof window === "undefined") {
    throw new Error("recordSession accessed on the server");
  }
  if (!window.__recordSession) window.__recordSession = {};
  return window.__recordSession;
}

export function setStream(stream: MediaStream): void {
  ensure().stream = stream;
}

export function getStream(): MediaStream | undefined {
  return ensure().stream;
}

export function clearStream(): void {
  const s = ensure();
  s.stream = undefined;
}

export function setRecording(recording: RecordingResult): void {
  ensure().recording = recording;
}

export function getRecording(): RecordingResult | undefined {
  return ensure().recording;
}

export function clearRecording(): void {
  const s = ensure();
  s.recording = undefined;
}

export function clearAll(): void {
  const s = ensure();
  s.stream = undefined;
  s.recording = undefined;
}
