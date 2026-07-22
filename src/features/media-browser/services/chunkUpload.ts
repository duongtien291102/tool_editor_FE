import { UploadApi } from '@/api/UploadApi';

const CHUNK_SIZE = 5 * 1024 * 1024;

async function sha256(data: Blob): Promise<string> {
  const digest = await window.crypto.subtle.digest('SHA-256', await data.arrayBuffer());
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export interface ChunkUploadControl {
  isCancelled: () => boolean;
  onSession: (id: string) => void;
  onProgress: (percentage: number) => void;
}

export async function uploadInChunks(
  projectId: string,
  file: File,
  control: ChunkUploadControl,
): Promise<void> {
  const chunkCount = Math.max(1, Math.ceil(file.size / CHUNK_SIZE));
  const start = await UploadApi.start({
    projectId,
    fileName: file.name,
    contentType: file.type || 'application/octet-stream',
    fileSize: file.size,
    chunkCount,
    checksum: await sha256(file),
  });
  const uploadId = start.data?.id;
  if (!start.success || !uploadId) throw new Error(start.message ?? 'Unable to start upload.');
  control.onSession(uploadId);

  for (let index = 0; index < chunkCount; index += 1) {
    if (control.isCancelled()) {
      await UploadApi.cancel(uploadId);
      throw new Error('Upload cancelled.');
    }
    const chunk = file.slice(index * CHUNK_SIZE, Math.min(file.size, (index + 1) * CHUNK_SIZE));
    const response = await UploadApi.chunk(uploadId, index, await sha256(chunk), chunk);
    if (!response.success)
      throw new Error(response.message ?? `Unable to upload chunk ${index + 1}.`);
    control.onProgress(Math.round(((index + 1) / chunkCount) * 95));
  }

  const completed = await UploadApi.complete(uploadId);
  if (!completed.success) throw new Error(completed.message ?? 'Unable to complete upload.');
  control.onProgress(100);
}
