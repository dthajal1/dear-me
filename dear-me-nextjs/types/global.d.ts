import type { RecordingResult } from "@/lib/recording/recorder";

declare global {
  interface Window {
    __recordSession?: {
      stream?: MediaStream;
      recording?: RecordingResult;
    };
  }
}

export {};
