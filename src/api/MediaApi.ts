import type { AxiosProgressEvent } from 'axios';
import { apiClient, responseData } from './httpClient';
import type { ApiSchema, QueryParams, UploadProgress } from './types';

function toProgress(event: AxiosProgressEvent): UploadProgress {
  return { loaded: event.loaded, total: event.total, percentage: event.progress };
}

export const MediaApi = {
  list: (projectId: string, params?: QueryParams) =>
    responseData(
      apiClient.get<ApiSchema<'MediaListResponseApiResponse'>>(
        `/api/v1/projects/${projectId}/media`,
        { params },
      ),
    ),
  get: (id: string) =>
    responseData(apiClient.get<ApiSchema<'MediaDtoApiResponse'>>(`/api/v1/media/${id}`)),
  content: (id: string, variant: 'original' | 'thumbnail' = 'original') =>
    responseData(
      apiClient.get<Blob>(`/api/v1/media/${id}/content`, {
        params: { variant },
        responseType: 'blob',
      }),
    ),
  upload: (projectId: string, file: File, onProgress?: (progress: UploadProgress) => void) => {
    const form = new FormData();
    form.append('projectId', projectId);
    form.append('file', file);
    return responseData(
      apiClient.post<ApiSchema<'MediaDtoApiResponse'>>('/api/v1/media/upload', form, {
        onUploadProgress: (event) => onProgress?.(toProgress(event)),
      }),
    );
  },
  update: (id: string, request: ApiSchema<'UpdateMediaRequest'>) =>
    responseData(apiClient.put<ApiSchema<'MediaDtoApiResponse'>>(`/api/v1/media/${id}`, request)),
  remove: (id: string) =>
    responseData(apiClient.delete<ApiSchema<'BooleanApiResponse'>>(`/api/v1/media/${id}`)),
};
