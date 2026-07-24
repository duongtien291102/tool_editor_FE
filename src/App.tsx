import React, { useEffect, useState } from 'react';
import { EditorLayout } from '@/layouts/EditorLayout';
import { ThemeProvider } from '@/core/theme/ThemeProvider';
import { Toaster } from 'sonner';
import { appLogger } from '@/core/logger';
import { panelRegistry } from '@/core/plugin/PanelRegistry';
import { useTranslation } from 'react-i18next';

import {
  ProjectExplorer,
  DashboardPage,
  ProjectListPage,
  ProjectDetailPage,
} from '@/features/project-explorer';
import { ScriptEditorPanel } from '@/features/script-editor';
import {
  AuthProvider,
  LoginPage,
  RegisterPage,
  ForgotPasswordPage,
  useAuth,
} from '@/features/auth';
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
          Preview Engine (Active)
        </div>
      ),
    });
    panelRegistry.register({
      id: 'Timeline',
      title: t('panels.timeline', 'Timeline'),
      component: (
        <div className="p-4 h-full text-sm border-t border-border/50">
          Timeline Editor Engine (Active)
        </div>
      ),
    });
    panelRegistry.register({
      id: 'Properties',
      title: t('panels.properties', 'Properties'),
      component: <div className="p-4 h-full text-sm">Properties Inspector</div>,
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
  }, [t]);

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

type ViewState =
  | 'LOGIN'
  | 'REGISTER'
  | 'FORGOT_PASSWORD'
  | 'DASHBOARD'
  | 'PROJECT_LIST'
  | 'PROJECT_DETAIL'
  | 'EDITOR';

const AppRouter: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [currentView, setCurrentView] = useState<ViewState>('DASHBOARD');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background text-foreground">
        Restoring session...
      </div>
    );
  }

  if (!user) {
    if (currentView === 'REGISTER') {
      return <RegisterPage onNavigateToLogin={() => setCurrentView('LOGIN')} />;
    }
    if (currentView === 'FORGOT_PASSWORD') {
      return <ForgotPasswordPage onNavigateToLogin={() => setCurrentView('LOGIN')} />;
    }
    return <LoginPage />;
  }

  if (currentView === 'DASHBOARD') {
    return (
      <DashboardPage
        onNavigateToProjects={() => setCurrentView('PROJECT_LIST')}
        onNavigateToAiStudio={() => setCurrentView('EDITOR')}
        onNavigateToExport={() => setCurrentView('EDITOR')}
      />
    );
  }

  if (currentView === 'PROJECT_LIST') {
    return (
      <ProjectListPage
        onSelectProject={(id) => {
          setSelectedProjectId(id);
          setCurrentView('PROJECT_DETAIL');
        }}
      />
    );
  }

  if (currentView === 'PROJECT_DETAIL' && selectedProjectId) {
    return (
      <ProjectDetailPage
        projectId={selectedProjectId}
        onBack={() => setCurrentView('PROJECT_LIST')}
        onNavigateToTimeline={() => setCurrentView('EDITOR')}
      />
    );
  }

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
