import { create } from 'zustand';
import { type Script, SaveStatus, type ICommand } from '../types';
import { scriptService } from '../services/ScriptService';
import { AutoSaveManager } from './AutoSaveManager';

class UpdateScriptCommand implements ICommand {
  id = Math.random().toString(36).substr(2, 9);
  private prev: Script;
  private next: Script;
  private apply: (s: Script) => void;

  constructor(prev: Script, next: Script, apply: (s: Script) => void) {
    this.prev = prev;
    this.next = next;
    this.apply = apply;
  }

  execute() { this.apply(this.next); }
  undo() { this.apply(this.prev); }
}

interface ScriptState {
  script: Script | null;
  status: SaveStatus;
  loading: boolean;
  activeSceneId: string | null;
  
  // Undo / Redo
  pastCommands: ICommand[];
  futureCommands: ICommand[];

  // Actions
  fetchScript: (projectId: string) => Promise<void>;
  setActiveScene: (sceneId: string) => void;
  updateScript: (newScript: Script) => void;
  undo: () => void;
  redo: () => void;
  setStatus: (status: SaveStatus) => void;
}

let autoSaveManager: AutoSaveManager | null = null;

export const useScriptStore = create<ScriptState>((set, get) => ({
  script: null,
  status: SaveStatus.Saved,
  loading: false,
  activeSceneId: null,
  pastCommands: [],
  futureCommands: [],

  setStatus: (status) => set({ status }),

  fetchScript: async (projectId) => {
    set({ loading: true });
    const script = await scriptService.getScript(projectId);
    
    // Initialize AutoSaveManager if not exists
    if (!autoSaveManager) {
      autoSaveManager = new AutoSaveManager(scriptService, get().setStatus);
    }
    
    set({ 
      script, 
      loading: false, 
      status: SaveStatus.Saved,
      activeSceneId: script.scenes[0]?.id || null,
      pastCommands: [],
      futureCommands: []
    });
  },

  setActiveScene: (sceneId) => set({ activeSceneId: sceneId }),

  updateScript: (newScript) => {
    const { script, pastCommands } = get();
    if (!script) return;

    const applyChange = (s: Script) => set({ script: s });
    
    const command = new UpdateScriptCommand(script, newScript, applyChange);
    
    // Execute command
    command.execute();
    
    set({
      pastCommands: [...pastCommands, command],
      futureCommands: [] // Clear future when new action occurs
    });

    // Trigger auto save
    autoSaveManager?.scheduleSave(newScript);
  },

  undo: () => {
    const { pastCommands, futureCommands } = get();
    if (pastCommands.length === 0) return;

    const commandToUndo = pastCommands[pastCommands.length - 1];
    commandToUndo.undo();

    set({
      pastCommands: pastCommands.slice(0, -1),
      futureCommands: [commandToUndo, ...futureCommands]
    });

    autoSaveManager?.scheduleSave(get().script!);
  },

  redo: () => {
    const { pastCommands, futureCommands } = get();
    if (futureCommands.length === 0) return;

    const commandToRedo = futureCommands[0];
    commandToRedo.execute();

    set({
      pastCommands: [...pastCommands, commandToRedo],
      futureCommands: futureCommands.slice(1)
    });

    autoSaveManager?.scheduleSave(get().script!);
  }
}));
