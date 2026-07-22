import { apiClient, responseData } from './httpClient';
import type { ApiSchema, QueryParams } from './types';

export const ScriptApi = {
  list: (projectId: string, params?: QueryParams) =>
    responseData(
      apiClient.get<ApiSchema<'ScriptSummaryDtoPagedResultApiResponse'>>(
        `/api/v1/projects/${projectId}/scripts`,
        { params },
      ),
    ),
  get: (id: string) =>
    responseData(apiClient.get<ApiSchema<'ScriptDtoApiResponse'>>(`/api/v1/scripts/${id}`)),
  create: (request: ApiSchema<'CreateScriptRequest'>) =>
    responseData(apiClient.post<ApiSchema<'ScriptDtoApiResponse'>>('/api/v1/scripts', request)),
  update: (id: string, request: ApiSchema<'UpdateScriptRequest'>) =>
    responseData(
      apiClient.put<ApiSchema<'ScriptDtoApiResponse'>>(`/api/v1/scripts/${id}`, request),
    ),
  autosave: (id: string, request: ApiSchema<'AutoSaveScriptRequest'>) =>
    responseData(
      apiClient.post<ApiSchema<'ScriptDtoApiResponse'>>(`/api/v1/scripts/${id}/autosave`, request),
    ),
  remove: (id: string) =>
    responseData(apiClient.delete<ApiSchema<'UnitApiResponse'>>(`/api/v1/scripts/${id}`)),
  addScene: (id: string, request: ApiSchema<'AddSceneRequest'>) =>
    responseData(
      apiClient.post<ApiSchema<'SceneDtoApiResponse'>>(`/api/v1/scripts/${id}/scenes`, request),
    ),
  updateScene: (id: string, sceneId: string, request: ApiSchema<'UpdateSceneRequest'>) =>
    responseData(
      apiClient.put<ApiSchema<'SceneDtoApiResponse'>>(
        `/api/v1/scripts/${id}/scenes/${sceneId}`,
        request,
      ),
    ),
  removeScene: (id: string, sceneId: string, expectedVersion: number) =>
    responseData(
      apiClient.delete<ApiSchema<'UnitApiResponse'>>(`/api/v1/scripts/${id}/scenes/${sceneId}`, {
        params: { expectedVersion },
      }),
    ),
  reorderScenes: (id: string, request: ApiSchema<'ReorderSceneRequest'>) =>
    responseData(
      apiClient.put<ApiSchema<'UnitApiResponse'>>(`/api/v1/scripts/${id}/scenes/reorder`, request),
    ),
  addElement: (id: string, sceneId: string, request: ApiSchema<'AddSceneElementCommand'>) =>
    responseData(
      apiClient.post<ApiSchema<'SceneElementDtoApiResponse'>>(
        `/api/v1/scripts/${id}/scenes/${sceneId}/elements`,
        request,
      ),
    ),
  updateElement: (
    id: string,
    sceneId: string,
    elementId: string,
    request: ApiSchema<'UpdateSceneElementRequest'>,
  ) =>
    responseData(
      apiClient.put<ApiSchema<'SceneElementDtoApiResponse'>>(
        `/api/v1/scripts/${id}/scenes/${sceneId}/elements/${elementId}`,
        request,
      ),
    ),
  removeElement: (id: string, sceneId: string, elementId: string, expectedVersion: number) =>
    responseData(
      apiClient.delete<ApiSchema<'UnitApiResponse'>>(
        `/api/v1/scripts/${id}/scenes/${sceneId}/elements/${elementId}`,
        { params: { expectedVersion } },
      ),
    ),
};
