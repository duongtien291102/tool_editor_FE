import { Plus, ZoomIn, ZoomOut } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/core/utils/cn';
import { useStudioStore } from '@/state/studioStore';
import { useProductionFlowStore } from '@/features/workflow';
import { importPexelsAsset } from '@/lib/pexels';
import {
  EMPTY_PRODUCTION_SCENES,
  type ProjectTimelineClip,
  addMediaAssetToProjectTimeline,
  buildTimelineFromScenes,
  formatTime,
} from '../utils/editorUtils';

export function TimelineShell({ projectId }: { projectId: string }) {
  const { t } = useTranslation('editor');
  const editor = useStudioStore((state) => state.editor);
  const setEditor = useStudioStore((state) => state.setEditor);
  const [customVideoTracks, setCustomVideoTracks] = useState<
    Array<{ id: string; label: string; name: string; clips: ProjectTimelineClip[] }>
  >([]);
  const [customAudioTracks, setCustomAudioTracks] = useState<
    Array<{ id: string; label: string; name: string; clips: ProjectTimelineClip[] }>
  >([]);

  const scenes = useProductionFlowStore(
    (state) => state.projects[projectId]?.scenes ?? EMPTY_PRODUCTION_SCENES,
  );
  const timeline = useMemo(() => buildTimelineFromScenes(scenes), [scenes]);
  const rulerStep = Math.max(5, Math.ceil(timeline.totalSeconds / 50) * 5);
  const rulerMarks = Array.from(
    { length: Math.max(2, Math.ceil(timeline.totalSeconds / rulerStep) + 1) },
    (_, index) => Math.min(index * rulerStep, timeline.totalSeconds),
  );
  const timelineRows = [...timeline.rows, ...customVideoTracks, ...customAudioTracks];

  const handleAddVideoTrack = () => {
    const nextNum = customVideoTracks.length + 2;
    setCustomVideoTracks((prev) => [
      ...prev,
      {
        id: `v-track-${nextNum}`,
        label: `V${nextNum}`,
        name: `Video Track ${nextNum}`,
        clips: [],
      },
    ]);
    useStudioStore.getState().notify(`Đã tạo dòng mới: Video Track V${nextNum}`);
  };

  const handleAddAudioTrack = () => {
    const nextNum = customAudioTracks.length + 2;
    setCustomAudioTracks((prev) => [
      ...prev,
      {
        id: `a-track-${nextNum}`,
        label: `A${nextNum}`,
        name: `Audio Track ${nextNum}`,
        clips: [],
      },
    ]);
    useStudioStore.getState().notify(`Đã tạo dòng mới: Audio Track A${nextNum}`);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    interface DropPayload {
      id?: string;
      name?: string;
      thumbnailUrl?: string;
      contentUrl?: string;
      pexelsId?: string | number;
      kind?: 'photo' | 'video';
    }
    try {
      const jsonStr = event.dataTransfer.getData('application/json');
      if (!jsonStr) return;
      const payload = JSON.parse(jsonStr) as DropPayload;

      if (payload.id && payload.name) {
        addMediaAssetToProjectTimeline(
          projectId,
          payload.name,
          payload.id,
          payload.thumbnailUrl ?? payload.contentUrl,
        );
      } else if (payload.pexelsId) {
        const workspaceId = useStudioStore.getState().currentWorkspaceId;
        const pexelsId = Number(payload.pexelsId);
        if (workspaceId && projectId) {
          void importPexelsAsset({
            workspaceId,
            projectId,
            mediaType: payload.kind ?? 'photo',
            pexelsId,
          }).then((imported) => {
            useStudioStore.getState().addImportedStockAsset({
              assetId: imported.assetId,
              projectId: imported.projectId,
              mediaType: imported.mediaType,
              name: imported.name,
              contentUrl: imported.contentUrl,
              thumbnailUrl: imported.thumbnailUrl,
              sizeBytes: imported.sizeBytes,
              durationSeconds: imported.durationSeconds ?? 0,
              photographer: imported.photographer,
              sourceUrl: imported.pexelsUrl,
            });
            addMediaAssetToProjectTimeline(
              imported.projectId,
              imported.name,
              imported.assetId,
              imported.thumbnailUrl,
            );
          });
        }
      }
    } catch {
      // Ignored non-json drops
    }
  };

  return (
    <div
      className="min-h-0 border-t border-white/8 bg-[#111517]"
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
      }}
      onDrop={handleDrop}
    >
      <div className="flex h-10 items-center justify-between border-b border-white/8 px-3">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-zinc-200">{t('timeline.title')}</span>
          <div className="flex items-center gap-1.5 border-l border-white/10 pl-3">
            <button
              type="button"
              onClick={handleAddVideoTrack}
              className="flex items-center gap-1.5 rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium text-zinc-300 transition-colors hover:bg-white/10 hover:text-white"
              title="Tạo thêm dòng chứa Video/Hình ảnh"
            >
              <Plus className="size-3.5 text-zinc-400" /> Thêm dòng Video
            </button>
            <button
              type="button"
              onClick={handleAddAudioTrack}
              className="flex items-center gap-1.5 rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium text-zinc-300 transition-colors hover:bg-white/10 hover:text-white"
              title="Tạo thêm dòng chứa Âm thanh/Lời thoại"
            >
              <Plus className="size-3.5 text-zinc-400" /> Thêm dòng Audio
            </button>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button
            className="editor-icon"
            onClick={() => setEditor({ zoom: Math.max(0.5, editor.zoom - 0.25) })}
            aria-label={t('timeline.zoomOut')}
          >
            <ZoomOut className="size-3.5" />
          </button>
          <span className="w-10 text-center font-mono text-[10px] text-zinc-500">
            {Math.round(editor.zoom * 100)}%
          </span>
          <button
            className="editor-icon"
            onClick={() => setEditor({ zoom: Math.min(2, editor.zoom + 0.25) })}
            aria-label={t('timeline.zoomIn')}
          >
            <ZoomIn className="size-3.5" />
          </button>
        </div>
      </div>
      <div className="grid h-[calc(100%-2.5rem)] grid-cols-[112px_minmax(620px,1fr)] overflow-auto">
        <div className="sticky left-0 z-10 bg-[#111517] pt-7">
          {timelineRows.map((track) => (
            <div
              key={track.id}
              className="flex h-12 items-center gap-2 border-b border-r border-white/8 px-2"
            >
              <span className="w-6 font-mono text-[10px] text-zinc-500">{track.label}</span>
              <span className="truncate text-[10px] text-zinc-400">
                {track.name.startsWith('scene') ? t(`timeline.tracks.${track.name}`) : track.name}
              </span>
            </div>
          ))}
        </div>
        <div className="relative min-w-[700px] p-2 pt-0">
          <div className="flex h-7 items-center border-b border-white/8 font-mono text-[10px] text-zinc-500">
            {rulerMarks.map((seconds) => (
              <div key={seconds} className="flex-1">
                {formatTime(seconds).slice(3, 8)}
              </div>
            ))}
          </div>
          <div className="relative space-y-1 pt-1">
            {timelineRows.map((track) => (
              <div key={track.id} className="relative h-11 rounded-md bg-white/3">
                {track.clips.map((clip) => {
                  const isSelected = editor.selectedClipId === clip.id;
                  return (
                    <div
                      key={clip.id}
                      onClick={() => setEditor({ selectedClipId: clip.id })}
                      className={cn(
                        'absolute top-1 bottom-1 overflow-hidden rounded border px-2 text-[10px] cursor-pointer transition-all',
                        clip.type === 'visual'
                          ? 'border-[#2d5160] bg-[#1a3440] text-cyan-200 hover:bg-[#20404f]'
                          : 'border-[#305342] bg-[#1a382b] text-emerald-200 hover:bg-[#204535]',
                        isSelected && 'ring-2 ring-primary ring-offset-1 ring-offset-[#111517]',
                      )}
                      style={{
                        left: `${clip.left}%`,
                        width: `${Math.max(4, clip.width)}%`,
                      }}
                    >
                      <p className="font-semibold truncate">{clip.name}</p>
                      <p className="truncate text-[9px] opacity-70">{clip.content}</p>
                    </div>
                  );
                })}
              </div>
            ))}
            <div
              className="absolute top-0 bottom-0 z-20 w-0.5 bg-cyan-400 pointer-events-none"
              style={{
                left: `${
                  timeline.totalSeconds > 0 ? (editor.playhead / timeline.totalSeconds) * 100 : 0
                }%`,
              }}
            >
              <div className="size-2 -translate-x-[3px] rotate-45 bg-cyan-400" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
