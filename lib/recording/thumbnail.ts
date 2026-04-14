/**
 * Extract a JPEG thumbnail from a video Blob.
 *
 * Loads the video off-document, seeks to a frame (~0.5s by default, or 10%
 * of the duration for very short memos), draws it to an OffscreenCanvas
 * (falling back to a regular <canvas> if OffscreenCanvas isn't available),
 * and returns the encoded JPEG as a Blob.
 *
 * Throws a descriptive Error if the video fails to load, seek, or encode.
 * Callers should wrap in try/catch — thumbnail extraction must never block
 * memo creation.
 */
export async function extractVideoThumbnail(
  videoBlob: Blob,
  opts?: { atSeconds?: number; width?: number; quality?: number },
): Promise<Blob> {
  if (typeof document === "undefined") {
    throw new Error("extractVideoThumbnail must run in the browser");
  }

  const targetWidth = opts?.width ?? 240;
  const quality = opts?.quality ?? 0.8;

  const video = document.createElement("video");
  video.muted = true;
  video.playsInline = true;
  video.preload = "auto";
  // Local object URLs don't need CORS, but setting this keeps the canvas
  // untainted if the blob ever originates from a cross-origin fetch.
  video.crossOrigin = "anonymous";

  const objectUrl = URL.createObjectURL(videoBlob);
  video.src = objectUrl;

  try {
    await waitForEvent(video, "loadedmetadata", "loadedmetadata timeout");

    const duration = Number.isFinite(video.duration) ? video.duration : 0;
    const requested = opts?.atSeconds ?? 0.5;
    const maxSeek = Math.max(0, duration - 0.1);
    const seekTime =
      duration > 0 && duration < 1
        ? Math.min(duration * 0.1, maxSeek)
        : Math.min(requested, maxSeek);

    const seekPromise = waitForEvent(video, "seeked", "seeked timeout");
    video.currentTime = seekTime;
    await seekPromise;

    const vw = video.videoWidth;
    const vh = video.videoHeight;
    if (!vw || !vh) {
      throw new Error("video has zero dimensions");
    }

    const width = Math.min(targetWidth, vw);
    const height = Math.round((vh / vw) * width);

    const useOffscreen = typeof OffscreenCanvas !== "undefined";
    if (useOffscreen) {
      const canvas = new OffscreenCanvas(width, height);
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("OffscreenCanvas 2d context unavailable");
      ctx.drawImage(video, 0, 0, width, height);
      const blob = await canvas.convertToBlob({
        type: "image/jpeg",
        quality,
      });
      return blob;
    }

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("canvas 2d context unavailable");
    ctx.drawImage(video, 0, 0, width, height);
    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((b) => resolve(b), "image/jpeg", quality);
    });
    if (!blob) throw new Error("canvas.toBlob returned null");
    return blob;
  } finally {
    URL.revokeObjectURL(objectUrl);
    video.removeAttribute("src");
    try {
      video.load();
    } catch {
      // ignore — best effort cleanup
    }
  }
}

function waitForEvent(
  video: HTMLVideoElement,
  eventName: "loadedmetadata" | "seeked",
  timeoutMessage: string,
  timeoutMs = 5000,
): Promise<void> {
  return new Promise((resolve, reject) => {
    let done = false;
    const onEvent = () => {
      if (done) return;
      done = true;
      cleanup();
      resolve();
    };
    const onError = () => {
      if (done) return;
      done = true;
      cleanup();
      reject(
        new Error(
          `video ${eventName} failed: ${video.error?.message ?? "unknown"}`,
        ),
      );
    };
    const timer = setTimeout(() => {
      if (done) return;
      done = true;
      cleanup();
      reject(new Error(timeoutMessage));
    }, timeoutMs);
    const cleanup = () => {
      clearTimeout(timer);
      video.removeEventListener(eventName, onEvent);
      video.removeEventListener("error", onError);
    };
    video.addEventListener(eventName, onEvent);
    video.addEventListener("error", onError);
  });
}
