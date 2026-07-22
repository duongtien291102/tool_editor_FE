import { apiClient, responseData } from './httpClient';
import type { ApiSchema, QueryParams } from './types';

export const WorkflowApi = {
  list: (projectId: string, params?: QueryParams) =>
    responseData(
      apiClient.get<ApiSchema<'WorkflowSummaryDtoPagedResultApiResponse'>>(
        `/api/v1/projects/${projectId}/workflows`,
        { params },
      ),
    ),
  get: (id: string) =>
    responseData(apiClient.get<ApiSchema<'WorkflowDtoApiResponse'>>(`/api/v1/workflows/${id}`)),
  getExecution: (id: string) =>
    responseData(
      apiClient.get<ApiSchema<'WorkflowExecutionDtoApiResponse'>>(
        `/api/v1/workflows/${id}/execution`,
      ),
    ),
  create: (request: ApiSchema<'CreateWorkflowRequest'>) =>
    responseData(apiClient.post<ApiSchema<'WorkflowDtoApiResponse'>>('/api/v1/workflows', request)),
  update: (id: string, request: ApiSchema<'UpdateWorkflowRequest'>) =>
    responseData(
      apiClient.put<ApiSchema<'WorkflowDtoApiResponse'>>(`/api/v1/workflows/${id}`, request),
    ),
  remove: (id: string) => apiClient.delete(`/api/v1/workflows/${id}`),
  run: (id: string) =>
    responseData(
      apiClient.post<ApiSchema<'WorkflowDtoApiResponse'>>(`/api/v1/workflows/${id}/run`),
    ),
  cancel: (id: string) =>
    responseData(apiClient.post<ApiSchema<'ObjectApiResponse'>>(`/api/v1/workflows/${id}/cancel`)),
  retry: (id: string) =>
    responseData(
      apiClient.post<ApiSchema<'WorkflowDtoApiResponse'>>(`/api/v1/workflows/${id}/retry`),
    ),
  pause: (id: string) =>
    responseData(apiClient.post<ApiSchema<'ObjectApiResponse'>>(`/api/v1/workflows/${id}/pause`)),
  resume: (id: string) =>
    responseData(apiClient.post<ApiSchema<'ObjectApiResponse'>>(`/api/v1/workflows/${id}/resume`)),
};
