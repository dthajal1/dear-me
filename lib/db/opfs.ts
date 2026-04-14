const ROOT_PROMISE_KEY = "__opfsRoot";

function getRoot(): Promise<FileSystemDirectoryHandle> {
  if (typeof window === "undefined") {
    throw new Error("OPFS called on the server — this is a client-only module");
  }
  const cached = (globalThis as Record<string, unknown>)[ROOT_PROMISE_KEY];
  if (cached) return cached as Promise<FileSystemDirectoryHandle>;
  const promise = navigator.storage.getDirectory();
  (globalThis as Record<string, unknown>)[ROOT_PROMISE_KEY] = promise;
  return promise;
}

export function isOpfsSupported(): boolean {
  return (
    typeof navigator !== "undefined" &&
    typeof navigator.storage !== "undefined" &&
    typeof navigator.storage.getDirectory === "function"
  );
}

export async function writeBlob(filename: string, blob: Blob): Promise<void> {
  const root = await getRoot();
  const handle = await root.getFileHandle(filename, { create: true });
  const writable = await handle.createWritable();
  await writable.write(blob);
  await writable.close();
}

export async function readBlob(filename: string): Promise<Blob> {
  const root = await getRoot();
  const handle = await root.getFileHandle(filename);
  const file = await handle.getFile();
  return file;
}

export async function deleteFile(filename: string): Promise<void> {
  const root = await getRoot();
  try {
    await root.removeEntry(filename);
  } catch (err) {
    if ((err as DOMException).name !== "NotFoundError") throw err;
  }
}

export async function listFilenames(): Promise<string[]> {
  const root = await getRoot();
  const names: string[] = [];
  for await (const [name] of (root as unknown as AsyncIterable<[string, FileSystemHandle]>)) {
    names.push(name);
  }
  return names;
}
