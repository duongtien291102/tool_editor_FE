import { apiClient, responseData } from './httpClient';
import type { ApiSchema, QueryParams } from './types';

export const ExportApi = {
  list: (projectId: string, params?: QueryParams) =>
    responseData(
      apiClient.get<ApiSchema<'ExportSummaryDtoPagedResultApiResponse'>>(
        `/api/v1/projects/${projectId}/exports`,
        { params },
      ),
    ),
  get: (id: string) =>
    responseData(apiClient.get<ApiSchema<'ExportJobDtoApiResponse'>>(`/api/v1/export/${id}`)),
  create: (request: ApiSchema<'CreateExportRequest'>) =>
    responseData(apiClient.post<ApiSchema<'ExportJobDtoApiResponse'>>('/api/v1/export', request)),
  cancel: (id: string) =>
    responseData(apiClient.post<ApiSchema<'ObjectApiResponse'>>(`/api/v1/export/${id}/cancel`)),
  retry: (id: string) =>
    responseData(
      apiClient.post<ApiSchema<'ExportJobDtoApiResponse'>>(`/api/v1/export/${id}/retry`),
    ),
};
