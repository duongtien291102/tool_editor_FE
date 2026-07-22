import React, { useEffect, useState } from 'react';
import { EditorLayout } from '@/layouts/EditorLayout';
import { ThemeProvider } from '@/core/theme/ThemeProvider';
import { Toaster } from 'sonner';
import { appLogger } from '@/core/logger';
import { panelRegistry } from '@/core/plugin/PanelRegistry';
import { useTranslation } from 'react-i18next';

import { ProjectExplorer } from '@/features/project-explorer';
import { ScriptEditorPanel } from '@/features/script-editor';
import { AuthProvider, LoginPage, useAuth } from '@/features/auth';
import { MediaBrowser } from '@/features/media-browser';

const AppBootstrap: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isReady, setIsReady] = useState(false);
  const { t } = useTranslation('common');

  useEffect(() => {
    appLogger.info('Bootstrapping application...');

    panelRegistry.register({
      id: 'MediaBrowser',
      title: 'Media',
      component: <MediaBrowser />,
    });
    panelRegistry.register({
      id: 'ProjectExplorer',
      title: t('panels.projectExplorer', 'Project Explorer'),
      component: <ProjectExplorer />,
    });
    panelRegistry.register({
      id: 'ScriptEditor',
      title: t('panels.scriptEditor', 'Script Editor'),
      component: <ScriptEditorPanel />,
    });
    panelRegistry.register({
      id: 'Preview',
      title: t('panels.preview', 'Preview'),
      component: (
        <div className="bg-black flex items-center justify-center h-full text-white">
          Preview (Mock from Registry)
        </div>
      ),
    });
    panelRegistry.register({
      id: 'Timeline',
      title: t('panels.timeline', 'Timeline'),
      component: (
        <div className="p-4 h-full text-sm border-t border-border/50">
          Timeline (Mock from Registry)
        </div>
      ),
    });
    panelRegistry.register({
      id: 'Properties',
      title: t('panels.properties', 'Properties'),
      component: <div className="p-4 h-full text-sm">Properties (Mock from Registry)</div>,
    });

    appLogger.info('App is ready');
    setIsReady(true);

    return () => {
      panelRegistry.unregister('ProjectExplorer');
      panelRegistry.unregister('MediaBrowser');
      panelRegistry.unregister('ScriptEditor');
      panelRegistry.unregister('Preview');
      panelRegistry.unregister('Timeline');
      panelRegistry.unregister('Properties');
    };
  }, []);

  if (!isReady)
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background text-foreground">
        Loading...
      </div>
    );

  return <>{children}</>;
};

const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ThemeProvider>
      <AuthProvider>
        {children}
        <Toaster position="bottom-right" theme="system" />
      </AuthProvider>
    </ThemeProvider>
  );
};

const AppRouter: React.FC = () => {
  const { user, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background text-foreground">
        Restoring session...
      </div>
    );
  }
  if (!user) return <LoginPage />;
  return <EditorLayout />;
};

function App() {
  return (
    <AppBootstrap>
      <AppProviders>
        <AppRouter />
      </AppProviders>
    </AppBootstrap>
  );
}

export default App;
