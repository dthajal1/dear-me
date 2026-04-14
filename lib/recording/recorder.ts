export type RecordingResult = {
  blob: Blob;
  durationMs: number;
  mimeType: string;
};

export type Recorder = {
  start(): void;
  stop(): Promise<RecordingResult>;
  isRecording(): boolean;
};

export function createRecorder(stream: MediaStream, mimeType: string | undefined): Recorder {
  const chunks: Blob[] = [];
  let recorder: MediaRecorder;
  try {
    recorder = mimeType
      ? new MediaRecorder(stream, { mimeType })
      : new MediaRecorder(stream);
  } catch (err) {
    throw new Error(`MediaRecorder construction failed: ${(err as Error).message}`);
  }

  let startedAt = 0;
  let stopResolve: ((r: RecordingResult) => void) | null = null;
  let stopReject: ((e: Error) => void) | null = null;

  recorder.addEventListener("dataavailable", (e: BlobEvent) => {
    if (e.data && e.data.size > 0) chunks.push(e.data);
  });

  recorder.addEventListener("stop", () => {
    if (!stopResolve) return;
    const blob = new Blob(chunks, { type: recorder.mimeType });
    const durationMs = Date.now() - startedAt;
    stopResolve({ blob, durationMs, mimeType: recorder.mimeType });
    stopResolve = null;
    stopReject = null;
  });

  recorder.addEventListener("error", () => {
    if (stopReject) {
      stopReject(new Error("MediaRecorder error event fired"));
      stopResolve = null;
      stopReject = null;
    }
  });

  return {
    start() {
      startedAt = Date.now();
      recorder.start();
    },
    stop() {
      return new Promise<RecordingResult>((resolve, reject) => {
        if (recorder.state === "inactive") {
          reject(new Error("Recorder is not active"));
          return;
        }
        stopResolve = resolve;
        stopReject = reject;
        recorder.stop();
      });
    },
    isRecording() {
      return recorder.state === "recording";
    },
  };
}
