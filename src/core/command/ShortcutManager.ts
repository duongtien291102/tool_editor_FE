export interface ShortcutDefinition {
  keys: string[]; // e.g., ['Ctrl', 'Shift', 'P']
  commandId: string;
}

class ShortcutManager {
  private shortcuts: ShortcutDefinition[] = [];

  registerShortcut(shortcut: ShortcutDefinition) {
    this.shortcuts.push(shortcut);
  }

  // To be connected with React Hotkeys or global event listener
  handleKeyPress() {
    // TODO: match event to keys and execute commandRegistry.getCommand(commandId)?.action()
  }
}

export const shortcutManager = new ShortcutManager();
