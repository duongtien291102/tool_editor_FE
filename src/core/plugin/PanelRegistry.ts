import type { ReactNode } from 'react';

export interface PanelDefinition {
  id: string;
  title: string;
  icon?: string;
  component: string | ReactNode;
  defaultSize?: number;
  minSize?: number;
  closable?: boolean;
  movable?: boolean;
  plugin?: string;
  category?: string;
}

class PanelRegistry {
  private panels: Map<string, PanelDefinition> = new Map();

  register(panel: PanelDefinition) {
    if (this.panels.has(panel.id)) {
      // eslint-disable-next-line no-console
      console.warn(`Panel ID ${panel.id} is already registered.`);
      return;
    }
    this.panels.set(panel.id, panel);
  }

  getPanel(id: string): PanelDefinition | undefined {
    return this.panels.get(id);
  }

  unregister(id: string): boolean {
    return this.panels.delete(id);
  }

  getAllPanels(): PanelDefinition[] {
    return Array.from(this.panels.values());
  }
}

export const panelRegistry = new PanelRegistry();
