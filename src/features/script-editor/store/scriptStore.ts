import { create } from 'zustand';
import { scriptService } from '../services/ScriptService';
import { type Script, type ScriptSummary, SaveStatus, type ICommand } from '../types';
import { AutoSaveManager } from './AutoSaveManager';

class UpdateScriptCommand implements ICommand {
  id = Math.random().toString(36).slice(2, 11);
  private readonly previous: Script;
  private readonly next: Script;
  private readonly apply: (script: Script) => void;

  constructor(previous: Script, next: Script, apply: (script: Script) => void) {
    this.previous = previous;
    this.next = next;
    this.apply = apply;
  }

  execute() {
    this.apply(this.next);
  }
  undo() {
    this.apply(this.previous);
  }
}

interface ScriptState {
  scripts: ScriptSummary[];
  script: Script | null;
  projectId: string | null;
  status: SaveStatus;
  loading: boolean;
  error: string | null;
  conflict: string | null;
  activeSceneId: string | null;
  pastCommands: ICommand[];
  futureCommands: ICommand[];
  fetchProjectScripts: (projectId: string) => Promise<void>;
  openScript: (id: string) => Promise<void>;
  createScript: (name: string) => Promise<void>;
  renameScript: (name: string) => Promise<void>;
  deleteScript: () => Promise<void>;
  addScene: (name: string) => Promise<void>;
  deleteScene: (sceneId: string) => Promise<void>;
  reorderScene: (sceneId: string, newOrder: number) => Promise<void>;
  addElement: (sceneId: string) => Promise<void>;
  deleteElement: (sceneId: string, elementId: string) => Promise<void>;
  setActiveScene: (sceneId: string) => void;
  updateScript: (newScript: Script) => void;
  undo: () => void;
  redo: () => void;
  setStatus: (status: SaveStatus) => void;
}

let autoSaveManager: AutoSaveManager | null = null;

export const useScriptStore = create<ScriptState>((set, get) => {
  const setLoadedScript = (script: Script | null) =>
    set((state) => ({
      script,
      activeSceneId: script?.scenes.some((scene) => scene.id === state.activeSceneId)
        ? state.activeSceneId
        : (script?.scenes[0]?.id ?? null),
      pastCommands: [],
      futureCommands: [],
      status: SaveStatus.Saved,
      error: null,
      conflict: null,
    }));

  const ensureAutoSave = () => {
    if (autoSaveManager) return autoSaveManager;
    autoSaveManager = new AutoSaveManager(
      scriptService,
      (status) => set({ status }),
      (saved, submitted) =>
        set((state) =>
          state.script?.id === submitted.id
            ? {
                script: { ...state.script, version: saved.version, updatedAt: saved.updatedAt },
                error: null,
                conflict: null,
              }
            : {},
        ),
      (message) => {
        set({ conflict: message, error: message });
        void scriptService
          .reload()
          .then((latest) => setLoadedScript(latest))
          .then(() => set({ conflict: message, error: message, status: SaveStatus.Error }));
      },
    );
    return autoSaveManager;
  };

  const executeMutation = async (mutation: () => Promise<Script>) => {
    set({ loading: true, error: null, conflict: null });
    try {
      await ensureAutoSave().flush();
      const script = await mutation();
      setLoadedScript(script);
      set({ loading: false });
    } catch (error: unknown) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : 'Script operation failed.',
        status: SaveStatus.Error,
      });
    }
  };

  return {
    scripts: [],
    script: null,
    projectId: null,
    status: SaveStatus.Saved,
    loading: false,
    error: null,
    conflict: null,
    activeSceneId: null,
    pastCommands: [],
    futureCommands: [],

    setStatus: (status) => set({ status }),

    fetchProjectScripts: async (projectId) => {
      autoSaveManager?.cancel();
      set({
        loading: true,
        projectId,
        error: null,
        conflict: null,
        script: null,
        activeSceneId: null,
      });
      try {
        const scripts = await scriptService.listScripts(projectId);
        const script = scripts[0] ? await scriptService.getScript(scripts[0].id) : null;
        set({ scripts, loading: false });
        setLoadedScript(script);
        ensureAutoSave();
      } catch (error: unknown) {
        set({
          loading: false,
          error: error instanceof Error ? error.message : 'Unable to load scripts.',
        });
      }
    },

    openScript: async (id) => {
      autoSaveManager?.cancel();
      set({ loading: true, error: null, conflict: null });
      try {
        setLoadedScript(await scriptService.getScript(id));
        set({ loading: false });
      } catch (error: unknown) {
        set({
          loading: false,
          error: error instanceof Error ? error.message : 'Unable to open script.',
        });
      }
    },

    createScript: async (name) => {
      const projectId = get().projectId;
      if (!projectId) return;
      set({ loading: true, error: null });
      try {
        const script = await scriptService.createScript(projectId, name);
        set((state) => ({
          scripts: [
            { id: script.id, title: script.title, version: script.version },
            ...state.scripts,
          ],
          loading: false,
        }));
        setLoadedScript(script);
        ensureAutoSave();
      } catch (error: unknown) {
        set({
          loading: false,
          error: error instanceof Error ? error.message : 'Unable to create script.',
        });
      }
    },

    renameScript: async (name) =>
      executeMutation(async () => {
        const script = await scriptService.renameScript(name);
        set((state) => ({
          scripts: state.scripts.map((item) =>
            item.id === script.id
              ? { ...item, title: script.title, version: script.version }
              : item,
          ),
        }));
        return script;
      }),

    deleteScript: async () => {
      const id = get().script?.id;
      if (!id) return;
      set({ loading: true, error: null });
      try {
        autoSaveManager?.cancel();
        await scriptService.deleteScript();
        set((state) => ({
          scripts: state.scripts.filter((item) => item.id !== id),
          script: null,
          activeSceneId: null,
          loading: false,
          pastCommands: [],
          futureCommands: [],
        }));
      } catch (error: unknown) {
        set({
          loading: false,
          error: error instanceof Error ? error.message : 'Unable to delete script.',
        });
      }
    },

    addScene: async (name) => executeMutation(() => scriptService.addScene(name)),
    deleteScene: async (sceneId) => executeMutation(() => scriptService.deleteScene(sceneId)),
    reorderScene: async (sceneId, newOrder) =>
      executeMutation(() => scriptService.reorderScene(sceneId, newOrder)),
    addElement: async (sceneId) => executeMutation(() => scriptService.addElement(sceneId)),
    deleteElement: async (sceneId, elementId) =>
      executeMutation(() => scriptService.deleteElement(sceneId, elementId)),

    setActiveScene: (sceneId) => set({ activeSceneId: sceneId }),

    updateScript: (newScript) => {
      const { script, pastCommands } = get();
      if (!script) return;
      const command = new UpdateScriptCommand(script, newScript, (value) => set({ script: value }));
      command.execute();
      set({ pastCommands: [...pastCommands, command], futureCommands: [], conflict: null });
      ensureAutoSave().scheduleSave(newScript);
    },

    undo: () => {
      const { pastCommands, futureCommands } = get();
      const command = pastCommands.at(-1);
      if (!command) return;
      command.undo();
      set({
        pastCommands: pastCommands.slice(0, -1),
        futureCommands: [command, ...futureCommands],
      });
      const script = get().script;
      if (script) ensureAutoSave().scheduleSave(script);
    },

    redo: () => {
      const { pastCommands, futureCommands } = get();
      const command = futureCommands[0];
      if (!command) return;
      command.execute();
      set({ pastCommands: [...pastCommands, command], futureCommands: futureCommands.slice(1) });
      const script = get().script;
      if (script) ensureAutoSave().scheduleSave(script);
    },
  };
});
