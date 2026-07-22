import { apiClient, responseData } from './httpClient';
import type { ApiSchema, QueryParams } from './types';

export const ProjectApi = {
  list: (params?: QueryParams) =>
    responseData(
      apiClient.get<ApiSchema<'ProjectListResponseApiResponse'>>('/api/v1/projects', { params }),
    ),
  get: (id: string) =>
    responseData(apiClient.get<ApiSchema<'ProjectDtoApiResponse'>>(`/api/v1/projects/${id}`)),
  create: (request: ApiSchema<'CreateProjectRequest'>) =>
    responseData(apiClient.post<ApiSchema<'ProjectDtoApiResponse'>>('/api/v1/projects', request)),
  update: (id: string, request: ApiSchema<'UpdateProjectRequest'>) =>
    responseData(
      apiClient.put<ApiSchema<'ProjectDtoApiResponse'>>(`/api/v1/projects/${id}`, request),
    ),
  remove: (id: string) =>
    responseData(apiClient.delete<ApiSchema<'BooleanApiResponse'>>(`/api/v1/projects/${id}`)),
};
