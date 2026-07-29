import { GripVertical, ListPlus, Loader2, Plus, Save, Send, Sparkles, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { apiClient, getApiError, responseData } from '@/api/httpClient';
import { useProductionFlowStore } from '@/features/workflow';

interface ManualScene {
  id: string;
  title: string;
  narration: string;
  visual: string;
  source?: 'ai' | 'manual';
}

interface ManualScriptDraft {
  title: string;
  body: string;
  scenes: ManualScene[];
  updatedAt: string;
}

interface ScriptProposal {
  title: string;
  description: string;
  scenes: Array<{ title: string; narration: string; visual: string }>;
}

interface ScriptProposalResponse {
  scripts: ScriptProposal[];
}

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
}

const draftKey = (projectId: string) => `ai-studio-script:${projectId}`;

const emptyDraft = (projectName: string): ManualScriptDraft => ({
  title: `Kịch bản ${projectName}`,
  body: '',
  scenes: [],
  updatedAt: new Date().toISOString(),
});

function loadLegacyDraft(projectId: string, projectName: string): ManualScriptDraft {
  try {
    const stored = localStorage.getItem(draftKey(projectId));
    if (stored) return JSON.parse(stored) as ManualScriptDraft;
  } catch {
    // A malformed local draft should not prevent the editor from opening.
  }
  return emptyDraft(projectName);
}

export function ManualScriptWorkspace({
  projectId,
  projectName,
  onUseForGeneration,
}: {
  projectId: string;
  projectName: string;
  onUseForGeneration: (prompt: string) => void;
}) {
  const [draft, setDraft] = useState(() => emptyDraft(projectName));
  const [savedAt, setSavedAt] = useState(draft.updatedAt);
  const [proposals, setProposals] = useState<ScriptProposal[]>([]);
  const [generating, setGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [insertingAt, setInsertingAt] = useState<number | null>(null);
  const [sceneError, setSceneError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [persistenceError, setPersistenceError] = useState<string | null>(null);
  const [draggedSceneId, setDraggedSceneId] = useState<string | null>(null);
  const [sceneDropIndex, setSceneDropIndex] = useState<number | null>(null);
  const syncProductionScript = useProductionFlowStore((state) => state.syncScript);
  const markGenerationStarted = useProductionFlowStore((state) => state.markGenerationStarted);

  useEffect(() => {
    let active = true;
    setHydrated(false);
    setPersistenceError(null);
    const legacyDraft = loadLegacyDraft(projectId, projectName);
    setDraft(legacyDraft);
    void responseData(
      apiClient.get<ApiEnvelope<ManualScriptDraft>>(
        `/api/v1/generation/script-workspaces/${encodeURIComponent(projectId)}`,
      ),
    )
      .then((envelope) => {
        if (active && envelope.success && envelope.data) {
          setDraft({
            ...envelope.data,
            scenes: envelope.data.scenes.map((scene) => ({
              ...scene,
              source: scene.source ?? 'ai',
            })),
          });
          setSavedAt(envelope.data.updatedAt);
        }
      })
      .catch((error) => {
        const apiError = getApiError(error);
        if (active && apiError.status !== 404) setPersistenceError(apiError.message);
      })
      .finally(() => {
        if (active) setHydrated(true);
      });
    return () => {
      active = false;
    };
  }, [projectId, projectName]);

  useEffect(() => {
    if (!hydrated) return;
    const timer = window.setTimeout(() => {
      const next = { ...draft, updatedAt: new Date().toISOString() };
      void responseData(
        apiClient.put<ApiEnvelope<ManualScriptDraft>>(
          `/api/v1/generation/script-workspaces/${encodeURIComponent(projectId)}`,
          {
            title: next.title,
            body: next.body,
            scenes: next.scenes.map((scene) => ({
              ...scene,
              source: scene.source ?? 'ai',
            })),
          },
        ),
      )
        .then((envelope) => {
          if (envelope.success) {
            setSavedAt(envelope.data.updatedAt);
            setPersistenceError(null);
            localStorage.removeItem(draftKey(projectId));
          }
        })
        .catch((error) => setPersistenceError(getApiError(error).message));
    }, 500);
    return () => window.clearTimeout(timer);
  }, [draft, hydrated, projectId]);

  useEffect(() => {
    if (!hydrated) return;
    syncProductionScript(projectId, draft.body, draft.scenes);
  }, [draft.body, draft.scenes, hydrated, projectId, syncProductionScript]);

  const wordCount = useMemo(
    () => draft.body.trim().split(/\s+/).filter(Boolean).length,
    [draft.body],
  );

  const generateProposals = async () => {
    if (!draft.body.trim() || generating) return;
    setGenerating(true);
    setGenerationError(null);
    try {
      const envelope = await responseData(
        apiClient.post<ApiEnvelope<ScriptProposalResponse>>(
          '/api/v1/generation/script-drafts',
          { idea: draft.body.trim() },
          { timeout: 120_000 },
        ),
      );
      if (!envelope.success || !Array.isArray(envelope.data?.scripts)) {
        throw new Error(
          envelope.message || envelope.errors?.join(', ') || 'Gemini không trả về kịch bản.',
        );
      }
      const completeProposals = envelope.data.scripts.filter(
        (proposal) =>
          proposal.title?.trim() &&
          proposal.description?.trim() &&
          proposal.scenes?.length > 0 &&
          proposal.scenes.every(
            (scene) => scene.title?.trim() && scene.narration?.trim() && scene.visual?.trim(),
          ),
      );
      if (completeProposals.length === 0) {
        throw new Error('Gemini trả về kịch bản chưa đầy đủ. Vui lòng tạo lại.');
      }
      setProposals(completeProposals);
    } catch (error) {
      setGenerationError(getApiError(error).message);
    } finally {
      setGenerating(false);
    }
  };

  const chooseProposal = (proposal: ScriptProposal) => {
    setDraft((current) => ({
      ...current,
      title: proposal.title,
      scenes: proposal.scenes.map((scene) => ({
        id: crypto.randomUUID(),
        title: scene.title,
        narration: scene.narration,
        visual: scene.visual,
        source: 'ai',
      })),
    }));
  };

  const insertScene = async (insertAt: number) => {
    if (insertingAt !== null || !draft.body.trim()) return;
    setInsertingAt(insertAt);
    setSceneError(null);
    try {
      const envelope = await responseData(
        apiClient.post<ApiEnvelope<Omit<ManualScene, 'id'>>>(
          '/api/v1/generation/script-scenes',
          {
            idea: draft.body.trim(),
            insertAt,
            scenes: draft.scenes.map(({ title, narration, visual }) => ({
              title,
              narration,
              visual,
            })),
          },
          { timeout: 120_000 },
        ),
      );
      const scene = envelope.data;
      if (
        !envelope.success ||
        !scene?.title?.trim() ||
        !scene.narration?.trim() ||
        !scene.visual?.trim()
      ) {
        throw new Error(envelope.message || 'Gemini chưa tạo đủ nội dung cho cảnh mới.');
      }
      setDraft((current) => {
        const scenes = [...current.scenes];
        scenes.splice(insertAt, 0, { ...scene, id: crypto.randomUUID(), source: 'ai' });
        return { ...current, scenes };
      });
    } catch (error) {
      setSceneError(getApiError(error).message);
    } finally {
      setInsertingAt(null);
    }
  };

  const insertManualScene = (insertAt: number) => {
    setDraft((current) => {
      const scenes = [...current.scenes];
      scenes.splice(insertAt, 0, {
        id: crypto.randomUUID(),
        title: `Cảnh ${insertAt + 1}`,
        narration: '',
        visual: '',
        source: 'manual',
      });
      return { ...current, scenes };
    });
  };

  const updateScene = (id: string, changes: Partial<ManualScene>) =>
    setDraft((current) => ({
      ...current,
      scenes: current.scenes.map((scene) => (scene.id === id ? { ...scene, ...changes } : scene)),
    }));

  const moveScene = (sceneId: string, insertionIndex: number) => {
    setDraft((current) => {
      const sourceIndex = current.scenes.findIndex((scene) => scene.id === sceneId);
      if (sourceIndex < 0) return current;

      const scenes = [...current.scenes];
      const [movedScene] = scenes.splice(sourceIndex, 1);
      const targetIndex = Math.max(
        0,
        Math.min(insertionIndex > sourceIndex ? insertionIndex - 1 : insertionIndex, scenes.length),
      );

      if (targetIndex === sourceIndex) return current;
      scenes.splice(targetIndex, 0, movedScene);
      return { ...current, scenes };
    });
  };

  const finishSceneDrag = () => {
    setDraggedSceneId(null);
    setSceneDropIndex(null);
  };

  const generationPrompt = [
    `Tên dự án: ${projectName}`,
    `Tên kịch bản: ${draft.title}`,
    draft.body && `Kịch bản tổng:\n${draft.body}`,
    draft.scenes.length > 0 &&
      `Phân cảnh:\n${draft.scenes
        .map(
          (scene, index) =>
            `${index + 1}. ${scene.title}\nLời thoại/giọng đọc: ${scene.narration || 'Không có'}\nMô tả hình ảnh: ${scene.visual || 'Tự đề xuất theo nội dung'}`,
        )
        .join('\n\n')}`,
  ]
    .filter(Boolean)
    .join('\n\n');

  return (
    <div className="flex min-h-0 flex-1 bg-[#0d1012] text-zinc-200">
      <aside className="hidden w-72 shrink-0 border-r border-white/8 bg-[#111517] xl:flex xl:flex-col">
        <div className="border-b border-white/8 p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-400">
            Kịch bản dự án
          </p>
          <input
            value={draft.title}
            onChange={(event) => setDraft({ ...draft, title: event.target.value })}
            className="mt-2 w-full bg-transparent text-base font-semibold text-zinc-100 outline-none"
            aria-label="Tên kịch bản"
          />
          <p className="mt-2 text-[11px] leading-relaxed text-zinc-500">
            Tự động lưu trên thiết bị theo từng project.
          </p>
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Danh sách cảnh</span>
            <span className="font-mono text-[10px] text-zinc-600">{draft.scenes.length}</span>
          </div>
          <div
            className="space-y-1"
            onDragOver={(event) => {
              if (!draggedSceneId) return;
              event.preventDefault();
              if (event.target === event.currentTarget) {
                setSceneDropIndex(draft.scenes.length);
              }
            }}
            onDrop={(event) => {
              if (!draggedSceneId || sceneDropIndex === null) return;
              event.preventDefault();
              moveScene(draggedSceneId, sceneDropIndex);
              finishSceneDrag();
            }}
          >
            {draft.scenes.map((scene, index) => (
              <a
                key={scene.id}
                href={`#scene-${scene.id}`}
                draggable
                aria-label={`Cảnh ${index + 1}: ${scene.title}. Giữ và kéo để đổi vị trí.`}
                onDragStart={(event) => {
                  event.dataTransfer.effectAllowed = 'move';
                  event.dataTransfer.setData('text/plain', scene.id);
                  setDraggedSceneId(scene.id);
                  setSceneDropIndex(index);
                }}
                onDragOver={(event) => {
                  if (!draggedSceneId) return;
                  event.preventDefault();
                  event.dataTransfer.dropEffect = 'move';
                  const bounds = event.currentTarget.getBoundingClientRect();
                  setSceneDropIndex(
                    index + (event.clientY >= bounds.top + bounds.height / 2 ? 1 : 0),
                  );
                }}
                onDrop={(event) => {
                  if (!draggedSceneId || sceneDropIndex === null) return;
                  event.preventDefault();
                  event.stopPropagation();
                  moveScene(draggedSceneId, sceneDropIndex);
                  finishSceneDrag();
                }}
                onDragEnd={finishSceneDrag}
                onKeyDown={(event) => {
                  if (!event.altKey) return;
                  if (event.key === 'ArrowUp' && index > 0) {
                    event.preventDefault();
                    moveScene(scene.id, index - 1);
                  }
                  if (event.key === 'ArrowDown' && index < draft.scenes.length - 1) {
                    event.preventDefault();
                    moveScene(scene.id, index + 2);
                  }
                }}
                className={`group relative flex cursor-grab items-center gap-2 rounded-md border px-2 py-2 transition-[border-color,background-color,opacity,transform] hover:border-white/10 hover:bg-white/[0.03] active:cursor-grabbing ${
                  draggedSceneId === scene.id
                    ? 'scale-[0.98] border-cyan-500/40 bg-cyan-500/[0.06] opacity-45'
                    : 'border-transparent'
                } ${
                  sceneDropIndex === index && draggedSceneId !== scene.id
                    ? 'before:absolute before:-top-[3px] before:left-1 before:right-1 before:h-0.5 before:rounded-full before:bg-cyan-400'
                    : ''
                } ${
                  sceneDropIndex === index + 1 && index === draft.scenes.length - 1
                    ? 'after:absolute after:-bottom-[3px] after:left-1 after:right-1 after:h-0.5 after:rounded-full after:bg-cyan-400'
                    : ''
                }`}
              >
                <GripVertical
                  aria-hidden="true"
                  className="size-3.5 shrink-0 text-zinc-700 transition-colors group-hover:text-zinc-500"
                />
                <span className="min-w-0 flex-1">
                  <span className="block text-[10px] text-zinc-600">CẢNH {index + 1}</span>
                  <span className="mt-0.5 block truncate text-xs text-zinc-300">{scene.title}</span>
                </span>
              </a>
            ))}
            {draft.scenes.length === 0 && (
              <p className="rounded-lg border border-dashed border-white/10 p-4 text-center text-xs leading-relaxed text-zinc-600">
                Nhập ý tưởng rồi để Gemini đề xuất kịch bản.
              </p>
            )}
          </div>
        </div>
      </aside>

      <main className="min-w-0 flex-1 overflow-y-auto">
        <div className="sticky top-0 z-10 flex min-h-12 items-center gap-2 border-b border-white/8 bg-[#0d1012]/95 px-4 backdrop-blur">
          <div className="mr-auto flex items-center gap-2 text-[11px] text-zinc-500">
            <Save className="size-3.5" />
            {!hydrated
              ? 'Đang tải kịch bản...'
              : persistenceError
                ? 'Chưa thể lưu vào database'
                : `Đã lưu database ${new Date(savedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => void generateProposals()}
            disabled={!draft.body.trim() || generating}
          >
            {generating ? (
              <Loader2 className="mr-2 size-3.5 animate-spin" />
            ) : (
              <Sparkles className="mr-2 size-3.5" />
            )}
            {generating ? 'Gemini đang viết...' : 'Gemini tạo kịch bản'}
          </Button>
          <Button
            size="sm"
            disabled={!draft.body.trim() && draft.scenes.length === 0}
            onClick={() => {
              markGenerationStarted(projectId);
              onUseForGeneration(generationPrompt);
            }}
          >
            <Send className="mr-2 size-3.5" />
            Dùng để tạo video
          </Button>
        </div>

        <div className="mx-auto max-w-4xl px-5 py-8 lg:px-10">
          <section>
            <div className="mb-3 flex items-end justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
                  Ý tưởng đầu vào
                </p>
                <h1 className="mt-1 text-xl font-semibold tracking-tight text-zinc-100">
                  Bạn muốn làm video về điều gì?
                </h1>
              </div>
              <span className="font-mono text-[10px] text-zinc-600">{wordCount} từ</span>
            </div>
            <textarea
              value={draft.body}
              onChange={(event) => setDraft({ ...draft, body: event.target.value })}
              placeholder="Ví dụ: Video quảng cáo 15 giây về một chú mèo đánh đàn, phong cách sang trọng và hài hước..."
              className="min-h-72 w-full resize-y rounded-xl border border-white/10 bg-[#111517] p-5 text-[15px] leading-7 text-zinc-200 outline-none transition-colors placeholder:text-zinc-700 focus:border-cyan-500/60"
            />
          </section>

          {(generating || generationError || proposals.length > 0) && (
            <section className="mt-8 border-t border-white/8 pt-8">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-400">
                Đề xuất từ Gemini
              </p>
              <h2 className="mt-1 text-lg font-semibold text-zinc-100">
                Chọn một phương án để chỉnh sửa
              </h2>
              {generating && (
                <div className="mt-5 flex items-center gap-3 rounded-xl border border-cyan-500/20 bg-cyan-500/[0.04] p-4 text-sm text-zinc-400">
                  <Loader2 className="size-4 animate-spin text-cyan-400" />
                  Gemini đang phát triển ba hướng kịch bản khác nhau…
                </div>
              )}
              {generationError && (
                <div
                  role="alert"
                  className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300"
                >
                  {generationError}
                </div>
              )}
              {!generating && proposals.length > 0 && (
                <div className="mt-5 grid gap-3 lg:grid-cols-3">
                  {proposals.map((proposal, index) => (
                    <button
                      type="button"
                      key={`${proposal.title}-${index}`}
                      onClick={() => chooseProposal(proposal)}
                      className="rounded-xl border border-white/8 bg-[#111517] p-4 text-left transition-colors hover:border-cyan-500/50 hover:bg-cyan-500/[0.03]"
                    >
                      <span className="font-mono text-[10px] text-cyan-400">
                        PHƯƠNG ÁN {index + 1}
                      </span>
                      <strong className="mt-2 block text-sm text-zinc-100">{proposal.title}</strong>
                      <span className="mt-2 block text-xs leading-5 text-zinc-500">
                        {proposal.description}
                      </span>
                      <span className="mt-4 block text-[10px] font-medium text-zinc-600">
                        {proposal.scenes.length} cảnh · Chọn để chỉnh sửa
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </section>
          )}

          <section className="mt-10 border-t border-white/8 pt-8">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
                  Storyboard
                </p>
                <h2 className="mt-1 text-lg font-semibold text-zinc-100">Chi tiết từng cảnh</h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={insertingAt !== null || !draft.body.trim()}
                  onClick={() => void insertScene(draft.scenes.length)}
                  className="flex items-center gap-2 rounded-md border border-cyan-500/30 px-3 py-1.5 text-xs font-medium text-cyan-400 hover:bg-cyan-500/10 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {insertingAt === draft.scenes.length ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="size-3.5" />
                  )}
                  AI tạo cảnh
                </button>
                <button
                  type="button"
                  disabled={insertingAt !== null}
                  onClick={() => insertManualScene(draft.scenes.length)}
                  className="flex items-center gap-2 rounded-md border border-white/10 px-3 py-1.5 text-xs font-medium text-zinc-400 hover:bg-white/5 hover:text-zinc-200 disabled:opacity-40"
                >
                  <Plus className="size-3.5" />
                  Tự nhập cảnh
                </button>
              </div>
            </div>
            <p className="mt-2 text-xs text-zinc-600">
              Gemini giữ lời thoại nhất quán · Bạn có thể tinh chỉnh mô tả hình ảnh
            </p>
            {sceneError && (
              <div
                role="alert"
                className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300"
              >
                {sceneError}
              </div>
            )}
            <div className="mt-5 space-y-4">
              {draft.scenes.map((scene, index) => (
                <div key={scene.id}>
                  <article
                    id={`scene-${scene.id}`}
                    className="scroll-mt-16 rounded-xl border border-white/8 bg-[#111517] p-4"
                  >
                    <div className="flex items-center gap-3 border-b border-white/8 pb-3">
                      <span className="font-mono text-[10px] text-cyan-400">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      {scene.source === 'manual' ? (
                        <input
                          value={scene.title}
                          onChange={(event) => updateScene(scene.id, { title: event.target.value })}
                          className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-zinc-100 outline-none focus:text-cyan-300"
                          aria-label={`Tên cảnh ${index + 1}`}
                        />
                      ) : (
                        <span className="min-w-0 flex-1 text-sm font-semibold text-zinc-100">
                          {scene.title}
                        </span>
                      )}
                      <button
                        type="button"
                        aria-label={`Xóa cảnh ${index + 1}`}
                        className="rounded p-1.5 text-zinc-600 hover:bg-red-500/10 hover:text-red-400"
                        onClick={() =>
                          setDraft((current) => ({
                            ...current,
                            scenes: current.scenes.filter((item) => item.id !== scene.id),
                          }))
                        }
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                        Lời thoại / giọng đọc
                        <textarea
                          value={scene.narration}
                          readOnly={scene.source !== 'manual'}
                          aria-readonly={scene.source !== 'manual'}
                          onChange={(event) =>
                            scene.source === 'manual' &&
                            updateScene(scene.id, { narration: event.target.value })
                          }
                          rows={5}
                          placeholder={
                            scene.source === 'manual'
                              ? 'Nhập lời thoại hoặc lời dẫn cho cảnh...'
                              : undefined
                          }
                          className={`mt-2 w-full resize-y rounded-lg border border-white/8 p-3 text-xs font-normal normal-case leading-5 tracking-normal outline-none ${
                            scene.source === 'manual'
                              ? 'bg-black/20 text-zinc-300 focus:border-cyan-500/50'
                              : 'bg-black/10 text-zinc-400'
                          }`}
                        />
                      </label>
                      <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                        Mô tả hình ảnh
                        <textarea
                          value={scene.visual}
                          onChange={(event) =>
                            updateScene(scene.id, { visual: event.target.value })
                          }
                          rows={5}
                          placeholder="Bối cảnh, nhân vật, góc máy, ánh sáng..."
                          className="mt-2 w-full resize-y rounded-lg border border-white/8 bg-black/20 p-3 text-xs font-normal normal-case leading-5 tracking-normal text-zinc-300 outline-none placeholder:text-zinc-700 focus:border-cyan-500/50"
                        />
                      </label>
                    </div>
                  </article>
                  <div className="flex justify-center py-2">
                    <div className="flex items-center gap-1 rounded-full border border-white/8 bg-[#0d1012] p-1">
                      <button
                        type="button"
                        disabled={insertingAt !== null}
                        onClick={() => void insertScene(index + 1)}
                        className="flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-medium text-cyan-500 hover:bg-cyan-500/10 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {insertingAt === index + 1 ? (
                          <Loader2 className="size-3 animate-spin" />
                        ) : (
                          <Sparkles className="size-3" />
                        )}
                        AI chèn cảnh
                      </button>
                      <button
                        type="button"
                        disabled={insertingAt !== null}
                        onClick={() => insertManualScene(index + 1)}
                        className="flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-medium text-zinc-500 hover:bg-white/5 hover:text-zinc-300 disabled:opacity-40"
                      >
                        <ListPlus className="size-3" />
                        Tự nhập
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
