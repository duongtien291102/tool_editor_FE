import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ExportApi, RenderApi, TimelineApi } from '@/api';
import { ApiRequestError } from '@/api/httpClient';
import { queueProjectVideoExport } from './videoExportService';

vi.mock('@/api', () => ({
  ExportApi: { create: vi.fn() },
  RenderApi: { create: vi.fn(), listByProject: vi.fn() },
  TimelineApi: { create: vi.fn(), getByProject: vi.fn() },
}));

const options = { frameRate: 30, aspectRatio: '16:9', projectName: 'Demo' };

describe('queueProjectVideoExport', () => {
  beforeEach(() => vi.clearAllMocks());

  it('reuses an existing render job and queues an MP4 export', async () => {
    vi.mocked(TimelineApi.getByProject).mockResolvedValue({ data: { id: 'timeline-1' } });
    vi.mocked(RenderApi.listByProject).mockResolvedValue({
      data: { items: [{ id: 'render-1' }] },
    });
    vi.mocked(ExportApi.create).mockResolvedValue({ data: { id: 'export-1' } });

    await expect(queueProjectVideoExport('project-1', options)).resolves.toEqual({
      exportId: 'export-1',
      renderJobId: 'render-1',
      timelineId: 'timeline-1',
    });
    expect(RenderApi.create).not.toHaveBeenCalled();
    expect(ExportApi.create).toHaveBeenCalledWith(
      expect.objectContaining({
        projectId: 'project-1',
        timelineId: 'timeline-1',
        renderJobId: 'render-1',
        videoCodec: 0,
        audioCodec: 0,
        container: 0,
      }),
    );
  });

  it('creates a render job when the project has none', async () => {
    vi.mocked(TimelineApi.getByProject).mockResolvedValue({ data: { id: 'timeline-1' } });
    vi.mocked(RenderApi.listByProject).mockResolvedValue({ data: { items: [] } });
    vi.mocked(RenderApi.create).mockResolvedValue({ data: { id: 'render-new' } });
    vi.mocked(ExportApi.create).mockResolvedValue({ data: { id: 'export-1' } });

    await queueProjectVideoExport('project-1', options);

    expect(RenderApi.create).toHaveBeenCalledWith(
      expect.objectContaining({ projectId: 'project-1', timelineId: 'timeline-1' }),
    );
    expect(ExportApi.create).toHaveBeenCalledWith(
      expect.objectContaining({ renderJobId: 'render-new' }),
    );
  });

  it('creates the missing backend timeline before exporting', async () => {
    vi.mocked(TimelineApi.getByProject).mockRejectedValue(
      new ApiRequestError('Resource not found.', 404),
    );
    vi.mocked(TimelineApi.create).mockResolvedValue({ data: { id: 'timeline-new' } });
    vi.mocked(RenderApi.listByProject).mockResolvedValue({ data: { items: [] } });
    vi.mocked(RenderApi.create).mockResolvedValue({ data: { id: 'render-new' } });
    vi.mocked(ExportApi.create).mockResolvedValue({ data: { id: 'export-new' } });

    await queueProjectVideoExport('project-1', options);

    expect(TimelineApi.create).toHaveBeenCalledWith({
      projectId: 'project-1',
      name: 'Demo - Main Timeline',
      frameRate: 30,
      resolutionWidth: 1920,
      resolutionHeight: 1080,
    });
    expect(ExportApi.create).toHaveBeenCalledWith(
      expect.objectContaining({ timelineId: 'timeline-new' }),
    );
  });
});
