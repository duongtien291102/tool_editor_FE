import React, { useState, useRef } from 'react';
import { Upload, X, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import {
  storageClient,
  type CompleteUploadResponse,
  type DirectUploadProgress,
} from '../api/storageClient';

interface AzureDirectUploaderProps {
  category?: 'images' | 'videos' | 'renders' | 'audio' | 'subtitles';
  projectId?: string;
  onUploadSuccess?: (mediaAsset: {
    id: string;
    blobPath: string;
    contentUrl: string;
    name: string;
  }) => void;
  className?: string;
}

export const AzureDirectUploader: React.FC<AzureDirectUploaderProps> = ({
  category = 'images',
  projectId,
  onUploadSuccess,
  className = '',
}) => {
  const [status, setStatus] = useState<
    'idle' | 'requesting' | 'uploading' | 'completing' | 'success' | 'error'
  >('idle');
  const [progress, setProgress] = useState<DirectUploadProgress | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [completedAsset, setCompletedAsset] = useState<CompleteUploadResponse | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  const handleFileSelect = (file: File) => {
    setCurrentFile(file);
    void startUpload(file);
  };

  const startUpload = async (file: File) => {
    try {
      setStatus('requesting');
      setErrorMessage(null);
      setProgress(null);

      // 1. Request SAS Upload URL
      const sasData = await storageClient.requestUploadUrl({
        fileName: file.name,
        contentType: file.type || 'application/octet-stream',
        size: file.size,
        category,
        projectId,
      });

      // 2. Direct upload to Azure Blob Storage via PUT
      setStatus('uploading');
      abortControllerRef.current = new AbortController();

      await storageClient.uploadDirectToAzure(sasData.uploadUrl, file, {
        signal: abortControllerRef.current.signal,
        onProgress: (p) => setProgress(p),
      });

      // 3. Notify Backend completion
      setStatus('completing');
      const completeRes = await storageClient.completeUpload({
        blobPath: sasData.blobPath,
        name: file.name,
        contentType: file.type,
        size: file.size,
        projectId,
      });

      setStatus('success');
      setCompletedAsset(completeRes);
      onUploadSuccess?.(completeRes);
    } catch (err: unknown) {
      const error = err as { name?: string; message?: string };
      if (error.name === 'AbortError' || error.message?.includes('cancelled')) {
        setStatus('idle');
        setErrorMessage('Tải lên đã bị hủy bởi người dùng.');
      } else {
        setStatus('error');
        setErrorMessage(error.message ?? 'Đã xảy ra lỗi khi tải tệp lên Azure Blob Storage.');
      }
    }
  };

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const handleRetry = () => {
    if (currentFile) {
      void startUpload(currentFile);
    }
  };

  return (
    <div
      className={`rounded-xl border border-white/10 bg-zinc-900/90 p-4 text-zinc-200 shadow-xl ${className}`}
    >
      {status === 'idle' && (
        <label className="flex flex-col items-center justify-center gap-2 cursor-pointer rounded-lg border-2 border-dashed border-white/20 p-6 transition-colors hover:border-cyan-500 hover:bg-cyan-500/5">
          <Upload className="size-8 text-cyan-400" />
          <span className="text-sm font-medium text-zinc-200">
            Kéo thả tệp hoặc Bấm để tải lên Azure Blob
          </span>
          <span className="text-xs text-zinc-400">
            Hỗ trợ Video (≤20GB), Ảnh (≤100MB), Audio (≤2GB), Subtitles
          </span>
          <input
            type="file"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileSelect(e.target.files[0]);
              }
            }}
          />
        </label>
      )}

      {(status === 'requesting' || status === 'uploading' || status === 'completing') && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="truncate text-zinc-200">{currentFile?.name}</span>
            <span className="text-cyan-400">
              {status === 'requesting' && 'Đang khởi tạo SAS Key...'}
              {status === 'uploading' &&
                `${progress?.percent ?? 0}% · ${progress?.speedFormatted ?? '0 KB/s'}`}
              {status === 'completing' && 'Đang xác thực Metadata...'}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-200"
              style={{ width: `${progress?.percent ?? 5}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-zinc-400">
            <span>
              {progress
                ? `${(progress.loaded / (1024 * 1024)).toFixed(1)} MB / ${(progress.total / (1024 * 1024)).toFixed(1)} MB`
                : 'Đang chuẩn bị...'}
            </span>
            <button
              type="button"
              onClick={handleCancel}
              className="flex items-center gap-1 rounded bg-rose-500/20 px-2 py-0.5 text-rose-300 hover:bg-rose-500/30"
            >
              <X className="size-3" /> Hủy tải lên
            </button>
          </div>
        </div>
      )}

      {status === 'success' && (
        <div className="flex items-center justify-between rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-5 text-emerald-400" />
            <div>
              <p className="font-semibold text-emerald-200">
                Đã tải lên Azure Blob Storage thành công!
              </p>
              <p className="text-[11px] text-emerald-400/80">{completedAsset?.blobPath}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setStatus('idle')}
            className="rounded bg-emerald-500/20 px-2.5 py-1 text-emerald-200 hover:bg-emerald-500/30"
          >
            Tải tệp khác
          </button>
        </div>
      )}

      {status === 'error' && (
        <div className="flex flex-col gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
          <div className="flex items-center gap-2">
            <AlertCircle className="size-5 text-rose-400" />
            <span className="font-semibold">{errorMessage ?? 'Lỗi tải lên tệp.'}</span>
          </div>
          <div className="flex justify-end gap-2 mt-1">
            <button
              type="button"
              onClick={() => setStatus('idle')}
              className="rounded bg-white/10 px-2 py-1 text-zinc-300 hover:bg-white/20"
            >
              Đóng
            </button>
            <button
              type="button"
              onClick={handleRetry}
              className="flex items-center gap-1 rounded bg-rose-500/30 px-2.5 py-1 text-rose-200 hover:bg-rose-500/40"
            >
              <RefreshCw className="size-3" /> Thử lại
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
