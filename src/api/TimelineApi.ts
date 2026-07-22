import { apiClient, responseData } from './httpClient';
import type { ApiSchema } from './types';

export const TimelineApi = {
  get: (id: string) =>
    responseData(apiClient.get<ApiSchema<'TimelineDtoApiResponse'>>(`/api/v1/timelines/${id}`)),
  getByProject: (projectId: string) =>
    responseData(
      apiClient.get<ApiSchema<'TimelineDtoApiResponse'>>(`/api/v1/projects/${projectId}/timeline`),
    ),
  create: (request: ApiSchema<'CreateTimelineRequest'>) =>
    responseData(apiClient.post<ApiSchema<'TimelineDtoApiResponse'>>('/api/v1/timelines', request)),
  update: (id: string, request: ApiSchema<'UpdateTimelineRequest'>) =>
    responseData(
      apiClient.put<ApiSchema<'TimelineDtoApiResponse'>>(`/api/v1/timelines/${id}`, request),
    ),
  autosave: (id: string, request: ApiSchema<'AutoSaveTimelineRequest'>) =>
    responseData(
      apiClient.post<ApiSchema<'TimelineDtoApiResponse'>>(
        `/api/v1/timelines/${id}/autosave`,
        request,
      ),
    ),
  remove: (id: string) => apiClient.delete(`/api/v1/timelines/${id}`),
  addTrack: (id: string, request: ApiSchema<'AddTrackRequest'>) =>
    responseData(
      apiClient.post<ApiSchema<'TrackDtoApiResponse'>>(`/api/v1/timelines/${id}/tracks`, request),
    ),
  removeTrack: (id: string, trackId: string) =>
    apiClient.delete(`/api/v1/timelines/${id}/tracks/${trackId}`),
  reorderTrack: (id: string, request: ApiSchema<'ReorderTrackRequest'>) =>
    responseData(
      apiClient.put<ApiSchema<'ObjectApiResponse'>>(
        `/api/v1/timelines/${id}/tracks/reorder`,
        request,
      ),
    ),
  addClip: (id: string, request: ApiSchema<'AddClipRequest'>) =>
    responseData(
      apiClient.post<ApiSchema<'ClipDtoApiResponse'>>(`/api/v1/timelines/${id}/clips`, request),
    ),
  updateClip: (id: string, clipId: string, request: ApiSchema<'UpdateClipRequest'>) =>
    responseData(
      apiClient.put<ApiSchema<'ClipDtoApiResponse'>>(
        `/api/v1/timelines/${id}/clips/${clipId}`,
        request,
      ),
    ),
  moveClip: (id: string, clipId: string, request: ApiSchema<'MoveClipRequest'>) =>
    responseData(
      apiClient.put<ApiSchema<'ClipDtoApiResponse'>>(
        `/api/v1/timelines/${id}/clips/${clipId}/move`,
        request,
      ),
    ),
  resizeClip: (id: string, clipId: string, request: ApiSchema<'ResizeClipRequest'>) =>
    responseData(
      apiClient.put<ApiSchema<'ClipDtoApiResponse'>>(
        `/api/v1/timelines/${id}/clips/${clipId}/resize`,
        request,
      ),
    ),
  removeClip: (id: string, clipId: string) =>
    apiClient.delete(`/api/v1/timelines/${id}/clips/${clipId}`),
};
