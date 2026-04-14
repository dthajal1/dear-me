export type CameraAccessResult =
  | { ok: true; stream: MediaStream }
  | {
      ok: false;
      reason: "denied" | "no-device" | "insecure-context" | "unsupported" | "unknown";
      message: string;
    };

export async function requestCameraAccess(
  constraints: MediaStreamConstraints,
): Promise<CameraAccessResult> {
  if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
    return {
      ok: false,
      reason: "unsupported",
      message: "Your browser doesn't support camera access. Please use Chrome, Safari, or Firefox.",
    };
  }
  if (typeof window !== "undefined" && !window.isSecureContext) {
    return {
      ok: false,
      reason: "insecure-context",
      message: "Camera access requires a secure connection (HTTPS).",
    };
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    return { ok: true, stream };
  } catch (err) {
    const error = err as DOMException;
    switch (error.name) {
      case "NotAllowedError":
      case "PermissionDeniedError":
        return {
          ok: false,
          reason: "denied",
          message:
            "Camera access was denied. Tap the lock icon in the address bar → Camera → Allow.",
        };
      case "NotFoundError":
      case "DevicesNotFoundError":
        return {
          ok: false,
          reason: "no-device",
          message: "No camera was found on this device.",
        };
      default:
        return {
          ok: false,
          reason: "unknown",
          message: error.message || "Couldn't access the camera.",
        };
    }
  }
}
