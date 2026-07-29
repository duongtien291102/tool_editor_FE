import { Clapperboard, Pause, Play, RotateCcw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/core/utils/cn';
import { type ProjectRecord, useStudioStore } from '@/state/studioStore';
import { useProductionFlowStore } from '@/features/workflow';
import { EMPTY_PRODUCTION_SCENES, formatTime, isImageUrl } from '../utils/editorUtils';

export function PreviewCanvas({
  project,
  projectId,
  playhead,
}: {
  project: ProjectRecord;
  projectId: string;
  playhead: number;
}) {
  const { t } = useTranslation('editor');
  const [playing, setPlaying] = useState(false);
  const [showPromptText, setShowPromptText] = useState(false);
  const setEditor = useStudioStore((state) => state.setEditor);
  const scenes = useProductionFlowStore(
    (state) => state.projects[projectId]?.scenes ?? EMPTY_PRODUCTION_SCENES,
  );
  const activeScene =
    scenes.length > 0 ? scenes[Math.min(scenes.length - 1, Math.floor(playhead / 5))] : undefined;
  const totalSeconds = Math.max(5, scenes.length * 5);

  useEffect(() => {
    if (!playing) return;

    const rafRef = { current: 0 };
    let previousTimestamp = performance.now();
    const advancePlayback = (timestamp: number) => {
      const elapsedSeconds = (timestamp - previousTimestamp) / 1000;
      previousTimestamp = timestamp;
      const currentPlayhead = useStudioStore.getState().editor.playhead;
      const nextPlayhead = currentPlayhead + elapsedSeconds;

      if (nextPlayhead >= totalSeconds) {
        setEditor({ playhead: totalSeconds });
        setPlaying(false);
        return;
      }

      setEditor({ playhead: nextPlayhead });
      rafRef.current = window.requestAnimationFrame(advancePlayback);
    };

    rafRef.current = window.requestAnimationFrame(advancePlayback);
    return () => window.cancelAnimationFrame(rafRef.current);
  }, [playing, setEditor, totalSeconds]);

  const togglePlayback = () => {
    if (!playing && playhead >= totalSeconds) {
      setEditor({ playhead: 0 });
    }
    setPlaying((current) => !current);
  };

  return (
    <div className="relative flex min-h-0 flex-col items-center justify-center bg-[#090b0c] p-4">
      {/* Video Canvas Frame */}
      <div
        className={cn(
          'relative overflow-hidden rounded-lg border border-white/10 bg-[#151a1d] shadow-2xl shadow-black/60',
          project.aspectRatio === '9:16'
            ? 'h-[75%] aspect-[9/16]'
            : project.aspectRatio === '1:1'
              ? 'h-[70%] aspect-square'
              : 'w-[75%] aspect-video',
        )}
      >
        {/* Background image or video backdrop */}
        {isImageUrl(activeScene?.visual) ? (
          <img
            src={activeScene.visual}
            alt={activeScene.title}
            className="absolute inset-0 size-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(56,189,248,0.12),transparent_60%),linear-gradient(180deg,#182025,#0d1113)]" />
        )}

        {/* Top Bar inside Canvas: Scene Badge & Prompt Toggle */}
        <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between p-3 bg-gradient-to-b from-black/70 via-black/30 to-transparent pointer-events-auto">
          <div className="flex items-center gap-2 rounded-md border border-white/10 bg-black/50 px-2.5 py-1 text-xs font-semibold text-zinc-200 backdrop-blur-md">
            <Clapperboard className="size-3.5 text-primary" />
            <span>{activeScene?.title ?? t('timeline.emptyTitle')}</span>
          </div>

          {activeScene?.visual && !isImageUrl(activeScene.visual) && (
            <button
              type="button"
              onClick={() => setShowPromptText((prev) => !prev)}
              className="rounded-md border border-white/10 bg-black/50 px-2.5 py-1 text-[11px] font-medium text-zinc-300 backdrop-blur-md transition-colors hover:bg-white/15 hover:text-white"
            >
              {showPromptText ? 'Ẩn prompt bối cảnh' : '🎨 Prompt bối cảnh'}
            </button>
          )}
        </div>

        {/* Prompt details popup if open */}
        {showPromptText && activeScene?.visual && !isImageUrl(activeScene.visual) && (
          <div className="absolute right-3 top-12 z-30 max-w-[280px] rounded-lg border border-white/15 bg-black/90 p-3 text-xs text-zinc-300 shadow-2xl backdrop-blur-md">
            <p className="mb-1 font-semibold text-primary">Mô tả bối cảnh hình ảnh (AI Prompt):</p>
            <p className="line-clamp-6 text-[11px] leading-relaxed text-zinc-300">
              {activeScene.visual}
            </p>
          </div>
        )}

        {/* Center Big Play/Pause Button - Hides during playback */}
        {!playing && (
          <div className="absolute inset-0 z-20 grid place-items-center bg-black/25 backdrop-blur-[2px] transition-all">
            <button
              className="group flex size-14 items-center justify-center rounded-full bg-primary/90 text-primary-foreground shadow-2xl transition-all hover:scale-110 hover:bg-primary"
              onClick={togglePlayback}
              aria-label={t('preview.play')}
            >
              <Play className="ml-0.5 size-6 fill-current transition-transform group-hover:scale-105" />
            </button>
          </div>
        )}

        {/* Bottom Subtitle / Dialogue Overlay */}
        <div className="absolute inset-x-0 bottom-4 z-20 flex flex-col items-center px-6 text-center pointer-events-none">
          {activeScene?.narration ? (
            <div className="max-w-[88%] rounded-lg border border-white/15 bg-black/80 px-4 py-2 shadow-2xl backdrop-blur-md">
              <p className="text-xs font-semibold leading-relaxed text-white drop-shadow">
                {activeScene.narration}
              </p>
            </div>
          ) : null}
        </div>
      </div>

      {/* Control Bar Docked BELOW Video Frame */}
      <div className="mt-3 flex w-[75%] items-center justify-between rounded-lg border border-white/10 bg-[#111517] px-3.5 py-1.5 shadow-lg">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setEditor({ playhead: 0 })}
            className="rounded-md p-1.5 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
            title="Về đầu video"
          >
            <RotateCcw className="size-4" />
          </button>
          <button
            type="button"
            onClick={togglePlayback}
            className={cn(
              'flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-semibold transition-all',
              playing
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30'
                : 'bg-primary text-primary-foreground hover:bg-primary/90',
            )}
          >
            {playing ? (
              <>
                <Pause className="size-3.5 fill-current" /> Tạm dừng
              </>
            ) : (
              <>
                <Play className="size-3.5 fill-current" /> Phát video
              </>
            )}
          </button>
        </div>

        <div className="font-mono text-xs font-semibold tracking-widest text-zinc-300">
          {formatTime(Math.min(playhead, totalSeconds))} / {formatTime(totalSeconds)}
        </div>
      </div>
    </div>
  );
}
