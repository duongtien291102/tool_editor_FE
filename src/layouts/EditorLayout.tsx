import React, { useEffect, useState, useRef } from 'react';
import { WorkspaceHeader } from '@/features/workspace';
import { Layout, Model, TabNode, type IJsonModel } from 'flexlayout-react';
import 'flexlayout-react/style/dark.css';
import { useTranslation } from 'react-i18next';
import { panelRegistry } from '@/core/plugin/PanelRegistry';
import { defaultLayoutStorage } from '@/layouts/LayoutStorage';
import { GlobalErrorBoundary } from '@/components/ui/GlobalErrorBoundary';

const getDefaultLayout = (t: (key: string) => string): IJsonModel => ({
  global: {
    tabEnableClose: true
  },
  layout: {
    type: "row",
    weight: 100,
    children: [
      {
        type: "tabset",
        weight: 20,
        children: [
          { type: "tab", name: t('panels.projectExplorer'), component: "ProjectExplorer" },
        ]
      },
      {
        type: "column",
        weight: 60,
        children: [
          {
            type: "tabset",
            weight: 60,
            children: [
              { type: "tab", name: t('panels.preview'), component: "Preview" },
              { type: "tab", name: t('panels.scriptEditor'), component: "ScriptEditor" }
            ]
          },
          {
            type: "tabset",
            weight: 40,
            children: [
              { type: "tab", name: t('panels.timeline'), component: "Timeline" }
            ]
          }
        ]
      },
      {
        type: "tabset",
        weight: 20,
        children: [
          { type: "tab", name: t('panels.properties'), component: "Properties" }
        ]
      }
    ]
  }
});

export const EditorLayout: React.FC = () => {
  const { t } = useTranslation('common');
  const [model, setModel] = useState<Model | null>(null);
  const layoutRef = useRef<any>(null);

  useEffect(() => {
    // Force recreate model on translation change or first load
    // Normally you'd merge translations, but for simplicity we reload default if no save
    // To ensure new panel appears, we will use default layout for this sprint
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
          {typeof panelDef.component === 'string' ? <div>{panelDef.component}</div> : panelDef.component}
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
        <Layout 
          ref={layoutRef}
          model={model} 
          factory={factory} 
          onModelChange={onModelChange}
        />
      </main>
      
      <footer className="h-6 bg-accent border-t border-border flex items-center px-2 text-[10px] text-muted-foreground shrink-0 justify-between select-none">
        <div>{t('status.ready')}</div>
      </footer>
    </div>
  );
};
