import type { AxiosProgressEvent } from 'axios';
import { apiClient, responseData } from './httpClient';
import type { ApiSchema, QueryParams, UploadProgress } from './types';

export const UploadApi = {
  start: (request: ApiSchema<'StartUploadRequest'>) =>
    responseData(
      apiClient.post<ApiSchema<'UploadSessionDtoApiResponse'>>('/api/v1/uploads/start', request),
    ),
  get: (id: string) =>
    responseData(apiClient.get<ApiSchema<'UploadSessionDtoApiResponse'>>(`/api/v1/uploads/${id}`)),
  list: (projectId: string, params?: QueryParams) =>
    responseData(
      apiClient.get<ApiSchema<'UploadSummaryDtoPagedResultApiResponse'>>(
        `/api/v1/projects/${projectId}/uploads`,
        { params },
      ),
    ),
  chunk: (
    id: string,
    chunkIndex: number,
    checksum: string,
    chunk: Blob,
    onProgress?: (progress: UploadProgress) => void,
  ) => {
    const form = new FormData();
    form.append('chunkIndex', String(chunkIndex));
    form.append('checksum', checksum);
    form.append('chunk', chunk);
    return responseData(
      apiClient.post<ApiSchema<'ChunkDtoApiResponse'>>(`/api/v1/uploads/${id}/chunk`, form, {
        onUploadProgress: (event: AxiosProgressEvent) =>
          onProgress?.({
            loaded: event.loaded,
            total: event.total,
            percentage: event.progress,
          }),
      }),
    );
  },
  complete: (id: string) =>
    responseData(
      apiClient.post<ApiSchema<'UploadSessionDtoApiResponse'>>(`/api/v1/uploads/${id}/complete`),
    ),
  cancel: (id: string) =>
    responseData(apiClient.post<ApiSchema<'ObjectApiResponse'>>(`/api/v1/uploads/${id}/cancel`)),
  retry: (id: string) =>
    responseData(
      apiClient.post<ApiSchema<'UploadSessionDtoApiResponse'>>(`/api/v1/uploads/${id}/retry`),
    ),
};
