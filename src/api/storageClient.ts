import { apiClient, responseData } from './httpClient';

export interface GenerateUploadUrlParams {
  fileName: string;
  contentType: string;
  size: number;
  category?: 'images' | 'videos' | 'renders' | 'audio' | 'subtitles';
  projectId?: string;
}

export interface GenerateUploadUrlResponse {
  uploadUrl: string;
  blobPath: string;
  expiresAt: string;
  maxSizeBytes: number;
  storageProvider: string;
}

export interface CompleteUploadParams {
  blobPath: string;
  name?: string;
  contentType?: string;
  size: number;
  projectId?: string;
}

export interface CompleteUploadResponse {
  id: string;
  blobPath: string;
  contentUrl: string;
  name: string;
}

export interface DirectUploadProgress {
  loaded: number;
  total: number;
  percent: number;
  speedBytesPerSec: number;
  speedFormatted: string;
}

export interface DirectUploadOptions {
  onProgress?: (progress: DirectUploadProgress) => void;
  signal?: AbortSignal;
}

export const storageClient = {
  async requestUploadUrl(params: GenerateUploadUrlParams): Promise<GenerateUploadUrlResponse> {
    const envelope = await responseData<GenerateUploadUrlResponse>(
      apiClient.post('/api/v1/storage/upload-url', params),
    );
    return envelope;
  },

  uploadDirectToAzure(
    uploadUrl: string,
    file: File | Blob,
    options: DirectUploadOptions = {},
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      let startTime = Date.now();
      let lastLoaded = 0;

      if (options.signal) {
        options.signal.addEventListener('abort', () => {
          xhr.abort();
          reject(new DOMException('Upload cancelled by user.', 'AbortError'));
        });
      }

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const now = Date.now();
          const elapsedSec = (now - startTime) / 1000;
          const loadedDelta = event.loaded - lastLoaded;
          const speedBytesPerSec = elapsedSec > 0 ? loadedDelta / elapsedSec : 0;
          startTime = now;
          lastLoaded = event.loaded;

          const percent = Math.round((event.loaded / event.total) * 100);
          const speedFormatted = formatSpeed(speedBytesPerSec);

          options.onProgress?.({
            loaded: event.loaded,
            total: event.total,
            percent,
            speedBytesPerSec,
            speedFormatted,
          });
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          reject(
            new Error(
              `Azure Blob direct upload failed with status ${xhr.status}: ${xhr.statusText}`,
            ),
          );
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Network error during direct Azure Blob upload. Please retry.'));
      });

      xhr.addEventListener('timeout', () => {
        reject(new Error('Upload timeout. Direct Azure Blob upload took too long.'));
      });

      xhr.open('PUT', uploadUrl, true);
      xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');
      xhr.setRequestHeader('x-ms-blob-type', 'BlockBlob');
      xhr.send(file);
    });
  },

  async completeUpload(params: CompleteUploadParams): Promise<CompleteUploadResponse> {
    return await responseData<CompleteUploadResponse>(
      apiClient.post('/api/v1/storage/complete', params),
    );
  },

  async getDownloadUrl(path: string): Promise<{ downloadUrl: string; blobPath: string }> {
    return await responseData(
      apiClient.get(`/api/v1/storage/download-url?path=${encodeURIComponent(path)}`),
    );
  },

  async deleteBlob(path: string): Promise<void> {
    await responseData(apiClient.delete(`/api/v1/storage?path=${encodeURIComponent(path)}`));
  },
};

function formatSpeed(bytesPerSec: number): string {
  if (bytesPerSec <= 0) return '0 KB/s';
  const kbps = bytesPerSec / 1024;
  if (kbps < 1024) return `${kbps.toFixed(1)} KB/s`;
  const mbps = kbps / 1024;
  return `${mbps.toFixed(2)} MB/s`;
}
