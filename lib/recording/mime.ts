const PREFERRED_MIME_TYPES = [
  "video/webm;codecs=vp9,opus",
  "video/webm;codecs=vp8,opus",
  "video/mp4;codecs=avc1,mp4a",
  "video/mp4",
] as const;

export function pickSupportedMimeType(): string | undefined {
  if (typeof MediaRecorder === "undefined") return undefined;
  for (const type of PREFERRED_MIME_TYPES) {
    if (MediaRecorder.isTypeSupported(type)) return type;
  }
  return undefined;
}

export function extensionForMimeType(mimeType: string | undefined): string {
  if (!mimeType) return "webm";
  if (mimeType.startsWith("video/mp4")) return "mp4";
  if (mimeType.startsWith("video/webm")) return "webm";
  return "webm";
}
