import { apiClient, responseData } from '@/api/httpClient';

interface ApiEnvelope<T> {
  success: boolean;
  message?: string;
  data: T;
}

interface VoiceScene {
  id: string;
  narration: string;
}

interface VoiceGenerationStatus {
  jobId: string;
  status: string;
  progress: number;
  audioUrl?: string | null;
  errorMessage?: string | null;
  durationSeconds?: number | null;
}

interface VoiceHistoryEntry extends VoiceGenerationStatus {
  projectId: string;
  sceneId?: string | null;
  text: string;
  voiceId: string;
  provider: string;
  blobPath?: string | null;
}

interface StorageDownloadUrl {
  downloadUrl: string;
}

export interface VoicePreparationProgress {
  ready: number;
  total: number;
  status: 'loading' | 'generating' | 'ready';
  sceneId?: string;
}

export interface VoicePreparationResult {
  audioUrls: Record<string, string>;
  durationSecondsByScene: Record<string, number>;
}

interface CachedAudio {
  url: string;
  durationSeconds?: number;
}

const audioCache = new Map<string, CachedAudio>();
const activePreparations = new Map<string, Promise<VoicePreparationResult>>();

function audioCacheKey(projectId: string, scene: VoiceScene): string {
  return `${projectId}:${scene.id}:${scene.narration.trim()}`;
}

function preparationKey(projectId: string, scenes: VoiceScene[]): string {
  return `${projectId}:${scenes.map((scene) => `${scene.id}:${scene.narration.trim()}`).join('|')}`;
}

async function readCompletedHistory(projectId: string): Promise<VoiceHistoryEntry[]> {
  const envelope = await responseData(
    apiClient.get<ApiEnvelope<VoiceHistoryEntry[]>>(
      `/api/v1/projects/${encodeURIComponent(projectId)}/voice-generation/history`,
      { params: { page: 1, pageSize: 100, status: 'Completed' } },
    ),
  );

  if (!envelope.success) {
    throw new Error(envelope.message || 'Không thể đọc lịch sử giọng đọc.');
  }

  return envelope.data;
}

async function getFreshAudioUrl(entry: VoiceHistoryEntry): Promise<string | null> {
  if (entry.blobPath) {
    try {
      const response = await responseData(
        apiClient.get<StorageDownloadUrl>('/api/v1/storage/download-url', {
          params: { path: entry.blobPath },
        }),
      );
      if (response.downloadUrl) return response.downloadUrl;
    } catch {
      // Fall back to the job URL; it may still be valid.
    }
  }

  return entry.audioUrl ?? null;
}

async function readAudioDuration(audioUrl: string): Promise<number | undefined> {
  return new Promise((resolve) => {
    const audio = document.createElement('audio');
    let timeout = 0;
    const finish = (duration?: number) => {
      window.clearTimeout(timeout);
      audio.onloadedmetadata = null;
      audio.onerror = null;
      audio.removeAttribute('src');
      audio.load();
      resolve(duration);
    };
    timeout = window.setTimeout(() => finish(), 10_000);

    audio.preload = 'metadata';
    audio.onloadedmetadata = () =>
      finish(Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration : undefined);
    audio.onerror = () => finish();
    audio.src = audioUrl;
  });
}

async function resolveAudioDuration(
  audioUrl: string,
  reportedDuration?: number | null,
): Promise<number | undefined> {
  if (reportedDuration && reportedDuration > 0) return reportedDuration;
  return readAudioDuration(audioUrl);
}

async function createVoiceJob(
  projectId: string,
  scene: VoiceScene,
): Promise<VoiceGenerationStatus> {
  const envelope = await responseData(
    apiClient.post<ApiEnvelope<VoiceGenerationStatus>>(
      `/api/v1/projects/${encodeURIComponent(projectId)}/voice-generation`,
      {
        text: scene.narration.trim(),
        voiceId: 'NF',
        language: 'vi',
        provider: 'LocalVtts',
        speed: 1,
        stability: 0.5,
        similarityBoost: 0.75,
        sceneId: scene.id,
      },
    ),
  );

  if (!envelope.success) {
    throw new Error(envelope.message || `Không thể tạo giọng đọc cho cảnh ${scene.id}.`);
  }

  return envelope.data;
}

async function pollVoiceJob(jobId: string): Promise<VoiceGenerationStatus> {
  for (let attempt = 0; attempt < 120; attempt += 1) {
    await new Promise((resolve) => window.setTimeout(resolve, 1500));
    const envelope = await responseData(
      apiClient.get<ApiEnvelope<VoiceGenerationStatus>>(
        `/api/v1/voice-generation/${encodeURIComponent(jobId)}`,
      ),
    );

    if (!envelope.success) {
      throw new Error(envelope.message || 'Không thể đọc trạng thái tạo giọng đọc.');
    }

    const job = envelope.data;
    const normalizedStatus = job.status.toLowerCase();
    if (normalizedStatus === 'failed' || job.errorMessage) {
      throw new Error(job.errorMessage || 'Tạo giọng đọc thất bại.');
    }
    if (normalizedStatus === 'completed' && job.audioUrl) return job;
  }

  throw new Error('Hết thời gian chờ tạo giọng đọc.');
}

export function prepareProjectVoicePlayback(
  projectId: string,
  sourceScenes: VoiceScene[],
  onProgress?: (progress: VoicePreparationProgress) => void,
): Promise<VoicePreparationResult> {
  const scenes = sourceScenes.filter((scene) => scene.narration.trim().length > 0);
  const key = preparationKey(projectId, scenes);
  const active = activePreparations.get(key);
  if (active) return active;

  const preparation = (async () => {
    const urls: Record<string, string> = {};
    const durationSecondsByScene: Record<string, number> = {};
    let ready = 0;
    onProgress?.({ ready, total: scenes.length, status: 'loading' });

    const unresolvedScenes: VoiceScene[] = [];
    for (const scene of scenes) {
      const cachedAudio = audioCache.get(audioCacheKey(projectId, scene));
      if (cachedAudio) {
        urls[scene.id] = cachedAudio.url;
        if (cachedAudio.durationSeconds) {
          durationSecondsByScene[scene.id] = cachedAudio.durationSeconds;
        }
        ready += 1;
      } else {
        unresolvedScenes.push(scene);
      }
    }

    let history: VoiceHistoryEntry[] = [];
    if (unresolvedScenes.length > 0) {
      history = await readCompletedHistory(projectId);
    }

    const missingScenes: VoiceScene[] = [];
    for (const scene of unresolvedScenes) {
      const matchingEntry = history.find(
        (entry) =>
          entry.provider.toLowerCase() === 'localvtts' &&
          entry.voiceId === 'NF' &&
          (entry.sceneId === scene.id || entry.text.trim() === scene.narration.trim()),
      );
      const existingUrl = matchingEntry ? await getFreshAudioUrl(matchingEntry) : null;

      if (existingUrl) {
        const durationSeconds = await resolveAudioDuration(
          existingUrl,
          matchingEntry?.durationSeconds,
        );
        urls[scene.id] = existingUrl;
        if (durationSeconds) durationSecondsByScene[scene.id] = durationSeconds;
        audioCache.set(audioCacheKey(projectId, scene), {
          url: existingUrl,
          durationSeconds,
        });
        ready += 1;
        onProgress?.({ ready, total: scenes.length, status: 'loading', sceneId: scene.id });
      } else {
        missingScenes.push(scene);
      }
    }

    const queuedJobs: Array<{ scene: VoiceScene; job: VoiceGenerationStatus }> = [];
    for (const scene of missingScenes) {
      const job = await createVoiceJob(projectId, scene);
      queuedJobs.push({ scene, job });
      onProgress?.({ ready, total: scenes.length, status: 'generating', sceneId: scene.id });
    }

    // RenderWorker processes the queue sequentially, so polling in queue order avoids
    // multiplying status requests and tripping the API rate limiter.
    for (const { scene, job } of queuedJobs) {
      const completed = await pollVoiceJob(job.jobId);
      const url = completed.audioUrl;
      if (!url) throw new Error(`Cảnh ${scene.id} hoàn thành nhưng không trả về audioUrl.`);

      const durationSeconds = await resolveAudioDuration(url, completed.durationSeconds);
      urls[scene.id] = url;
      if (durationSeconds) durationSecondsByScene[scene.id] = durationSeconds;
      audioCache.set(audioCacheKey(projectId, scene), { url, durationSeconds });
      ready += 1;
      onProgress?.({ ready, total: scenes.length, status: 'generating', sceneId: scene.id });
    }

    onProgress?.({ ready, total: scenes.length, status: 'ready' });
    return { audioUrls: urls, durationSecondsByScene };
  })();

  activePreparations.set(key, preparation);
  void preparation.then(
    () => activePreparations.delete(key),
    () => activePreparations.delete(key),
  );
  return preparation;
}
