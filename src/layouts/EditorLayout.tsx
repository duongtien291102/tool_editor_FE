import React, { useEffect, useState } from 'react';
import { WorkspaceHeader } from '@/features/workspace';
import { Layout, Model, TabNode, type IJsonModel } from 'flexlayout-react';
import 'flexlayout-react/style/dark.css';
import { useTranslation } from 'react-i18next';
import { panelRegistry } from '@/core/plugin/PanelRegistry';
import { defaultLayoutStorage } from '@/layouts/LayoutStorage';
import { GlobalErrorBoundary } from '@/components/ui/GlobalErrorBoundary';
import { ProjectExplorer } from '@/features/project-explorer';
import { MediaBrowser } from '@/features/media-browser';
import { ScriptEditorPanel } from '@/features/script-editor';
import { TimelinePanel } from '@/features/timeline';
import { GenerateScriptPanel } from '@/features/ai-tools';

// Register core studio panels in panel registry
panelRegistry.register({
  id: 'ProjectExplorer',
  title: 'Project Explorer',
  component: <ProjectExplorer />,
});

panelRegistry.register({
  id: 'MediaBrowser',
  title: 'Media',
  component: <MediaBrowser />,
});

panelRegistry.register({
  id: 'ScriptEditor',
  title: 'Script Editor',
  component: <ScriptEditorPanel />,
});

panelRegistry.register({
  id: 'Timeline',
  title: 'Timeline',
  component: <TimelinePanel />,
});

panelRegistry.register({
  id: 'GenerateScript',
  title: 'Generate Script',
  component: <GenerateScriptPanel />,
});

panelRegistry.register({
  id: 'Preview',
  title: 'Preview',
  component: (
    <div className="p-4 text-xs text-muted-foreground flex items-center justify-center h-full bg-panel">
      Canvas Preview Window
    </div>
  ),
});

panelRegistry.register({
  id: 'Properties',
  title: 'Properties',
  component: (
    <div className="p-4 text-xs text-muted-foreground flex items-center justify-center h-full bg-panel">
      Properties Panel
    </div>
  ),
});

const getDefaultLayout = (t: (key: string) => string): IJsonModel => ({
  global: {
    tabEnableClose: true,
  },
  layout: {
    type: 'row',
    weight: 100,
    children: [
      {
        type: 'tabset',
        weight: 25,
        children: [
          { type: 'tab', name: 'Generate Script', component: 'GenerateScript' },
          { type: 'tab', name: t('panels.projectExplorer'), component: 'ProjectExplorer' },
          { type: 'tab', name: 'Media', component: 'MediaBrowser' },
        ],
      },
      {
        type: 'row',
        weight: 55,
        children: [
          {
            type: 'tabset',
            weight: 60,
            children: [
              { type: 'tab', name: t('panels.preview'), component: 'Preview' },
              { type: 'tab', name: t('panels.scriptEditor'), component: 'ScriptEditor' },
            ],
          },
          {
            type: 'tabset',
            weight: 40,
            children: [{ type: 'tab', name: t('panels.timeline'), component: 'Timeline' }],
          },
        ],
      },
      {
        type: 'tabset',
        weight: 20,
        children: [{ type: 'tab', name: t('panels.properties'), component: 'Properties' }],
      },
    ],
  },
});

export const EditorLayout: React.FC = () => {
  const { t } = useTranslation('common');
  const [model, setModel] = useState<Model | null>(null);

  useEffect(() => {
    setModel(Model.fromJson(getDefaultLayout(t)));
  }, [t]);

  const onModelChange = (newModel: Model) => {
    defaultLayoutStorage.save(newModel.toJson());
  };

  const factory = (node: TabNode) => {
    const componentId = node.getComponent();
    if (!componentId) return null;

    const panelDef = panelRegistry.getPanel(componentId);

    if (panelDef) {
      return (
        <GlobalErrorBoundary>
          {typeof panelDef.component === 'string' ? (
            <div>{panelDef.component}</div>
          ) : (
            panelDef.component
          )}
        </GlobalErrorBoundary>
      );
    }

    return (
      <div className="p-4 flex items-center justify-center text-muted-foreground text-sm h-full bg-panel">
        {t('errors.panelNotFound', { componentId })}
      </div>
    );
  };

  if (!model) return null;

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-background text-foreground">
      <WorkspaceHeader />

      <main className="flex-1 relative">
        <Layout model={model} factory={factory} onModelChange={onModelChange} />
      </main>

      <footer className="h-6 bg-accent border-t border-border flex items-center px-2 text-[10px] text-muted-foreground shrink-0 justify-between select-none">
        <div>{t('status.ready')}</div>
      </footer>
    </div>
  );
};
