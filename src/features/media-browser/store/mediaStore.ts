import { create } from 'zustand';
import { MediaApi } from '@/api/MediaApi';
import { UploadApi } from '@/api/UploadApi';
import type { ApiSchema } from '@/api/types';
import { uploadInChunks } from '../services/chunkUpload';

type MediaItem = ApiSchema<'MediaDto'>;

interface MediaState {
  items: MediaItem[];
  loading: boolean;
  loadingMore: boolean;
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
  selectedIds: Set<string>;
  load: (projectId: string, page?: number, search?: string) => Promise<void>;
  loadMore: (projectId: string) => Promise<void>;
  setSearch: (search: string) => void;
  upload: (projectId: string, file: File) => Promise<void>;
  cancelUpload: () => Promise<void>;
  rename: (item: MediaItem, fileName: string, projectId: string) => Promise<void>;
  remove: (id: string, projectId: string) => Promise<void>;
  removeMultiple: (ids: string[], projectId: string) => Promise<void>;
  toggleSelection: (id: string) => void;
  clearSelection: () => void;
  selectAll: () => void;
}

export const useMediaStore = create<MediaState>((set, get) => ({
  items: [],
  loading: false,
  loadingMore: false,
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
  selectedIds: new Set(),

  setSearch: (search) => set({ search, page: 1, selectedIds: new Set() }),
  load: async (projectId, page = 1, search = get().search) => {
    set({ loading: true, error: null, page, selectedIds: new Set() });
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
  loadMore: async (projectId) => {
    const currentState = get();
    if (currentState.loadingMore || currentState.page >= currentState.totalPages) return;

    set({ loadingMore: true });
    try {
      const nextPage = currentState.page + 1;
      const response = await MediaApi.list(projectId, {
        Page: nextPage,
        PageSize: currentState.pageSize,
        Search: currentState.search || undefined,
        SortBy: 'CreatedAt',
        SortDescending: true,
      });
      if (!response.success) throw new Error(response.message ?? 'Unable to load more media.');
      set({
        items: [...currentState.items, ...(response.data?.items ?? [])],
        page: response.data?.page ?? nextPage,
        totalPages: response.data?.totalPages ?? 0,
        totalCount: response.data?.totalCount ?? 0,
        loadingMore: false,
      });
    } catch (error: unknown) {
      set({
        loadingMore: false,
        error: error instanceof Error ? error.message : 'Unable to load more media.',
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
  removeMultiple: async (ids, projectId) => {
    try {
      const responses = await Promise.all(ids.map((id) => MediaApi.remove(id)));
      const allSuccess = responses.every((r) => r.success);
      if (!allSuccess) throw new Error('Unable to delete some media items.');
      await get().load(projectId);
    } catch (error: unknown) {
      set({ error: error instanceof Error ? error.message : 'Unable to delete media items.' });
    }
  },
  toggleSelection: (id) => {
    set((state) => {
      const newSelected = new Set(state.selectedIds);
      if (newSelected.has(id)) {
        newSelected.delete(id);
      } else {
        newSelected.add(id);
      }
      return { selectedIds: newSelected };
    });
  },
  clearSelection: () => set({ selectedIds: new Set() }),
  selectAll: () => {
    set((state) => ({
      selectedIds: new Set(state.items.map((item) => item.id ?? '')),
    }));
  },
}));
