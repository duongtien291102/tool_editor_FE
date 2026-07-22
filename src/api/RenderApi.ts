import { apiClient, responseData } from './httpClient';
import type { ApiSchema, QueryParams } from './types';

export const RenderApi = {
  list: (params?: QueryParams) =>
    responseData(
      apiClient.get<ApiSchema<'RenderJobSummaryDtoPagedResultApiResponse'>>('/api/v1/render-jobs', {
        params,
      }),
    ),
  listByProject: (projectId: string, params?: QueryParams) =>
    responseData(
      apiClient.get<ApiSchema<'RenderJobSummaryDtoPagedResultApiResponse'>>(
        `/api/v1/projects/${projectId}/render-jobs`,
        { params },
      ),
    ),
  get: (id: string) =>
    responseData(apiClient.get<ApiSchema<'RenderJobDtoApiResponse'>>(`/api/v1/render-jobs/${id}`)),
  create: (request: ApiSchema<'CreateRenderJobRequest'>) =>
    responseData(
      apiClient.post<ApiSchema<'RenderJobDtoApiResponse'>>('/api/v1/render-jobs', request),
    ),
  cancel: (id: string) =>
    responseData(
      apiClient.post<ApiSchema<'ObjectApiResponse'>>(`/api/v1/render-jobs/${id}/cancel`),
    ),
  retry: (id: string) =>
    responseData(
      apiClient.post<ApiSchema<'RenderJobDtoApiResponse'>>(`/api/v1/render-jobs/${id}/retry`),
    ),
};
