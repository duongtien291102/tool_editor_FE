import { ExportApi, RenderApi, TimelineApi } from '@/api';
import { getApiError } from '@/api/httpClient';
import { useTimelineStore } from '@/features/timeline';
import { persistTimelineDocumentToBackend } from '@/services/aiTimelineSyncService';

export interface QueuedVideoExport {
  exportId: string;
  renderJobId: string;
  timelineId: string;
}

export interface ProjectVideoExportOptions {
  frameRate: number;
  aspectRatio: string;
  projectName: string;
}

function requireId(id: string | null | undefined, resource: string): string {
  if (!id) throw new Error(`${resource} did not return an id.`);
  return id;
}

function resolutionForAspectRatio(aspectRatio: string): [number, number] {
  if (aspectRatio === '9:16') return [1080, 1920];
  if (aspectRatio === '1:1') return [1080, 1080];
  if (aspectRatio === '4:5') return [1080, 1350];
  return [1920, 1080];
}

async function ensureProjectTimeline(
  projectId: string,
  options: ProjectVideoExportOptions,
) {
  try {
    return await TimelineApi.getByProject(projectId);
  } catch (error) {
    if (getApiError(error).status !== 404) throw error;
    const [resolutionWidth, resolutionHeight] = resolutionForAspectRatio(options.aspectRatio);
    return TimelineApi.create({
      projectId,
      name: `${options.projectName} - Main Timeline`,
      frameRate: options.frameRate,
      resolutionWidth,
      resolutionHeight,
    });
  }
}

export async function queueProjectVideoExport(
  projectId: string,
  options: ProjectVideoExportOptions,
): Promise<QueuedVideoExport> {
  const timelineResponse = await ensureProjectTimeline(projectId, options);
  const timelineId = requireId(timelineResponse.data?.id, 'Timeline');

  // Persist current frontend timeline document to Backend MongoDB before creating export job
  const doc = useTimelineStore.getState().document;
  if (doc) {
    await persistTimelineDocumentToBackend(projectId, doc);
  }

  const renderListResponse = await RenderApi.listByProject(projectId, {
    page: 1,
    pageSize: 20,
  });
  const matchingRender = renderListResponse.data?.items?.find((item) => item.id);

  let renderJobId = matchingRender?.id;
  if (!renderJobId) {
    const renderResponse = await RenderApi.create({
      projectId,
      timelineId,
      jobType: 0,
      provider: 0,
      priority: 1,
      maxRetryCount: 3,
    });
    renderJobId = requireId(renderResponse.data?.id, 'Render job');
  }

  const exportResponse = await ExportApi.create({
    projectId,
    timelineId,
    renderJobId,
    videoCodec: 0,
    audioCodec: 0,
    container: 0,
    maxRetryCount: 3,
  });

  return {
    exportId: requireId(exportResponse.data?.id, 'Export job'),
    renderJobId,
    timelineId,
  };
}
