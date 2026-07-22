import { create } from 'zustand';
import { MediaApi } from '@/api/MediaApi';
import { UploadApi } from '@/api/UploadApi';
import type { ApiSchema } from '@/api/types';
import { uploadInChunks } from '../services/chunkUpload';

type MediaItem = ApiSchema<'MediaDto'>;

interface MediaState {
  items: MediaItem[];
  loading: boolean;
  uploading: boolean;
  uploadProgress: number;
  uploadId: string | null;
  cancelRequested: boolean;
  search: string;
  page: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  error: string | null;
  load: (projectId: string, page?: number, search?: string) => Promise<void>;
  setSearch: (search: string) => void;
  upload: (projectId: string, file: File) => Promise<void>;
  cancelUpload: () => Promise<void>;
  rename: (item: MediaItem, fileName: string, projectId: string) => Promise<void>;
  remove: (id: string, projectId: string) => Promise<void>;
}

export const useMediaStore = create<MediaState>((set, get) => ({
  items: [],
  loading: false,
  uploading: false,
  uploadProgress: 0,
  uploadId: null,
  cancelRequested: false,
  search: '',
  page: 1,
  pageSize: 12,
  totalPages: 0,
  totalCount: 0,
  error: null,

  setSearch: (search) => set({ search }),
  load: async (projectId, page = get().page, search = get().search) => {
    set({ loading: true, error: null });
    try {
      const response = await MediaApi.list(projectId, {
        Page: page,
        PageSize: get().pageSize,
        Search: search || undefined,
        SortBy: 'CreatedAt',
        SortDescending: true,
      });
      if (!response.success) throw new Error(response.message ?? 'Unable to load media.');
      set({
        items: response.data?.items ?? [],
        page: response.data?.page ?? page,
        totalPages: response.data?.totalPages ?? 0,
        totalCount: response.data?.totalCount ?? 0,
        loading: false,
      });
    } catch (error: unknown) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : 'Unable to load media.',
      });
    }
  },
  upload: async (projectId, file) => {
    set({
      uploading: true,
      uploadProgress: 0,
      uploadId: null,
      cancelRequested: false,
      error: null,
    });
    try {
      await uploadInChunks(projectId, file, {
        isCancelled: () => get().cancelRequested,
        onSession: (uploadId) => set({ uploadId }),
        onProgress: (uploadProgress) => set({ uploadProgress }),
      });
      set({ uploading: false, uploadId: null });
      await get().load(projectId, 1);
    } catch (error: unknown) {
      set({
        uploading: false,
        uploadId: null,
        error: error instanceof Error ? error.message : 'Upload failed.',
      });
    }
  },
  cancelUpload: async () => {
    const uploadId = get().uploadId;
    set({ cancelRequested: true });
    if (uploadId) await UploadApi.cancel(uploadId);
  },
  rename: async (item, fileName, projectId) => {
    if (!item.id) return;
    try {
      const response = await MediaApi.update(item.id, {
        fileName,
        width: item.width,
        height: item.height,
        duration: item.duration,
        thumbnailPath: item.thumbnailPath,
      });
      if (!response.success) throw new Error(response.message ?? 'Unable to rename media.');
      await get().load(projectId);
    } catch (error: unknown) {
      set({ error: error instanceof Error ? error.message : 'Unable to rename media.' });
    }
  },
  remove: async (id, projectId) => {
    try {
      const response = await MediaApi.remove(id);
      if (!response.success) throw new Error(response.message ?? 'Unable to delete media.');
      await get().load(projectId);
    } catch (error: unknown) {
      set({ error: error instanceof Error ? error.message : 'Unable to delete media.' });
    }
  },
}));
