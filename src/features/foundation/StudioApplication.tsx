import {
  Archive,
  ArrowLeft,
  Boxes,
  BriefcaseBusiness,
  Check,
  ChevronDown,
  CircleUserRound,
  Clapperboard,
  Clock3,
  CreditCard,
  Download,
  Film,
  FileText,
  Folder,
  FolderOpen,
  Gauge,
  Grid2X2,
  House,
  Image as ImageIcon,
  Layers3,
  LayoutDashboard,
  List,
  LogOut,
  Menu as MenuIcon,
  Music2,
  PanelLeftClose,
  PanelRight,
  Pause,
  Play,
  Plus,
  Redo2,
  RefreshCw,
  Search,
  Settings,
  Sparkles,
  ShieldCheck,
  Upload,
  Video,
  Volume2,
  WandSparkles,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import {
  Component,
  type ErrorInfo,
  type FormEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Button } from '@/components/ui/Button';
import {
  Card,
  DataTable,
  Dialog,
  EmptyState,
  Input,
  LoadingState,
  Progress,
  ToastMessage,
} from '@/components/ui/Foundation';
import {
  type AssetKind,
  type JobStatus,
  type ProjectRecord,
  type ProjectStatus,
  type ProviderRecord,
  useStudioStore,
} from '@/state/studioStore';
import { apiClient, getApiError, responseData } from '@/api/httpClient';
import { ExportApi } from '@/api/ExportApi';
import type { ApiSchema } from '@/api/types';
import { cn } from '@/core/utils/cn';
import { appLogger } from '@/core/logger';
import { WorkflowPanel, useProductionFlowStore, type ProductionScene } from '@/features/workflow';
import {
  AssetVersionPanel,
  assetPipelineTypes,
  matchesAssetFilters,
  type AssetPipelineType,
} from '@/features/asset-pipeline';
import { AiProvidersScreen } from '@/features/ai-providers';
import { CommercialScreen, type CommercialTab } from '@/features/commercial';
import { GenerationScreen } from '@/features/generation';
import { LoginPage, useAuth } from '@/features/auth';
import { AdminConsoleScreen, type AdminTab } from '@/features/admin';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { PexelsLibrary } from '@/features/pexels';
import { ManualScriptWorkspace } from '@/features/script-editor';
import {
  DEFAULT_SCENE_DURATION_SECONDS,
  EditorAssets as ProjectEditorAssets,
  getMinimumSceneDuration,
  getSceneDuration,
  isImageUrl,
  prepareProjectVoicePlayback,
  queueProjectVideoExport,
  roundSceneDuration,
} from '@/features/editor';
import { useTimelineStore } from '@/features/timeline';

type Route =
  | { name: 'login' }
  | { name: 'dashboard' }
  | { name: 'workspaces' }
  | { name: 'project'; projectId: string }
  | { name: 'editor'; projectId: string }
  | { name: 'assets' }
  | { name: 'jobs' }
  | { name: 'renders' }
  | { name: 'providers' }
  | { name: 'commercial'; tab?: CommercialTab }
  | { name: 'generation'; tab?: 'wizard' | 'history' }
  | { name: 'admin'; tab?: AdminTab }
  | { name: 'settings' }
  | { name: 'unauthorized' }
  | { name: 'forbidden' }
  | { name: 'not-found' };

function parseRoute(pathname: string): Route {
  const parts = pathname.split('/').filter(Boolean);
  if (parts.length === 0) return { name: 'dashboard' };
  if (parts[0] === 'login') return { name: 'login' };
  if (parts[0] === 'dashboard') return { name: 'dashboard' };
  if (parts[0] === 'workspaces') return { name: 'workspaces' };
  if (parts[0] === 'assets') return { name: 'assets' };
  if (parts[0] === 'jobs') return { name: 'jobs' };
  if (parts[0] === 'renders') return { name: 'renders' };
  if (parts[0] === 'providers') return { name: 'providers' };
  if (
    [
      'commercial',
      'billing',
      'profile',
      'subscription',
      'credits',
      'pricing',
      'invoices',
      'usage',
    ].includes(parts[0])
  ) {
    const tabMap: Record<string, CommercialTab> = {
      commercial: 'profile',
      billing: 'subscription',
      profile: 'profile',
      subscription: 'subscription',
      credits: 'credits',
      pricing: 'pricing',
      invoices: 'invoices',
      usage: 'usage',
    };
    return { name: 'commercial', tab: tabMap[parts[0]] || 'profile' };
  }
  if (['generation', 'wizard', 'history'].includes(parts[0])) {
    const tab = parts[0] === 'history' ? 'history' : 'wizard';
    return { name: 'generation', tab };
  }
  if (parts[0] === 'admin') return { name: 'admin' };
  if (parts[0] === 'settings') return { name: 'settings' };
  if (parts[0] === 'unauthorized') return { name: 'unauthorized' };
  if (parts[0] === 'forbidden') return { name: 'forbidden' };
  if (parts[0] === 'projects' && parts[1] && parts[2] === 'editor') {
    return { name: 'editor', projectId: parts[1] };
  }
  if (parts[0] === 'projects' && parts[1]) return { name: 'project', projectId: parts[1] };
  return { name: 'not-found' };
}

function useRoute() {
  const [route, setRoute] = useState<Route>(() => parseRoute(window.location.pathname));
  useEffect(() => {
    const onPop = () => setRoute(parseRoute(window.location.pathname));
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);
  const navigate = (path: string, replace = false) => {
    window.history[replace ? 'replaceState' : 'pushState']({}, '', path);
    setRoute(parseRoute(path));
    window.scrollTo({ top: 0, behavior: 'instant' });
  };
  return { route, navigate };
}

class ScreenErrorBoundary extends Component<
  { children: ReactNode; onReset: () => void },
  { failed: boolean; errorId: string; errorMessage: string }
> {
  state = { failed: false, errorId: '', errorMessage: '' };
  static getDerivedStateFromError(error: Error) {
    const errorId = `err-${Math.random().toString(36).substring(2, 9)}-${Date.now()}`;
    return {
      failed: true,
      errorId,
      errorMessage: error.message || 'An unexpected rendering error occurred.',
    };
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    appLogger.error('Screen rendering failed', { error, componentStack: info.componentStack });
  }
  render() {
    if (this.state.failed) {
      return (
        <div className="grid min-h-screen place-items-center p-6 bg-slate-950 text-white text-center">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-md w-full space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 grid place-items-center mx-auto text-xl font-bold">
              ⚠️
            </div>
            <h2 className="text-xl font-bold">Screen Display Error</h2>
            <p className="text-xs text-slate-400">{this.state.errorMessage}</p>
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-left text-[11px] font-mono text-slate-400 flex justify-between items-center">
              <span className="truncate">Correlation ID: {this.state.errorId}</span>
              <button
                onClick={() => {
                  void navigator.clipboard.writeText(this.state.errorId);
                }}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-indigo-400 rounded font-semibold text-[10px] ml-2 shrink-0"
              >
                Copy ID
              </button>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  this.setState({ failed: false });
                  this.props.onReset();
                }}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow"
              >
                🔄 Retry & Reload View
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export function StudioApplication() {
  const { route, navigate } = useRoute();
  const { user: authenticatedUser, isLoading } = useAuth();
  const replaceServerCatalog = useStudioStore((state) => state.replaceServerCatalog);
  const toast = useStudioStore((state) => state.ui.toast);
  const clearToast = useStudioStore((state) => state.clearToast);

  useEffect(() => {
    useStudioStore.setState({
      user: authenticatedUser
        ? {
            id: authenticatedUser.id,
            name: authenticatedUser.username,
            email: authenticatedUser.email,
            role: 'Owner',
          }
        : null,
    });
  }, [authenticatedUser]);

  useEffect(() => {
    if (!authenticatedUser) return;
    let active = true;
    void Promise.all([
      responseData(
        apiClient.get<{
          data: Array<{ id: string; name: string; ownerId: string; createdAt: string }>;
        }>('/api/v1/workspaces'),
      ),
      responseData(
        apiClient.get<{
          data: {
            items: Array<{
              id: string;
              name: string;
              description?: string;
              status: string;
              updatedAt?: string;
              createdAt: string;
            }>;
          };
        }>('/api/v1/projects'),
      ),
      responseData(
        apiClient.get<{
          data: Array<{
            id: ProviderRecord['id'];
            name: string;
            category: string;
            status: ProviderRecord['status'];
            capabilities: string[];
          }>;
        }>('/api/v1/ai/providers'),
      ),
    ])
      .then(([workspaceEnvelope, projectEnvelope, providerEnvelope]) => {
        if (!active) return;
        const workspaces = workspaceEnvelope.data ?? [];
        const defaultWorkspaceId = workspaces[0]?.id ?? '';
        replaceServerCatalog({
          workspaces,
          projects: (projectEnvelope.data?.items ?? []).map((project) => ({
            id: project.id,
            workspaceId: defaultWorkspaceId,
            name: project.name,
            description: project.description ?? '',
            aspectRatio: '16:9',
            frameRate: 30,
            status: project.status as ProjectStatus,
            updatedAt: project.updatedAt ?? project.createdAt,
          })),
          providers: providerEnvelope.data ?? [],
        });
      })
      .catch((error) => {
        useStudioStore.getState().notify(getApiError(error).message);
      });
    return () => {
      active = false;
    };
  }, [authenticatedUser, replaceServerCatalog]);

  useEffect(() => {
    if (!authenticatedUser && route.name !== 'login') navigate('/login', true);
    if (authenticatedUser && route.name === 'login') navigate('/dashboard', true);
  }, [authenticatedUser, route.name]);

  if (isLoading) return null;
  if (!authenticatedUser) return <LoginPage />;

  return (
    <ScreenErrorBoundary onReset={() => navigate('/dashboard')}>
      <AppShell route={route} navigate={navigate}>
        <RouteScreen route={route} navigate={navigate} />
      </AppShell>
      {toast && <ToastMessage message={toast} onClose={clearToast} />}
    </ScreenErrorBoundary>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
        <Clapperboard className="size-4" />
      </div>
      <span className="font-semibold tracking-tight">AI Studio</span>
    </div>
  );
}

const navigation = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    path: '/dashboard',
    icon: LayoutDashboard,
    match: 'dashboard',
  },
  {
    key: 'workspaces',
    label: 'Workspaces',
    path: '/workspaces',
    icon: BriefcaseBusiness,
    match: 'workspaces',
  },
  { key: 'assets', label: 'Assets', path: '/assets', icon: Boxes, match: 'assets' },
  { key: 'jobs', label: 'Job Center', path: '/jobs', icon: Gauge, match: 'jobs' },
  { key: 'renders', label: 'Render Center', path: '/renders', icon: Film, match: 'renders' },
  { key: 'providers', label: 'Providers', path: '/providers', icon: Sparkles, match: 'providers' },
  {
    key: 'wizard',
    label: 'Generation Wizard',
    path: '/wizard',
    icon: WandSparkles,
    match: 'generation',
  },
  {
    key: 'commercial',
    label: 'Commercial & SaaS',
    path: '/commercial',
    icon: CreditCard,
    match: 'commercial',
  },
  { key: 'admin', label: 'Admin Console', path: '/admin', icon: ShieldCheck, match: 'admin' },
  { key: 'settings', label: 'Settings', path: '/settings', icon: Settings, match: 'settings' },
];

function AppShell({
  route,
  navigate,
  children,
}: {
  route: Route;
  navigate: (path: string) => void;
  children: ReactNode;
}) {
  const { t } = useTranslation();
  const workspaces = useStudioStore((state) => state.workspaces);
  const currentWorkspaceId = useStudioStore((state) => state.currentWorkspaceId);
  const selectWorkspace = useStudioStore((state) => state.selectWorkspace);
  const { logout } = useAuth();
  const user = useStudioStore((state) => state.user);
  const ui = useStudioStore((state) => state.ui);
  const setUi = useStudioStore((state) => state.setUi);
  const jobs = useStudioStore((state) => state.jobs);
  const activeJobs = jobs.filter(
    (job) => job.status === 'Queued' || job.status === 'Running',
  ).length;
  const currentWorkspace = workspaces.find((workspace) => workspace.id === currentWorkspaceId);

  return (
    <div className="min-h-[100dvh] bg-background text-foreground">
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex border-r border-border bg-[#111517] transition-transform lg:translate-x-0',
          ui.sidebarCollapsed ? 'lg:w-[72px]' : 'lg:w-60',
          ui.mobileNavigationOpen ? 'w-60 translate-x-0' : 'w-60 -translate-x-full',
        )}
      >
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex h-16 items-center justify-between border-b border-white/8 px-4 text-zinc-100">
            {!ui.sidebarCollapsed && <Brand />}
            <button
              className="hidden rounded-md p-2 text-zinc-400 hover:bg-white/7 hover:text-white lg:block"
              onClick={() => setUi({ sidebarCollapsed: !ui.sidebarCollapsed })}
              aria-label="Toggle sidebar"
            >
              <PanelLeftClose className={cn('size-4', ui.sidebarCollapsed && 'rotate-180')} />
            </button>
            <button
              className="rounded-md p-2 text-zinc-400 lg:hidden"
              onClick={() => setUi({ mobileNavigationOpen: false })}
              aria-label="Close navigation"
            >
              <X className="size-4" />
            </button>
          </div>
          <nav className="flex-1 space-y-1 p-3" aria-label="Main navigation">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active =
                route.name === item.match ||
                (item.match === 'dashboard' && route.name === 'project');
              const translatedLabel = t(`nav.${item.key}`, item.label);
              return (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    setUi({ mobileNavigationOpen: false });
                  }}
                  title={ui.sidebarCollapsed ? translatedLabel : undefined}
                  className={cn(
                    'flex h-10 w-full items-center gap-3 rounded-lg px-3 text-sm transition-colors',
                    active
                      ? 'bg-primary/15 text-primary'
                      : 'text-zinc-400 hover:bg-white/6 hover:text-zinc-100',
                    ui.sidebarCollapsed && 'justify-center px-0',
                  )}
                >
                  <Icon className="size-[18px] shrink-0" />
                  {!ui.sidebarCollapsed && <span>{translatedLabel}</span>}
                  {!ui.sidebarCollapsed && item.match === 'jobs' && activeJobs > 0 && (
                    <span className="ml-auto rounded bg-white/8 px-1.5 py-0.5 text-[10px] text-zinc-300">
                      {activeJobs}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
          <div className="border-t border-white/8 p-3">
            <button
              className={cn(
                'flex w-full items-center gap-3 rounded-lg p-2 text-left text-sm text-zinc-300 hover:bg-white/6',
                ui.sidebarCollapsed && 'justify-center',
              )}
              onClick={() => {
                void logout();
                navigate('/login');
              }}
            >
              <CircleUserRound className="size-5 shrink-0" />
              {!ui.sidebarCollapsed && (
                <>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{user?.name}</span>
                    <span className="block truncate text-xs text-zinc-500">{user?.email}</span>
                  </span>
                  <LogOut className="size-4 text-zinc-500" />
                </>
              )}
            </button>
          </div>
        </div>
      </aside>
      {ui.mobileNavigationOpen && (
        <button
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
          onClick={() => setUi({ mobileNavigationOpen: false })}
          aria-label="Close navigation overlay"
        />
      )}
      <div className={cn('transition-[padding] lg:pl-60', ui.sidebarCollapsed && 'lg:pl-[72px]')}>
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-background/95 px-4 backdrop-blur sm:px-6">
          <button
            className="rounded-lg border border-border p-2 lg:hidden"
            onClick={() => setUi({ mobileNavigationOpen: true })}
            aria-label="Open navigation"
          >
            <MenuIcon className="size-4" />
          </button>
          <div className="relative min-w-0">
            <select
              className="h-9 max-w-[210px] appearance-none rounded-lg border border-border bg-card py-0 pl-3 pr-9 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20"
              value={currentWorkspaceId ?? ''}
              onChange={(event) => {
                selectWorkspace(event.target.value);
                navigate('/dashboard');
              }}
              aria-label="Current workspace"
            >
              {workspaces.map((workspace) => (
                <option key={workspace.id} value={workspace.id}>
                  {workspace.name}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-2.5 size-4 text-muted-foreground" />
          </div>
          <div className="hidden h-5 w-px bg-border sm:block" />
          <Breadcrumb
            route={route}
            currentWorkspace={currentWorkspace?.name ?? 'Workspace'}
            navigate={navigate}
          />
          <div className="ml-auto flex items-center gap-2">
            <LanguageSwitcher />
            <button
              onClick={() => navigate('/jobs')}
              className="relative rounded-lg border border-border p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
              aria-label="Open active jobs"
            >
              <Clock3 className="size-4" />
              {activeJobs > 0 && (
                <span className="absolute -right-1 -top-1 grid min-w-4 place-items-center rounded bg-primary px-1 text-[9px] font-semibold text-primary-foreground">
                  {activeJobs}
                </span>
              )}
            </button>
          </div>
        </header>
        <main
          className={cn(
            'min-h-[calc(100dvh-4rem)]',
            route.name === 'editor' ? 'overflow-hidden' : 'p-4 sm:p-6 lg:p-8',
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}

function Breadcrumb({
  route,
  currentWorkspace,
  navigate,
}: {
  route: Route;
  currentWorkspace: string;
  navigate: (path: string) => void;
}) {
  const { t: tEditor } = useTranslation('editor');
  const { t } = useTranslation();

  const project = useStudioStore((state) =>
    route.name === 'project' || route.name === 'editor'
      ? state.projects.find((item) => item.id === route.projectId)
      : undefined,
  );

  const titles: Partial<Record<Route['name'], string>> = {
    dashboard: t('nav.dashboard', 'Production Overview'),
    workspaces: t('nav.workspaces', 'Workspaces'),
    assets: t('nav.assets', 'Asset Catalog'),
    jobs: t('nav.jobs', 'Job Center'),
    renders: t('nav.renders', 'Render Center'),
    providers: t('nav.providers', 'AI Providers Integration'),
    settings: t('nav.settings', 'Settings'),
  };
  const routeTitleText = titles[route.name] ?? 'AI Studio';

  return (
    <div className="min-w-0 text-sm text-muted-foreground">
      <button
        className="hidden hover:text-foreground sm:inline"
        onClick={() => navigate('/dashboard')}
      >
        {currentWorkspace}
      </button>
      {project && (
        <>
          <span className="hidden px-2 sm:inline">/</span>
          <button
            className="max-w-44 truncate align-bottom font-medium text-foreground hover:text-primary"
            onClick={() => navigate(`/projects/${project.id}`)}
          >
            {project.name}
          </button>
          {route.name === 'editor' && (
            <>
              <span className="px-2">/</span>
              <span>{tEditor('navigation.editor')}</span>
            </>
          )}
        </>
      )}
      {!project && <span className="font-medium text-foreground sm:hidden">{routeTitleText}</span>}
    </div>
  );
}

function RouteScreen({ route, navigate }: { route: Route; navigate: (path: string) => void }) {
  // Hooks MUST be called at the top level, before any conditional logic
  const { t } = useTranslation();
  const projects = useStudioStore((state) => state.projects);

  // All conditionals after hooks
  if (route.name === 'dashboard') return <Dashboard navigate={navigate} />;
  if (route.name === 'workspaces') return <WorkspaceCenter />;
  if (route.name === 'assets') return <AssetLibrary />;
  if (route.name === 'jobs') return <JobCenter />;
  if (route.name === 'renders') return <RenderCenter />;
  if (route.name === 'providers') return <ProviderRegistry />;
  if (route.name === 'commercial') return <CommercialScreen defaultTab={route.tab || 'profile'} />;
  if (route.name === 'generation') return <GenerationScreen defaultTab={route.tab || 'wizard'} />;
  if (route.name === 'admin') return <AdminConsoleScreen defaultTab={route.tab || 'metrics'} />;
  if (route.name === 'settings') return <SettingsCenter />;
  if (route.name === 'unauthorized')
    return (
      <ErrorPage
        code="401"
        title={t('errors.unauthorizedTitle', 'Sign in required')}
        detail={t('errors.unauthorizedDetail', 'Your session is no longer valid.')}
        action={() => navigate('/login')}
      />
    );
  if (route.name === 'forbidden')
    return (
      <ErrorPage
        code="403"
        title={t('errors.forbiddenTitle', 'Access denied')}
        detail={t('errors.forbiddenDetail', 'You do not have permission to view this resource.')}
        action={() => navigate('/dashboard')}
      />
    );
  if (route.name === 'not-found')
    return (
      <ErrorPage
        code="404"
        title={t('errors.notFoundTitle', 'Page not found')}
        detail={t('errors.notFoundDetail', 'The address does not match a screen in AI Studio.')}
        action={() => navigate('/dashboard')}
      />
    );
  if (route.name === 'project' || route.name === 'editor') {
    const project = projects.find((item) => item.id === route.projectId);
    if (!project || project.status === 'Archived')
      return (
        <ErrorPage
          code="404"
          title="Project unavailable"
          detail="This project was archived or does not exist."
          action={() => navigate('/dashboard')}
        />
      );
    return route.name === 'editor' ? (
      <EditorShell project={project} navigate={navigate} />
    ) : (
      <ProjectScreen project={project} navigate={navigate} />
    );
  }
  return null;
}

function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      {action}
    </div>
  );
}

function Dashboard({ navigate }: { navigate: (path: string) => void }) {
  const { t } = useTranslation();
  const currentWorkspaceId = useStudioStore((state) => state.currentWorkspaceId);
  const allProjects = useStudioStore((state) => state.projects);
  const allJobs = useStudioStore((state) => state.jobs);
  const allRenders = useStudioStore((state) => state.renders);
  const projects = allProjects.filter(
    (project) => project.workspaceId === currentWorkspaceId && project.status !== 'Archived',
  );
  const jobs = allJobs.filter((job) => job.workspaceId === currentWorkspaceId);
  const renders = allRenders.filter((render) => render.workspaceId === currentWorkspaceId);
  const [createOpen, setCreateOpen] = useState(false);
  const activeJobs = jobs.filter((job) => job.status === 'Running' || job.status === 'Queued');

  return (
    <div className="mx-auto max-w-[1440px]">
      <PageHeader
        title={t('dashboard.title')}
        description={t('dashboard.description')}
        action={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 size-4" />
            {t('dashboard.newProject')}
          </Button>
        }
      />
      <div className="grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          label={t('dashboard.activeProjects')}
          value={String(projects.length)}
          hint={t('dashboard.currentWorkspace')}
        />
        <Metric
          label={t('dashboard.jobsInProgress')}
          value={String(activeJobs.length)}
          hint={t('dashboard.needAttentionCount', {
            count: jobs.filter((job) => job.status === 'Failed').length,
          })}
        />
        <Metric
          label={t('dashboard.assetsAvailable')}
          value={String(
            useStudioStore
              .getState()
              .assets.filter((asset) => asset.workspaceId === currentWorkspaceId).length,
          )}
          hint={t('dashboard.originalsAndMedia')}
        />
        <Metric
          label={t('dashboard.completedRenders')}
          value={String(renders.filter((render) => render.status === 'Success').length)}
          hint={t('dashboard.readyForExport')}
        />
      </div>
      <div className="mt-7 grid gap-7 xl:grid-cols-[1.45fr_0.75fr]">
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold">{t('dashboard.recentProjects')}</h2>
            <span className="text-xs text-muted-foreground">
              {t('dashboard.activeProjectCount', { count: projects.length })}
            </span>
          </div>
          {projects.length ? (
            <div className="grid gap-3 md:grid-cols-2">
              {projects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => navigate(`/projects/${project.id}`)}
                  className="group rounded-xl border border-border bg-card p-5 text-left hover:border-primary/60"
                >
                  <div className="mb-6 flex items-start justify-between">
                    <div className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary">
                      <Film className="size-5" />
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {project.aspectRatio} / {project.frameRate} fps
                    </span>
                  </div>
                  <h3 className="font-semibold group-hover:text-primary">{project.name}</h3>
                  <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted-foreground">
                    {project.description}
                  </p>
                  <div className="mt-5 flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
                    <span>{project.status}</span>
                    <span>{relativeTime(project.updatedAt)}</span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Film className="size-5" />}
              title={t('dashboard.noProjectsTitle')}
              description={t('dashboard.noProjectsDesc')}
              action={
                <Button onClick={() => setCreateOpen(true)}>{t('dashboard.createProject')}</Button>
              }
            />
          )}
        </section>
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold">{t('dashboard.activity')}</h2>
            <button
              onClick={() => navigate('/jobs')}
              className="text-xs text-primary hover:underline"
            >
              {t('dashboard.openJobCenter')}
            </button>
          </div>
          <Card className="divide-y divide-border">
            {jobs.slice(0, 5).map((job) => (
              <div key={job.id} className="p-4">
                <div className="flex items-center gap-3">
                  <StatusIcon status={job.status} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{job.type}</p>
                    <p className="truncate text-xs text-muted-foreground">{job.subject}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{job.status}</span>
                </div>
                {job.status === 'Running' && <Progress value={job.progress} className="mt-3" />}
              </div>
            ))}
          </Card>
        </section>
      </div>
      <ProjectDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={(project) => navigate(`/projects/${project.id}`)}
      />
    </div>
  );
}

function Metric({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="bg-card px-5 py-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-2 font-mono text-2xl font-semibold">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}

function ProjectDialog({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (project: ProjectRecord) => void;
}) {
  const { t } = useTranslation();
  const createProject = useStudioStore((state) => state.createProject);
  const notify = useStudioStore((state) => state.notify);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [aspectRatio, setAspectRatio] = useState<ProjectRecord['aspectRatio']>('16:9');
  const [frameRate, setFrameRate] = useState<ProjectRecord['frameRate']>(24);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      const project = await createProject({
        name: name.trim(),
        description: description.trim(),
        aspectRatio,
        frameRate,
      });
      if (project) {
        onClose();
        onCreated(project);
        setName('');
        setDescription('');
      }
    } catch (error: unknown) {
      notify(getApiError(error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={t('createProjectDialog.title')}
      description={t('createProjectDialog.description')}
    >
      <form
        onSubmit={(event) => {
          void submit(event);
        }}
        className="space-y-4"
      >
        <label className="block text-sm font-medium">
          {t('createProjectDialog.name')}
          <Input
            className="mt-2"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder={t('createProjectDialog.namePlaceholder')}
          />
        </label>
        <label className="block text-sm font-medium">
          {t('createProjectDialog.descriptionLabel')}
          <Input
            className="mt-2"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder={t('createProjectDialog.descPlaceholder')}
          />
        </label>
        <div className="grid grid-cols-2 gap-4">
          <label className="block text-sm font-medium">
            {t('createProjectDialog.aspectRatio')}
            <select
              className="studio-select mt-2"
              value={aspectRatio}
              onChange={(event) =>
                setAspectRatio(event.target.value as ProjectRecord['aspectRatio'])
              }
            >
              <option>16:9</option>
              <option>9:16</option>
              <option>1:1</option>
            </select>
          </label>
          <label className="block text-sm font-medium">
            {t('createProjectDialog.frameRate')}
            <select
              className="studio-select mt-2"
              value={frameRate}
              onChange={(event) =>
                setFrameRate(Number(event.target.value) as ProjectRecord['frameRate'])
              }
            >
              <option value={24}>24 fps</option>
              <option value={25}>25 fps</option>
              <option value={30}>30 fps</option>
            </select>
          </label>
        </div>
        <div className="flex justify-end gap-2 pt-3">
          <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" loading={submitting}>
            {t('createProjectDialog.title')}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}

function WorkspaceCenter() {
  const { t } = useTranslation();
  const workspaces = useStudioStore((state) => state.workspaces);
  const projects = useStudioStore((state) => state.projects);
  const currentWorkspaceId = useStudioStore((state) => state.currentWorkspaceId);
  const selectWorkspace = useStudioStore((state) => state.selectWorkspace);
  const createWorkspace = useStudioStore((state) => state.createWorkspace);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title={t('workspaces.title')}
        description={t('workspaces.description')}
        action={
          <Button onClick={() => setOpen(true)}>
            <Plus className="mr-2 size-4" />
            {t('workspaces.newWorkspace')}
          </Button>
        }
      />
      <div className="space-y-3">
        {workspaces.map((workspace) => {
          const count = projects.filter(
            (project) => project.workspaceId === workspace.id && project.status !== 'Archived',
          ).length;
          const active = workspace.id === currentWorkspaceId;
          return (
            <Card
              key={workspace.id}
              className={cn(
                'flex flex-col gap-4 p-5 sm:flex-row sm:items-center',
                active && 'border-primary/60',
              )}
            >
              <div className="grid size-11 place-items-center rounded-lg bg-muted">
                <BriefcaseBusiness className="size-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <h2 className="font-semibold">{workspace.name}</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t('workspaces.activeProjects', { count })}
                </p>
              </div>
              {active ? (
                <span className="text-sm font-medium text-primary">
                  {t('workspaces.currentWorkspace')}
                </span>
              ) : (
                <Button variant="outline" onClick={() => selectWorkspace(workspace.id)}>
                  {t('workspaces.switchWorkspace')}
                </Button>
              )}
            </Card>
          );
        })}
      </div>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title={t('workspaces.createTitle')}
        description={t('workspaces.createDesc')}
      >
        <form
          onSubmit={(event) => {
            void (async () => {
              event.preventDefault();
              if (name.trim()) {
                await createWorkspace(name);
                setName('');
                setOpen(false);
              }
            })();
          }}
        >
          <label className="block text-sm font-medium">
            {t('workspaces.nameLabel')}
            <Input
              className="mt-2"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </label>
          <div className="mt-5 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit">{t('workspaces.createBtn')}</Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}

function ProjectScreen({
  project,
  navigate,
}: {
  project: ProjectRecord;
  navigate: (path: string) => void;
}) {
  const { t } = useTranslation();
  const updateProject = useStudioStore((state) => state.updateProject);
  const archiveProject = useStudioStore((state) => state.archiveProject);
  const allAssets = useStudioStore((state) => state.assets);
  const allJobs = useStudioStore((state) => state.jobs);
  const assets = allAssets.filter((asset) => asset.projectId === project.id);
  const jobs = allJobs.filter((job) => job.projectId === project.id);
  const [editOpen, setEditOpen] = useState(false);
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description);

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title={project.name}
        description={project.description}
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setEditOpen(true)}>
              {t('projectOverview.editProject')}
            </Button>
            <Button onClick={() => navigate(`/projects/${project.id}/editor`)}>
              <Clapperboard className="mr-2 size-4" />
              {t('projectOverview.openEditor')}
            </Button>
          </div>
        }
      />
      <div className="grid gap-5 md:grid-cols-3">
        <Card className="p-5">
          <p className="text-xs text-muted-foreground">{t('projectOverview.editorialFormat')}</p>
          <p className="mt-3 font-mono text-lg">
            {project.aspectRatio} / {project.frameRate} fps
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-xs text-muted-foreground">{t('projectOverview.assets')}</p>
          <p className="mt-3 font-mono text-lg">
            {t('projectOverview.linkedAssets', { count: assets.length })}
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-xs text-muted-foreground">{t('projectOverview.operations')}</p>
          <p className="mt-3 font-mono text-lg">
            {t('projectOverview.runningOperations', {
              count: jobs.filter((job) => job.status === 'Running').length,
            })}
          </p>
        </Card>
      </div>
      <div className="mt-7 grid gap-7 lg:grid-cols-[1fr_320px]">
        <Card className="overflow-hidden">
          <div className="border-b border-border p-5">
            <h2 className="font-semibold">{t('projectOverview.projectStructure')}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {t('projectOverview.projectStructureDescription')}
            </p>
          </div>
          <div className="grid gap-px bg-border sm:grid-cols-2 xl:grid-cols-4">
            <ProjectModule
              icon={<FileText />}
              name={t('projectOverview.modules.script')}
              meta={t('projectOverview.modules.scriptMeta')}
            />
            <ProjectModule
              icon={<Layers3 />}
              name={t('projectOverview.modules.storyboard')}
              meta={t('projectOverview.modules.storyboardMeta')}
            />
            <ProjectModule
              icon={<Clapperboard />}
              name={t('projectOverview.modules.timeline')}
              meta={t('projectOverview.modules.timelineMeta')}
            />
            <ProjectModule
              icon={<Boxes />}
              name={t('projectOverview.modules.assetCollection')}
              meta={t('projectOverview.modules.references', { count: assets.length })}
            />
          </div>
        </Card>
        <Card className="p-5">
          <h2 className="font-semibold">{t('projectOverview.lifecycle')}</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">{t('common.status')}</dt>
              <dd>{project.status}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">{t('projectOverview.updated')}</dt>
              <dd>{relativeTime(project.updatedAt)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">{t('projectOverview.version')}</dt>
              <dd>Foundation v1</dd>
            </div>
          </dl>
          <Button
            variant="outline"
            className="mt-6 w-full text-destructive hover:text-destructive"
            onClick={() => {
              void archiveProject(project.id);
              navigate('/dashboard');
            }}
          >
            <Archive className="mr-2 size-4" />
            {t('projectOverview.archiveProject')}
          </Button>
        </Card>
      </div>
      <Dialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title={t('projectOverview.editProject')}
        description={t('projectOverview.editProjectDescription')}
      >
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void updateProject(project.id, { name, description });
            setEditOpen(false);
          }}
        >
          <label className="block text-sm font-medium">
            {t('projectOverview.name')}
            <Input
              className="mt-2"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </label>
          <label className="mt-4 block text-sm font-medium">
            {t('projectOverview.description')}
            <Input
              className="mt-2"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </label>
          <div className="mt-5 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit">{t('projectOverview.saveProject')}</Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}

function ProjectModule({ icon, name, meta }: { icon: ReactNode; name: string; meta: string }) {
  return (
    <div className="bg-card p-5">
      <div className="mb-4 text-muted-foreground [&>svg]:size-5">{icon}</div>
      <p className="text-sm font-medium">{name}</p>
      <p className="mt-1 text-xs text-muted-foreground">{meta}</p>
    </div>
  );
}

interface ProjectTimelineClip {
  id: string;
  sceneId: string;
  type: 'visual' | 'voice';
  left: number;
  width: number;
  startSeconds: number;
  durationSeconds: number;
  name: string;
  content: string;
}

const EMPTY_PRODUCTION_SCENES: ProductionScene[] = [];

function buildTimelineFromScenes(scenes: ProductionScene[]) {
  let cursorSeconds = 0;
  const sceneTimings = scenes.map((scene) => {
    const durationSeconds = getSceneDuration(scene);
    const timing = {
      sceneId: scene.id,
      startSeconds: cursorSeconds,
      durationSeconds,
      endSeconds: cursorSeconds + durationSeconds,
    };
    cursorSeconds = timing.endSeconds;
    return timing;
  });
  const totalSeconds = Math.max(DEFAULT_SCENE_DURATION_SECONDS, cursorSeconds);
  const clipsFor = (type: ProjectTimelineClip['type']): ProjectTimelineClip[] =>
    scenes.map((scene, index) => {
      const timing = sceneTimings[index];
      return {
        id: `${type}-${scene.id}`,
        sceneId: scene.id,
        type,
        left: (timing.startSeconds / totalSeconds) * 100,
        width: (timing.durationSeconds / totalSeconds) * 100,
        startSeconds: timing.startSeconds,
        durationSeconds: timing.durationSeconds,
        name: type === 'visual' ? scene.title : scene.narration,
        content: type === 'visual' ? scene.visual : scene.narration,
      };
    });
  return {
    totalSeconds,
    sceneTimings,
    rows: [
      { id: 'script-visuals', label: 'V1', name: 'sceneVisuals', clips: clipsFor('visual') },
      { id: 'script-voice', label: 'A1', name: 'sceneNarration', clips: clipsFor('voice') },
    ],
  };
}

function EditorShell({
  project,
  navigate,
}: {
  project: ProjectRecord;
  navigate: (path: string) => void;
}) {
  const { t } = useTranslation('editor');
  const editor = useStudioStore((state) => state.editor);
  const setEditor = useStudioStore((state) => state.setEditor);
  const notify = useStudioStore((state) => state.notify);
  const [workspaceMode, setWorkspaceMode] = useState<'timeline' | 'script'>('timeline');
  const [exporting, setExporting] = useState(false);
  const workspaceId = useStudioStore((state) => state.currentWorkspaceId);
  const allAssets = useStudioStore((state) => state.assets);
  const allJobs = useStudioStore((state) => state.jobs);
  const assets = allAssets.filter((asset) => asset.workspaceId === workspaceId);
  const jobs = allJobs.filter((job) => job.projectId === project.id);

  useEffect(() => {
    if (project?.id) {
      void useTimelineStore.getState().loadFromBackend(project.id);
    }
  }, [project?.id]);

  const handleExportVideo = async () => {
    if (exporting) return;
    setExporting(true);
    try {
      await useTimelineStore.getState().flushAutoSave();
      await queueProjectVideoExport(project.id, {
        frameRate: project.frameRate,
        aspectRatio: project.aspectRatio,
        projectName: project.name,
      });
      notify(t('export.queued'));
      navigate('/renders');
    } catch (error) {
      notify(t('export.failed', { message: getApiError(error).message }));
    } finally {
      setExporting(false);
    }
  };
  return (
    <div className="flex h-[calc(100dvh-4rem)] flex-col bg-[#0d1012] text-zinc-200">
      <div className="flex h-12 items-center gap-1 border-b border-white/8 px-3">
        <button
          onClick={() => setWorkspaceMode('timeline')}
          className={cn(
            'mr-1 flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium',
            workspaceMode === 'timeline'
              ? 'bg-white/10 text-zinc-100'
              : 'text-zinc-500 hover:bg-white/5 hover:text-zinc-300',
          )}
        >
          <Clapperboard className="size-3.5" />
          {t('modes.timeline')}
        </button>
        <button
          onClick={() => setWorkspaceMode('script')}
          className={cn(
            'mr-2 flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium',
            workspaceMode === 'script'
              ? 'bg-primary text-primary-foreground'
              : 'text-zinc-500 hover:bg-white/5 hover:text-zinc-300',
          )}
        >
          <FileText className="size-3.5" />
          {t('modes.script')}
        </button>
        {workspaceMode === 'timeline' && (
          <>
            {(['select', 'trim', 'split'] as const).map((tool) => (
              <button
                key={tool}
                onClick={() => setEditor({ activeTool: tool })}
                className={cn(
                  'rounded-md px-3 py-1.5 text-xs capitalize',
                  editor.activeTool === tool
                    ? 'bg-primary text-primary-foreground'
                    : 'text-zinc-400 hover:bg-white/7',
                )}
              >
                {t(`tools.${tool}`)}
              </button>
            ))}
            <div className="mx-2 h-5 w-px bg-white/10" />
            <button className="editor-icon" aria-label={t('tools.undo')}>
              <ArrowLeft className="size-4" />
            </button>
            <button className="editor-icon" aria-label={t('tools.redo')}>
              <Redo2 className="size-4" />
            </button>
          </>
        )}
        <div className="ml-auto flex items-center gap-2 text-xs text-zinc-500">
          <span>
            {workspaceMode === 'script' ? t('status.scriptAutoSave') : t('status.timelineSaved')}
          </span>
          {workspaceMode === 'timeline' && (
            <Button size="sm" onClick={() => void handleExportVideo()} disabled={exporting}>
              {exporting && <RefreshCw className="mr-2 size-3.5 animate-spin" aria-hidden="true" />}
              {exporting ? t('export.queueing') : t('actions.render')}
            </Button>
          )}
        </div>
      </div>
      {workspaceMode === 'script' ? (
        <ManualScriptWorkspace
          projectId={project.id}
          projectName={project.name}
          onUseForGeneration={() =>
            navigate(`/generation?projectId=${encodeURIComponent(project.id)}`)
          }
        />
      ) : (
        <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[260px_minmax(440px,1fr)] 2xl:grid-cols-[260px_minmax(540px,1fr)_280px]">
          <aside className="hidden min-h-0 border-r border-white/8 bg-[#111517] lg:flex lg:flex-col">
            <div className="grid grid-cols-3 border-b border-white/8">
              <button
                onClick={() => setEditor({ leftPanel: 'workflow' })}
                className={cn(
                  'px-2 py-3 text-[11px] font-medium',
                  editor.leftPanel === 'workflow'
                    ? 'border-b-2 border-primary text-zinc-100'
                    : 'text-zinc-500',
                )}
              >
                {t('panels.workflow')}
              </button>
              <button
                onClick={() => setEditor({ leftPanel: 'assets' })}
                className={cn(
                  'px-3 py-3 text-xs font-medium',
                  editor.leftPanel === 'assets'
                    ? 'border-b-2 border-primary text-zinc-100'
                    : 'text-zinc-500',
                )}
              >
                {t('panels.assets')}
              </button>
              <button
                onClick={() => setEditor({ leftPanel: 'jobs' })}
                className={cn(
                  'px-3 py-3 text-xs font-medium',
                  editor.leftPanel === 'jobs'
                    ? 'border-b-2 border-primary text-zinc-100'
                    : 'text-zinc-500',
                )}
              >
                {t('panels.jobs')}
              </button>
            </div>
            {editor.leftPanel === 'workflow' && <WorkflowPanel project={project} />}
            {editor.leftPanel === 'assets' && <ProjectEditorAssets assets={assets} />}
            {editor.leftPanel === 'jobs' && <EditorJobs jobs={jobs} />}
          </aside>
          <section className="grid min-h-0 grid-rows-[minmax(280px,1fr)_300px]">
            <PreviewCanvas project={project} projectId={project.id} playhead={editor.playhead} />
            <TimelineShell projectId={project.id} />
          </section>
          <Inspector project={project} />
        </div>
      )}
    </div>
  );
}

function EditorJobs({ jobs }: { jobs: ReturnType<typeof useStudioStore.getState>['jobs'] }) {
  return (
    <div className="divide-y divide-white/8 overflow-auto">
      {jobs.map((job) => (
        <div key={job.id} className="p-3">
          <div className="flex items-center gap-2">
            <StatusIcon status={job.status} />
            <p className="min-w-0 flex-1 truncate text-xs">{job.type}</p>
            <span className="text-[10px] text-zinc-500">{job.status}</span>
          </div>
          {job.status === 'Running' && <Progress value={job.progress} className="mt-2" />}
        </div>
      ))}
    </div>
  );
}

function PreviewCanvas({
  project,
  projectId,
  playhead,
}: {
  project: ProjectRecord;
  projectId: string;
  playhead: number;
}) {
  const { t } = useTranslation('editor');
  const notify = useStudioStore((state) => state.notify);
  const [playing, setPlaying] = useState(false);
  const [voiceUrls, setVoiceUrls] = useState<Record<string, string>>({});
  const [voicePreparing, setVoicePreparing] = useState(false);
  const [voicePreparationError, setVoicePreparationError] = useState<string | null>(null);
  const [voiceProgress, setVoiceProgress] = useState({ ready: 0, total: 0 });
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const activeAudioSceneIdRef = useRef<string | null>(null);
  const setEditor = useStudioStore((state) => state.setEditor);
  const updateSceneTiming = useProductionFlowStore((state) => state.updateSceneTiming);
  const persistSceneTiming = useProductionFlowStore((state) => state.persistSceneTiming);
  const scenes = useProductionFlowStore(
    (state) => state.projects[projectId]?.scenes ?? EMPTY_PRODUCTION_SCENES,
  );
  const timeline = useMemo(() => buildTimelineFromScenes(scenes), [scenes]);
  const activeSceneIndex = timeline.sceneTimings.findIndex(
    (timing, index) =>
      playhead >= timing.startSeconds &&
      (playhead < timing.endSeconds || index === timeline.sceneTimings.length - 1),
  );
  const activeScene = activeSceneIndex >= 0 ? scenes[activeSceneIndex] : undefined;
  const totalSeconds = timeline.totalSeconds;
  const narrationSignature = useMemo(
    () => scenes.map((scene) => `${scene.id}:${scene.narration}`).join('|'),
    [scenes],
  );

  useEffect(() => {
    let mounted = true;
    const scenesWithNarration = scenes.filter((scene) => scene.narration.trim().length > 0);
    if (scenesWithNarration.length === 0) {
      setVoiceUrls({});
      setVoicePreparing(false);
      setVoicePreparationError(null);
      setVoiceProgress({ ready: 0, total: 0 });
      return () => {
        mounted = false;
      };
    }

    setVoicePreparing(true);
    setVoicePreparationError(null);
    setVoiceProgress({ ready: 0, total: scenesWithNarration.length });

    void prepareProjectVoicePlayback(projectId, scenesWithNarration, (progress) => {
      if (mounted) setVoiceProgress({ ready: progress.ready, total: progress.total });
    })
      .then((result) => {
        if (!mounted) return;
        setVoiceUrls(result.audioUrls);

        const changedSceneIds: string[] = [];
        for (const scene of scenesWithNarration) {
          const voiceDurationSeconds = result.durationSecondsByScene[scene.id];
          if (!voiceDurationSeconds) continue;

          const minimumDuration = getMinimumSceneDuration({
            ...scene,
            voiceDurationSeconds,
          });
          const durationSeconds = roundSceneDuration(
            Math.max(scene.durationSeconds ?? DEFAULT_SCENE_DURATION_SECONDS, minimumDuration),
          );
          const timingChanged =
            Math.abs((scene.durationSeconds ?? DEFAULT_SCENE_DURATION_SECONDS) - durationSeconds) >
              0.001 || Math.abs((scene.voiceDurationSeconds ?? 0) - voiceDurationSeconds) > 0.001;
          if (!timingChanged) continue;

          updateSceneTiming(projectId, scene.id, { durationSeconds, voiceDurationSeconds });
          changedSceneIds.push(scene.id);
        }

        void (async () => {
          for (const sceneId of changedSceneIds) {
            try {
              await persistSceneTiming(projectId, sceneId);
            } catch (error: unknown) {
              notify(`Không lưu được thời lượng cảnh: ${getApiError(error).message}`);
            }
          }
        })();
      })
      .catch((error: unknown) => {
        if (!mounted) return;
        const apiError = getApiError(error);
        setVoicePreparationError(apiError.message);
        notify(`Không chuẩn bị được giọng đọc: ${apiError.message}`);
      })
      .finally(() => {
        if (mounted) setVoicePreparing(false);
      });

    return () => {
      mounted = false;
    };
  }, [narrationSignature, notify, persistSceneTiming, projectId, scenes, updateSceneTiming]);

  const playVoiceForScene = (sceneIndex: number, offsetSeconds = 0): boolean => {
    const scene = scenes[sceneIndex];
    if (!scene?.narration.trim()) {
      audioRef.current?.pause();
      activeAudioSceneIdRef.current = scene?.id ?? null;
      return true;
    }

    const audioUrl = voiceUrls[scene.id];
    const audio = audioRef.current;
    if (!audioUrl || !audio) return false;

    audio.pause();
    audio.src = audioUrl;
    audio.load();
    if (offsetSeconds > 0) {
      audio.addEventListener(
        'loadedmetadata',
        () => {
          audio.currentTime = Math.min(offsetSeconds, Math.max(0, audio.duration - 0.05));
        },
        { once: true },
      );
    }

    activeAudioSceneIdRef.current = scene.id;
    void audio.play().catch((error: unknown) => {
      setPlaying(false);
      const apiError = getApiError(error);
      notify(`Không phát được giọng đọc: ${apiError.message}`);
    });
    return true;
  };

  useEffect(() => {
    if (!playing) return;

    let animationFrame = 0;
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
      animationFrame = window.requestAnimationFrame(advancePlayback);
    };

    animationFrame = window.requestAnimationFrame(advancePlayback);
    return () => window.cancelAnimationFrame(animationFrame);
  }, [playing, setEditor, totalSeconds]);

  const togglePlayback = () => {
    if (playing) {
      audioRef.current?.pause();
      setPlaying(false);
      return;
    }

    if (voicePreparing) {
      notify(`Đang chuẩn bị giọng đọc (${voiceProgress.ready}/${voiceProgress.total})`);
      return;
    }

    const nextPlayhead = playhead >= totalSeconds ? 0 : playhead;
    const nextSceneIndex = timeline.sceneTimings.findIndex(
      (timing, index) =>
        nextPlayhead >= timing.startSeconds &&
        (nextPlayhead < timing.endSeconds || index === timeline.sceneTimings.length - 1),
    );
    if (nextPlayhead !== playhead) setEditor({ playhead: nextPlayhead });

    const sceneOffset =
      nextSceneIndex >= 0 ? nextPlayhead - timeline.sceneTimings[nextSceneIndex].startSeconds : 0;
    if (nextSceneIndex >= 0 && !playVoiceForScene(nextSceneIndex, sceneOffset)) {
      notify(
        voicePreparationError
          ? `Chưa có giọng đọc: ${voicePreparationError}`
          : 'Giọng đọc chưa sẵn sàng.',
      );
      return;
    }

    setPlaying(true);
  };

  useEffect(() => {
    if (!playing) {
      audioRef.current?.pause();
      activeAudioSceneIdRef.current = null;
      return;
    }

    const scene = scenes[activeSceneIndex];
    if (!scene || activeAudioSceneIdRef.current === scene.id) return;
    if (!playVoiceForScene(activeSceneIndex)) setPlaying(false);
  }, [activeSceneIndex, playing, scenes, voiceUrls]);

  useEffect(
    () => () => {
      audioRef.current?.pause();
    },
    [],
  );

  return (
    <div className="relative flex min-h-0 flex-col items-center justify-center bg-[#090b0c] p-5">
      <audio ref={audioRef} preload="auto" />
      <div
        className={cn(
          'relative overflow-hidden border border-white/10 bg-[#1d2529] shadow-2xl shadow-black/40',
          project.aspectRatio === '9:16'
            ? 'h-[78%] aspect-[9/16]'
            : project.aspectRatio === '1:1'
              ? 'h-[72%] aspect-square'
              : 'w-[72%] aspect-video',
        )}
      >
        {activeScene && isImageUrl(activeScene.visual) ? (
          <img
            src={activeScene.visual}
            alt={activeScene.title || t('timeline.untitledClip')}
            className="absolute inset-0 size-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_60%_35%,rgba(92,142,158,0.28),transparent_38%),linear-gradient(145deg,#202a2f,#111517_65%)]" />
        )}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent px-5 pb-5 pt-16">
          <p className="text-[10px] uppercase tracking-[0.14em] text-zinc-400">
            {t('preview.currentFrame')}
          </p>
          <p className="mt-1 text-sm font-medium text-zinc-100">
            {activeScene?.title ?? t('timeline.emptyTitle')}
          </p>
        </div>
      </div>
      <div className="mt-3 flex w-[72%] items-center justify-between rounded-md border border-white/8 bg-[#111517] px-3 py-1.5">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="grid size-8 shrink-0 place-items-center rounded-md bg-zinc-100 text-zinc-900 transition-colors hover:bg-white disabled:cursor-wait disabled:opacity-60"
            onClick={togglePlayback}
            disabled={voicePreparing}
            aria-label={playing ? t('preview.pause') : t('preview.play')}
            title={playing ? t('preview.pause') : t('preview.play')}
          >
            {voicePreparing ? (
              <RefreshCw className="size-4 animate-spin" />
            ) : playing ? (
              <Pause className="size-4 fill-current" />
            ) : (
              <Play className="ml-0.5 size-4 fill-current" />
            )}
          </button>
          {voicePreparing && (
            <span className="text-[10px] text-zinc-400">
              Đang chuẩn bị giọng đọc {voiceProgress.ready}/{voiceProgress.total}
            </span>
          )}
        </div>
        <div className="font-mono text-[10px] text-zinc-400">
          {formatTime(Math.min(playhead, totalSeconds))} / {formatTime(totalSeconds)}
        </div>
      </div>
    </div>
  );
}

function TimelineShell({ projectId }: { projectId: string }) {
  const { t } = useTranslation('editor');
  const editor = useStudioStore((state) => state.editor);
  const setEditor = useStudioStore((state) => state.setEditor);
  const notify = useStudioStore((state) => state.notify);
  const updateSceneTiming = useProductionFlowStore((state) => state.updateSceneTiming);
  const persistSceneTiming = useProductionFlowStore((state) => state.persistSceneTiming);
  const resizeStateRef = useRef<{
    sceneId: string;
    startX: number;
    startDuration: number;
    trackWidth: number;
    totalSeconds: number;
  } | null>(null);
  const scenes = useProductionFlowStore(
    (state) => state.projects[projectId]?.scenes ?? EMPTY_PRODUCTION_SCENES,
  );
  const timeline = useMemo(() => buildTimelineFromScenes(scenes), [scenes]);
  const rulerStep = Math.max(5, Math.ceil(timeline.totalSeconds / 50) * 5);
  const rulerMarks = Array.from(
    { length: Math.max(2, Math.ceil(timeline.totalSeconds / rulerStep) + 1) },
    (_, index) => Math.min(index * rulerStep, timeline.totalSeconds),
  );
  const timelineRows = timeline.rows;
  return (
    <div className="min-h-0 border-t border-white/8 bg-[#111517]">
      <div className="flex h-10 items-center border-b border-white/8 px-3">
        <span className="text-xs font-medium">{t('timeline.title')}</span>
        <div className="ml-auto flex items-center gap-2">
          <button
            className="editor-icon"
            onClick={() => setEditor({ zoom: Math.max(0.5, editor.zoom - 0.25) })}
            aria-label={t('timeline.zoomOut')}
          >
            <ZoomOut className="size-3.5" />
          </button>
          <span className="w-10 text-center font-mono text-[10px] text-zinc-500">
            {Math.round(editor.zoom * 100)}%
          </span>
          <button
            className="editor-icon"
            onClick={() => setEditor({ zoom: Math.min(2, editor.zoom + 0.25) })}
            aria-label={t('timeline.zoomIn')}
          >
            <ZoomIn className="size-3.5" />
          </button>
        </div>
      </div>
      <div className="grid h-[calc(100%-2.5rem)] grid-cols-[112px_minmax(620px,1fr)] overflow-auto">
        <div className="sticky left-0 z-10 bg-[#111517] pt-7">
          {timelineRows.map((track) => (
            <div
              key={track.id}
              className="flex h-12 items-center gap-2 border-b border-r border-white/8 px-2"
            >
              <span className="w-6 font-mono text-[10px] text-zinc-500">{track.label}</span>
              <span className="truncate text-[10px] text-zinc-400">
                {t(`timeline.tracks.${track.name}`)}
              </span>
            </div>
          ))}
        </div>
        <div
          className="relative min-w-[720px]"
          style={{ width: `${Math.max(100, editor.zoom * 100)}%` }}
        >
          <div className="relative h-7 border-b border-white/8 bg-[#0d1012]">
            {rulerMarks.map((mark) => (
              <button
                key={mark}
                onClick={() => setEditor({ playhead: mark })}
                className="absolute top-0 h-full border-l border-white/10 pl-1 font-mono text-[9px] text-zinc-600"
                style={{ left: `${(mark / timeline.totalSeconds) * 100}%` }}
              >{`00:${String(mark).padStart(2, '0')}`}</button>
            ))}
          </div>
          {timelineRows.map((track) => (
            <div
              key={track.id}
              data-timeline-track
              className="relative h-12 border-b border-white/8 bg-[linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[length:10%_100%]"
            >
              {track.clips.map((clip) => (
                <div
                  key={clip.id}
                  onClick={() => setEditor({ selectedClipId: clip.id })}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      setEditor({ selectedClipId: clip.id });
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  className={cn(
                    'absolute top-1.5 h-9 overflow-hidden rounded-md border px-2 text-left text-[10px]',
                    track.id === 'script-voice'
                      ? 'border-emerald-700/40 bg-emerald-900/30 text-emerald-200'
                      : 'border-cyan-700/40 bg-cyan-900/35 text-cyan-100',
                    editor.selectedClipId === clip.id && 'ring-2 ring-primary',
                  )}
                  style={{ left: `${clip.left}%`, width: `${clip.width}%` }}
                >
                  <span className="block truncate">{clip.name || t('timeline.untitledClip')}</span>
                  {track.id === 'script-voice' && (
                    <span className="absolute inset-x-2 bottom-1 h-1 bg-[repeating-linear-gradient(90deg,rgba(110,231,183,.45)_0_2px,transparent_2px_5px)]" />
                  )}
                  {editor.selectedClipId === clip.id && (
                    <span
                      role="separator"
                      aria-label="Kéo để chỉnh thời lượng cảnh"
                      aria-orientation="vertical"
                      className="absolute inset-y-0 right-0 z-10 w-2 cursor-ew-resize border-r-2 border-primary bg-primary/20 hover:bg-primary/40"
                      onClick={(event) => event.stopPropagation()}
                      onPointerDown={(event) => {
                        event.stopPropagation();
                        const trackElement = event.currentTarget.closest('[data-timeline-track]');
                        if (!(trackElement instanceof HTMLElement)) return;
                        event.currentTarget.setPointerCapture(event.pointerId);
                        resizeStateRef.current = {
                          sceneId: clip.sceneId,
                          startX: event.clientX,
                          startDuration: clip.durationSeconds,
                          trackWidth: trackElement.getBoundingClientRect().width,
                          totalSeconds: timeline.totalSeconds,
                        };
                      }}
                      onPointerMove={(event) => {
                        const resize = resizeStateRef.current;
                        if (!resize || !event.currentTarget.hasPointerCapture(event.pointerId)) {
                          return;
                        }
                        const scene = useProductionFlowStore
                          .getState()
                          .projects[projectId]?.scenes.find((item) => item.id === resize.sceneId);
                        if (!scene) return;

                        const deltaSeconds =
                          ((event.clientX - resize.startX) / resize.trackWidth) *
                          resize.totalSeconds;
                        const durationSeconds = roundSceneDuration(
                          Math.max(
                            getMinimumSceneDuration(scene),
                            resize.startDuration + deltaSeconds,
                          ),
                        );
                        updateSceneTiming(projectId, resize.sceneId, { durationSeconds });
                      }}
                      onPointerUp={(event) => {
                        const resize = resizeStateRef.current;
                        resizeStateRef.current = null;
                        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                          event.currentTarget.releasePointerCapture(event.pointerId);
                        }
                        if (!resize) return;
                        void persistSceneTiming(projectId, resize.sceneId).catch((error: unknown) =>
                          notify(`Không lưu được thời lượng cảnh: ${getApiError(error).message}`),
                        );
                      }}
                      onPointerCancel={(event) => {
                        const resize = resizeStateRef.current;
                        resizeStateRef.current = null;
                        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                          event.currentTarget.releasePointerCapture(event.pointerId);
                        }
                        if (resize) {
                          void persistSceneTiming(projectId, resize.sceneId).catch(
                            (error: unknown) =>
                              notify(
                                `Không lưu được thời lượng cảnh: ${getApiError(error).message}`,
                              ),
                          );
                        }
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          ))}
          <button
            className="absolute bottom-0 top-0 z-20 w-px bg-primary"
            onPointerDown={(event) => event.currentTarget.setPointerCapture(event.pointerId)}
            onPointerMove={(event) => {
              if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                const box = event.currentTarget.parentElement?.getBoundingClientRect();
                if (box)
                  setEditor({
                    playhead: Math.max(
                      0,
                      Math.min(
                        timeline.totalSeconds,
                        ((event.clientX - box.left) / box.width) * timeline.totalSeconds,
                      ),
                    ),
                  });
              }
            }}
            style={{
              left: `${(Math.min(editor.playhead, timeline.totalSeconds) / timeline.totalSeconds) * 100}%`,
            }}
            aria-label={t('timeline.playhead')}
          >
            <span className="absolute -left-1.5 top-0 size-3 rotate-45 bg-primary" />
          </button>
          {scenes.length === 0 && (
            <div className="pointer-events-none absolute inset-7 grid place-items-center border border-dashed border-white/10 bg-black/10 text-center">
              <div>
                <p className="text-xs font-medium text-zinc-300">{t('timeline.emptyTitle')}</p>
                <p className="mt-1 text-[10px] text-zinc-500">{t('timeline.emptyDescription')}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Inspector({ project }: { project: ProjectRecord }) {
  const { t } = useTranslation('editor');
  const notify = useStudioStore((state) => state.notify);
  const updateSceneTiming = useProductionFlowStore((state) => state.updateSceneTiming);
  const persistSceneTiming = useProductionFlowStore((state) => state.persistSceneTiming);
  const selectedClipId = useStudioStore((state) => state.editor.selectedClipId);
  const [voiceJob, setVoiceJob] = useState<{
    clipId: string;
    status: string;
    progress: number;
    audioUrl?: string | null;
  } | null>(null);
  const [voiceBusy, setVoiceBusy] = useState(false);
  const scenes = useProductionFlowStore(
    (state) => state.projects[project.id]?.scenes ?? EMPTY_PRODUCTION_SCENES,
  );
  const timeline = useMemo(() => buildTimelineFromScenes(scenes), [scenes]);
  const selectedClip = timeline.rows
    .flatMap((row) => row.clips)
    .find((clip) => clip.id === selectedClipId);
  const selectedScene = scenes.find((scene) => scene.id === selectedClip?.sceneId);
  const minimumSceneDuration = selectedScene ? getMinimumSceneDuration(selectedScene) : 1;
  const selectedVoiceJob = voiceJob?.clipId === selectedClip?.id ? voiceJob : null;
  const canGenerateVoice = selectedClip?.type === 'voice' && selectedClip.content.trim().length > 0;

  const handleGenerateVoice = async () => {
    if (!selectedClip || selectedClip.type !== 'voice' || !selectedClip.content.trim()) return;

    setVoiceBusy(true);
    setVoiceJob({
      clipId: selectedClip.id,
      status: 'Queued',
      progress: 0,
    });

    try {
      const result = await prepareProjectVoicePlayback(
        project.id,
        [{ id: selectedClip.sceneId, narration: selectedClip.content }],
        (progress) => {
          const percentage =
            progress.total > 0 ? Math.round((progress.ready / progress.total) * 100) : 0;
          setVoiceJob({
            clipId: selectedClip.id,
            status: progress.status === 'ready' ? 'Completed' : 'Processing',
            progress: percentage,
          });
        },
      );
      const audioUrl = result.audioUrls[selectedClip.sceneId];
      if (!audioUrl) throw new Error('Cảnh đã hoàn thành nhưng không trả về audioUrl.');

      setVoiceJob({
        clipId: selectedClip.id,
        status: 'Completed',
        progress: 100,
        audioUrl,
      });

      await new Audio(audioUrl).play();
      notify('Đã tạo và phát giọng đọc cho clip đã chọn');
    } catch (error: unknown) {
      const apiError = getApiError(error);
      notify(`Không tạo được giọng đọc: ${apiError.message}`);
    } finally {
      setVoiceBusy(false);
    }
  };

  const handlePlayGeneratedVoice = async () => {
    if (!selectedVoiceJob?.audioUrl) return;

    try {
      await new Audio(selectedVoiceJob.audioUrl).play();
    } catch (error: unknown) {
      const apiError = getApiError(error);
      notify(`Không phát được audio: ${apiError.message}`);
    }
  };

  return (
    <aside className="hidden min-h-0 overflow-auto border-l border-white/8 bg-[#111517] p-4 2xl:block">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold">{t('inspector.title')}</h2>
        <PanelRight className="size-4 text-zinc-600" />
      </div>
      <div className="mt-5 aspect-video rounded-lg border border-white/8 bg-[#1d2529]" />
      <dl className="mt-5 space-y-4 text-xs">
        <InspectorField
          label={t('inspector.selection')}
          value={selectedClip?.name || t('inspector.noSelection')}
        />
        {selectedClip && (
          <>
            <InspectorField
              label={t('inspector.clipType')}
              value={t(`inspector.clipTypes.${selectedClip.type}`)}
            />
            <InspectorField
              label={t('inspector.position')}
              value={formatTime(selectedClip.startSeconds)}
            />
            <div>
              <dt className="text-zinc-500">{t('inspector.duration')}</dt>
              <dd className="mt-1">
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={minimumSceneDuration}
                    max={3600}
                    step={0.1}
                    value={selectedClip.durationSeconds}
                    onChange={(event) => {
                      if (!selectedScene) return;
                      const parsed = Number(event.target.value);
                      if (!Number.isFinite(parsed)) return;
                      updateSceneTiming(project.id, selectedScene.id, {
                        durationSeconds: roundSceneDuration(Math.max(minimumSceneDuration, parsed)),
                      });
                    }}
                    onBlur={() => {
                      if (!selectedScene) return;
                      void persistSceneTiming(project.id, selectedScene.id).catch(
                        (error: unknown) =>
                          notify(`Không lưu được thời lượng cảnh: ${getApiError(error).message}`),
                      );
                    }}
                    className="h-8 w-full rounded-md border border-white/10 bg-black/20 px-2 font-mono text-xs text-zinc-200 outline-none focus:border-primary"
                    aria-label="Thời lượng cảnh tính bằng giây"
                  />
                  <span className="text-[10px] text-zinc-500">giây</span>
                </div>
                {selectedScene?.voiceDurationSeconds ? (
                  <p className="mt-1 text-[10px] text-emerald-400/80">
                    Tối thiểu {minimumSceneDuration.toFixed(1)}s để đọc hết lời
                  </p>
                ) : null}
              </dd>
            </div>
            <InspectorField
              label={t('inspector.content')}
              value={selectedClip.content || t('inspector.noContent')}
            />
          </>
        )}
        <InspectorField
          label={t('inspector.projectFormat')}
          value={`${project.aspectRatio} / ${project.frameRate} fps`}
        />
      </dl>
      <div className="mt-6 border-t border-white/8 pt-4">
        <button className="flex w-full items-center justify-between text-xs">
          <span>{t('inspector.transform')}</span>
          <ChevronDown className="size-3.5 text-zinc-500" />
        </button>
        <div className="mt-4 space-y-3">
          <button className="flex w-full items-center justify-between text-xs">
            <span>{t('inspector.audio')}</span>
            <ChevronDown className="size-3.5 text-zinc-500" />
          </button>
          {selectedClip?.type === 'voice' && (
            <div className="rounded-md border border-white/8 bg-black/15 p-2.5">
              <Button
                size="sm"
                className="w-full justify-center"
                disabled={!canGenerateVoice || voiceBusy}
                onClick={() => {
                  if (selectedVoiceJob?.audioUrl) {
                    void handlePlayGeneratedVoice();
                  } else {
                    void handleGenerateVoice();
                  }
                }}
              >
                {voiceBusy ? (
                  <RefreshCw className="mr-2 size-3.5 animate-spin" />
                ) : (
                  <Volume2 className="mr-2 size-3.5" />
                )}
                {selectedVoiceJob?.audioUrl ? 'Phát giọng đọc' : 'Tạo giọng đọc'}
              </Button>
              {selectedVoiceJob && (
                <p className="mt-2 font-mono text-[10px] text-zinc-500">
                  {selectedVoiceJob.status} · {selectedVoiceJob.progress}%
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

function InspectorField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="mb-1 text-[10px] text-zinc-500">{label}</dt>
      <dd className="rounded-md border border-white/8 bg-black/15 px-2.5 py-2 text-zinc-300">
        {value}
      </dd>
    </div>
  );
}

function AssetLibrary() {
  const { t } = useTranslation();
  const workspaceId = useStudioStore((state) => state.currentWorkspaceId);
  const allAssets = useStudioStore((state) => state.assets);
  const assets = allAssets.filter((asset) => asset.workspaceId === workspaceId);
  const view = useStudioStore((state) => state.ui.assetView);
  const setUi = useStudioStore((state) => state.setUi);
  const notify = useStudioStore((state) => state.notify);
  const [search, setSearch] = useState('');
  const [kind, setKind] = useState<'All' | AssetPipelineType>('All');
  const [tag, setTag] = useState('');
  const [provider, setProvider] = useState('');
  const [workflow, setWorkflow] = useState('');
  const [version, setVersion] = useState('');
  const [folder, setFolder] = useState('All assets');
  const [selectedId, setSelectedId] = useState(assets[0]?.id);
  const [mediaTab, setMediaTab] = useState<'Uploads' | 'Images' | 'Videos' | 'Pexels'>('Uploads');
  const folders = ['All assets', ...Array.from(new Set(assets.map((asset) => asset.folder)))];
  const visible = assets.filter(
    (asset) =>
      (folder === 'All assets' || asset.folder === folder) &&
      (mediaTab === 'Images' ? asset.kind === 'Image' : true) &&
      (mediaTab === 'Videos' ? asset.kind === 'Video' : true) &&
      matchesAssetFilters(asset, {
        text: search,
        type: kind,
        tag,
        provider,
        workflow,
        version,
      }),
  );
  const selected = assets.find((asset) => asset.id === selectedId);

  return (
    <div className="mx-auto max-w-[1500px]">
      <PageHeader
        title={t('assetLibrary.title')}
        description={t('assetLibrary.description')}
        action={
          <Button onClick={() => notify('Mock upload queued in Asset Ingestion')}>
            <Upload className="mr-2 size-4" />
            {t('assetLibrary.uploadAsset')}
          </Button>
        }
      />
      <div
        className="mb-4 flex overflow-x-auto rounded-xl border border-border bg-card p-1"
        role="tablist"
        aria-label="Media library sources"
      >
        {(['Uploads', 'Images', 'Videos', 'Pexels'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={mediaTab === tab}
            onClick={() => setMediaTab(tab)}
            className={cn(
              'min-w-24 rounded-lg px-4 py-2 text-sm font-medium transition-colors',
              mediaTab === tab
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground',
            )}
          >
            {tab === 'Uploads'
              ? t('assetLibrary.tabs.uploads')
              : tab === 'Images'
                ? t('assetLibrary.tabs.images')
                : tab === 'Videos'
                  ? t('assetLibrary.tabs.videos')
                  : 'Pexels'}
          </button>
        ))}
      </div>
      {mediaTab === 'Pexels' ? (
        <PexelsLibrary />
      ) : (
        <div className="grid gap-4 lg:grid-cols-[190px_minmax(0,1fr)_260px]">
          <Card className="p-3">
            <p className="px-2 py-2 text-xs font-semibold">{t('assetLibrary.folders')}</p>
            <div className="mt-1 space-y-1">
              {folders.map((item) => (
                <button
                  key={item}
                  onClick={() => setFolder(item)}
                  className={cn(
                    'flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm',
                    folder === item
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                  )}
                >
                  {item === 'All assets' ? (
                    <FolderOpen className="size-4" />
                  ) : (
                    <Folder className="size-4" />
                  )}
                  <span className="truncate">
                    {item === 'All assets' ? t('assetLibrary.allAssets') : item}
                  </span>
                </button>
              ))}
            </div>
            <p className="mt-6 px-2 text-[10px] text-muted-foreground">Workspace {workspaceId}</p>
          </Card>
          <section>
            <Card className="mb-4 grid gap-3 p-3 sm:grid-cols-2 xl:grid-cols-3">
              <div className="relative xl:col-span-2">
                <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                <Input
                  className="pl-9"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={t('assetLibrary.searchPlaceholder')}
                />
              </div>
              <select
                aria-label="Asset type"
                className="studio-select"
                value={kind}
                onChange={(event) => setKind(event.target.value as 'All' | AssetPipelineType)}
              >
                <option value="All">{t('assetLibrary.allKinds')}</option>
                {assetPipelineTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              <Input
                aria-label="Asset tag"
                value={tag}
                onChange={(event) => setTag(event.target.value)}
                placeholder={t('assetLibrary.tagPlaceholder')}
              />
              <select
                aria-label="Asset provider"
                className="studio-select"
                value={provider}
                onChange={(event) => setProvider(event.target.value)}
              >
                <option value="">{t('assetLibrary.providerPlaceholder')}</option>
                <option>mock-video</option>
                <option>mock-indexer</option>
                <option>mock-import</option>
              </select>
              <select
                aria-label="Asset workflow"
                className="studio-select"
                value={workflow}
                onChange={(event) => setWorkflow(event.target.value)}
              >
                <option value="">{t('assetLibrary.workflowPlaceholder')}</option>
                <option>idea</option>
                <option>scene</option>
                <option>quality-review</option>
              </select>
              <select
                aria-label="Asset version"
                className="studio-select"
                value={version}
                onChange={(event) => setVersion(event.target.value)}
              >
                <option value="">{t('assetLibrary.versionPlaceholder')}</option>
                <option value="1">v1</option>
                <option value="2">v2</option>
                <option value="3">v3</option>
              </select>
              <div className="flex rounded-lg border border-border p-0.5">
                <button
                  className={cn('rounded-md p-2', view === 'grid' && 'bg-accent')}
                  onClick={() => setUi({ assetView: 'grid' })}
                  aria-label="Grid view"
                >
                  <Grid2X2 className="size-4" />
                </button>
                <button
                  className={cn('rounded-md p-2', view === 'list' && 'bg-accent')}
                  onClick={() => setUi({ assetView: 'list' })}
                  aria-label="List view"
                >
                  <List className="size-4" />
                </button>
              </div>
            </Card>
            {visible.length === 0 ? (
              <EmptyState
                icon={<Boxes className="size-5" />}
                title={t('assetLibrary.noAssetsTitle')}
                description={t('assetLibrary.noAssetsDesc')}
              />
            ) : view === 'grid' ? (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {visible.map((asset) => (
                  <AssetTile
                    key={asset.id}
                    asset={asset}
                    selected={asset.id === selectedId}
                    onClick={() => setSelectedId(asset.id)}
                  />
                ))}
              </div>
            ) : (
              <DataTable columns={['Name', 'Type', 'Folder', 'Size', 'Duration']}>
                {visible.map((asset) => (
                  <tr
                    key={asset.id}
                    onClick={() => setSelectedId(asset.id)}
                    className={cn(
                      'cursor-pointer hover:bg-accent/50',
                      asset.id === selectedId && 'bg-primary/5',
                    )}
                  >
                    <td className="px-4 py-3 font-medium">{asset.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{asset.kind}</td>
                    <td className="px-4 py-3 text-muted-foreground">{asset.folder}</td>
                    <td className="px-4 py-3 font-mono text-xs">{asset.size}</td>
                    <td className="px-4 py-3 font-mono text-xs">{asset.duration ?? '-'}</td>
                  </tr>
                ))}
              </DataTable>
            )}
          </section>
          <Card className="h-fit overflow-hidden">
            {selected ? (
              <AssetVersionPanel
                key={selected.id}
                asset={selected}
                onNotify={notify}
                preview={
                  selected.thumbnailUrl ? (
                    <img
                      src={selected.thumbnailUrl}
                      alt=""
                      className="aspect-video w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div
                      className="grid aspect-video place-items-center"
                      style={{ backgroundColor: selected.color }}
                    >
                      <AssetIcon kind={selected.kind} className="size-9 text-white/70" />
                    </div>
                  )
                }
              />
            ) : (
              <EmptyState
                icon={<ImageIcon className="size-5" />}
                title={t('assetLibrary.selectAssetTitle')}
                description={t('assetLibrary.selectAssetDesc')}
              />
            )}
          </Card>
        </div>
      )}
    </div>
  );
}

function AssetTile({
  asset,
  selected,
  onClick,
}: {
  asset: ReturnType<typeof useStudioStore.getState>['assets'][number];
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'overflow-hidden rounded-xl border bg-card text-left transition-colors',
        selected
          ? 'border-primary ring-2 ring-primary/15'
          : 'border-border hover:border-primary/50',
      )}
    >
      {asset.thumbnailUrl ? (
        <img
          src={asset.thumbnailUrl}
          alt=""
          className="aspect-video w-full object-cover"
          loading="lazy"
        />
      ) : (
        <div
          className="grid aspect-video place-items-center"
          style={{ backgroundColor: asset.color }}
        >
          <AssetIcon kind={asset.kind} className="size-7 text-white/70" />
        </div>
      )}
      <div className="p-3">
        <p className="truncate text-sm font-medium">{asset.name}</p>
        <div className="mt-2 flex justify-between text-xs text-muted-foreground">
          <span>{asset.kind}</span>
          <span>{asset.size}</span>
        </div>
      </div>
    </button>
  );
}

function AssetIcon({ kind, className }: { kind: AssetKind; className?: string }) {
  const Icon = kind === 'Video' ? Video : kind === 'Audio' ? Music2 : ImageIcon;
  return <Icon className={className} />;
}

function JobCenter() {
  const { t } = useTranslation();
  const workspaceId = useStudioStore((state) => state.currentWorkspaceId);
  const allJobs = useStudioStore((state) => state.jobs);
  const jobs = allJobs.filter((job) => job.workspaceId === workspaceId);
  const retryJob = useStudioStore((state) => state.retryJob);
  const [status, setStatus] = useState<'All' | JobStatus>('All');
  const visible = status === 'All' ? jobs : jobs.filter((job) => job.status === status);
  const statusLabels: Record<string, string> = {
    All: t('jobCenter.all', 'Tất cả'),
    Queued: t('common.queued', 'Trong hàng đợi'),
    Running: t('common.running', 'Đang chạy'),
    Success: t('common.success', 'Thành công'),
    Failed: t('common.failed', 'Thất bại'),
  };
  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title={t('nav.jobs', 'Trung tâm công việc')}
        description={t(
          'jobCenter.description',
          'Trạng thái hàng đợi và thực thi các tác vụ studio kéo dài.',
        )}
      />
      <div className="mb-4 flex flex-wrap gap-2">
        {(['All', 'Queued', 'Running', 'Success', 'Failed'] as const).map((item) => (
          <button
            key={item}
            onClick={() => setStatus(item)}
            className={cn(
              'rounded-lg border px-3 py-2 text-sm',
              status === item
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border bg-card text-muted-foreground hover:text-foreground',
            )}
          >
            {statusLabels[item] ?? item}
            <span className="ml-2 font-mono text-xs">
              {item === 'All' ? jobs.length : jobs.filter((job) => job.status === item).length}
            </span>
          </button>
        ))}
      </div>
      <DataTable
        columns={[
          t('jobCenter.colJob', 'Công việc'),
          t('jobCenter.colSubject', 'Đối tượng'),
          t('common.status', 'Trạng thái'),
          t('admin.jobs.progress', 'Tiến độ'),
          t('jobCenter.colCreated', 'Ngày tạo'),
          '',
        ]}
      >
        {visible.map((job) => (
          <tr key={job.id}>
            <td className="px-4 py-4">
              <p className="font-medium">{job.type}</p>
              <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">{job.id}</p>
            </td>
            <td className="px-4 py-4 text-muted-foreground">{job.subject}</td>
            <td className="px-4 py-4">
              <StatusLabel status={job.status} />
            </td>
            <td className="w-48 px-4 py-4">
              {job.status === 'Running' ? (
                <div className="flex items-center gap-3">
                  <Progress value={job.progress} className="flex-1" />
                  <span className="font-mono text-xs">{job.progress}%</span>
                </div>
              ) : (
                <span className="text-xs text-muted-foreground">{job.progress}%</span>
              )}
            </td>
            <td className="px-4 py-4 text-xs text-muted-foreground">
              {relativeTime(job.createdAt)}
            </td>
            <td className="px-4 py-4 text-right">
              {job.status === 'Failed' && (
                <Button size="sm" variant="outline" onClick={() => retryJob(job.id)}>
                  <RefreshCw className="mr-2 size-3.5" />
                  {t('common.retry', 'Thử lại')}
                </Button>
              )}
            </td>
          </tr>
        ))}
      </DataTable>
    </div>
  );
}

function RenderCenter() {
  const { t } = useTranslation();
  const workspaceId = useStudioStore((state) => state.currentWorkspaceId);
  const allProjects = useStudioStore((state) => state.projects);
  const projects = useMemo(
    () =>
      allProjects.filter(
        (project) => project.workspaceId === workspaceId && project.status !== 'Archived',
      ),
    [allProjects, workspaceId],
  );
  const notify = useStudioStore((state) => state.notify);
  const [tab, setTab] = useState<'Queue' | 'History' | 'Exports'>('Queue');
  const [exports, setExports] = useState<ApiSchema<'ExportSummaryDto'>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);

  const loadExports = useCallback(async () => {
    if (projects.length === 0) {
      setExports([]);
      setError(null);
      setLoading(false);
      return;
    }
    try {
      const responses = await Promise.all(
        projects.map((project) => ExportApi.list(project.id, { page: 1, pageSize: 100 })),
      );
      setExports(
        responses
          .flatMap((response) => response.data?.items ?? [])
          .sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? '')),
      );
      setError(null);
    } catch (loadError) {
      setError(getApiError(loadError).message);
    } finally {
      setLoading(false);
    }
  }, [projects]);

  useEffect(() => {
    void loadExports();
  }, [loadExports]);

  const hasActiveExport = exports.some((item) => item.status !== undefined && item.status <= 3);
  useEffect(() => {
    if (!hasActiveExport) return;
    const interval = window.setInterval(() => void loadExports(), 10_000);
    return () => window.clearInterval(interval);
  }, [hasActiveExport, loadExports]);

  const runExportAction = async (id: string, action: 'cancel' | 'retry') => {
    setActionId(id);
    try {
      if (action === 'cancel') await ExportApi.cancel(id);
      else await ExportApi.retry(id);
      notify(
        action === 'cancel'
          ? t('renderCenter.cancelled', 'Đã hủy tác vụ xuất video.')
          : t('renderCenter.retried', 'Đã đưa tác vụ trở lại hàng đợi.'),
      );
      await loadExports();
    } catch (actionError) {
      notify(
        t('renderCenter.actionFailed', 'Không thể cập nhật tác vụ: {{message}}', {
          message: getApiError(actionError).message,
        }),
      );
    } finally {
      setActionId(null);
    }
  };

  const downloadExport = async (id: string) => {
    setActionId(id);
    try {
      const response = await ExportApi.download(id);
      const disposition = String(response.headers['content-disposition'] ?? '');
      const encodedName = disposition.match(/filename\*=UTF-8''([^;]+)/i)?.[1];
      const plainName = disposition.match(/filename="?([^";]+)"?/i)?.[1];
      const fallbackExtension = String(response.headers['content-type'] ?? '').includes('application/json')
        ? 'json'
        : 'mp4';
      const fileName = encodedName
        ? decodeURIComponent(encodedName)
        : (plainName ?? `export-${id}.${fallbackExtension}`);
      const url = URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (downloadError) {
      notify(
        t('renderCenter.downloadFailed', 'Không thể tải tệp xuất: {{message}}', {
          message: getApiError(downloadError).message,
        }),
      );
    } finally {
      setActionId(null);
    }
  };

  const tabLabels: Record<string, string> = {
    Queue: t('renderCenter.tabQueue', 'Hàng đợi'),
    History: t('renderCenter.tabHistory', 'Lịch sử'),
    Exports: t('renderCenter.tabExports', 'Xuất file'),
  };
  const visible =
    tab === 'Queue'
      ? exports.filter((item) => item.status !== undefined && item.status <= 3)
      : tab === 'History'
        ? exports.filter((item) => item.status !== undefined && item.status >= 4)
        : exports.filter((item) => item.status === 4);
  const statusLabels = [
    t('renderCenter.status.pending', 'Đang chờ'),
    t('renderCenter.status.preparing', 'Đang chuẩn bị'),
    t('renderCenter.status.rendering', 'Đang dựng'),
    t('renderCenter.status.muxing', 'Đang đóng gói'),
    t('renderCenter.status.completed', 'Hoàn thành'),
    t('renderCenter.status.failed', 'Thất bại'),
    t('renderCenter.status.cancelled', 'Đã hủy'),
  ];
  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title={t('nav.renders', 'Trung tâm xuất video')}
        description={t(
          'renderCenter.description',
          'Hàng đợi xuất video, lịch sử hoàn thành và các tệp sẵn sàng xuất.',
        )}
      />
      <div className="mb-5 flex border-b border-border">
        {(['Queue', 'History', 'Exports'] as const).map((item) => (
          <button
            key={item}
            onClick={() => setTab(item)}
            className={cn(
              'border-b-2 px-4 py-3 text-sm',
              tab === item
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground',
            )}
          >
            {tabLabels[item] ?? item}
          </button>
        ))}
      </div>
      {loading ? (
        <LoadingState label={t('renderCenter.loading', 'Đang tải hàng đợi xuất video...')} />
      ) : error ? (
        <EmptyState
          icon={<Film className="size-5" />}
          title={t('renderCenter.loadFailed', 'Không tải được hàng đợi')}
          description={error}
          action={
            <Button variant="outline" onClick={() => void loadExports()}>
              <RefreshCw className="mr-2 size-4" />
              {t('common.retry', 'Thử lại')}
            </Button>
          }
        />
      ) : visible.length ? (
        <div className="space-y-3">
          {visible.map((item) => {
            const project = projects.find((candidate) => candidate.id === item.projectId);
            const isActive = item.status !== undefined && item.status <= 3;
            const downloadable = item.status === 4 && Boolean(item.outputPath) && Boolean(item.id);
            return (
              <Card key={item.id} className="flex flex-col gap-4 p-5 md:flex-row md:items-center">
                <div className="grid size-11 place-items-center rounded-lg bg-muted">
                  <Film className="size-5 text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-semibold">{project?.name ?? item.projectId}</h2>
                    <span className="rounded-md border border-border bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                      {statusLabels[item.status ?? 0]}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {item.resolution ?? 'MP4'} / {item.progress ?? 0}%
                  </p>
                  {isActive && <Progress value={item.progress ?? 0} className="mt-3 max-w-md" />}
                </div>
                <div className="flex items-center gap-2">
                  {downloadable && (
                  <Button
                    variant="outline"
                    loading={actionId === item.id}
                    onClick={() => void downloadExport(item.id!)}
                  >
                    <Download className="mr-2 size-4" />
                    {t('renderCenter.download', 'Tải tệp xuất')}
                  </Button>
                  )}
                  {isActive && item.id && (
                    <Button
                      variant="outline"
                      loading={actionId === item.id}
                      onClick={() => void runExportAction(item.id!, 'cancel')}
                    >
                      {t('common.cancel', 'Hủy')}
                    </Button>
                  )}
                  {item.status === 5 && item.id && (
                    <Button
                      variant="outline"
                      loading={actionId === item.id}
                      onClick={() => void runExportAction(item.id!, 'retry')}
                    >
                      <RefreshCw className="mr-2 size-4" />
                      {t('common.retry', 'Thử lại')}
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={<Film className="size-5" />}
          title={t('renderCenter.emptyTitle', 'Không có mục nào')}
          description={t(
            'renderCenter.emptyDesc',
            'Bản ghi xuất video sẽ xuất hiện ở đây khi có tác vụ tương ứng.',
          )}
        />
      )}
    </div>
  );
}

function ProviderRegistry() {
  return <AiProvidersScreen />;
}

function SettingsCenter() {
  const { t } = useTranslation();
  const user = useStudioStore((state) => state.user);
  const featureFlags = useStudioStore((state) => state.featureFlags);
  const setFeatureFlag = useStudioStore((state) => state.setFeatureFlag);
  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title={t('settings.title', 'Settings')}
        description={t(
          'settings.description',
          'Environment, feature flags and effective user settings.',
        )}
      />
      <div className="space-y-5">
        <Card className="p-5">
          <h2 className="font-semibold">{t('settings.language', 'Interface Language')}</h2>
          <p className="mb-4 text-xs text-muted-foreground">
            {t('settings.selectLanguage', 'Select Display Language')}
          </p>
          <LanguageSwitcher variant="full" />
        </Card>
        <Card className="p-5">
          <h2 className="font-semibold">{t('settings.userSession', 'User session')}</h2>
          <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs text-muted-foreground">{t('common.user', 'Name')}</dt>
              <dd className="mt-1">{user?.name}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">{t('common.role', 'Role')}</dt>
              <dd className="mt-1">{user?.role}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">{t('common.email', 'Email')}</dt>
              <dd className="mt-1">{user?.email}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Authentication</dt>
              <dd className="mt-1">Local mock session</dd>
            </div>
          </dl>
        </Card>
        <Card className="p-5">
          <h2 className="font-semibold">{t('settings.environment', 'Environment')}</h2>
          <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs text-muted-foreground">API mode</dt>
              <dd className="mt-1">Mock foundation</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Storage</dt>
              <dd className="mt-1">Browser persistence</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Theme</dt>
              <dd className="mt-1">Dark creative workspace</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Logging</dt>
              <dd className="mt-1">Client console transport</dd>
            </div>
          </dl>
        </Card>
        <Card className="p-5">
          <h2 className="font-semibold">{t('settings.featureFlags', 'Feature flags')}</h2>
          <div className="mt-4 divide-y divide-border">
            {Object.entries(featureFlags).map(([key, enabled]) => (
              <label key={key} className="flex items-center justify-between py-3 text-sm">
                <span>{key}</span>
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={(event) => setFeatureFlag(key, event.target.checked)}
                  className="size-4 accent-[hsl(var(--primary))]"
                />
              </label>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function StatusIcon({ status }: { status: JobStatus }) {
  if (status === 'Success')
    return (
      <span className="grid size-6 place-items-center rounded-md bg-emerald-500/10 text-emerald-400">
        <Check className="size-3.5" />
      </span>
    );
  if (status === 'Failed')
    return (
      <span className="grid size-6 place-items-center rounded-md bg-red-500/10 text-red-400">
        <X className="size-3.5" />
      </span>
    );
  if (status === 'Running')
    return (
      <span className="grid size-6 place-items-center rounded-md bg-cyan-500/10 text-cyan-400">
        <RefreshCw className="size-3.5 animate-spin" />
      </span>
    );
  return (
    <span className="grid size-6 place-items-center rounded-md bg-zinc-500/10 text-zinc-400">
      <Clock3 className="size-3.5" />
    </span>
  );
}

function StatusLabel({ status, label }: { status: JobStatus; label?: string }) {
  return (
    <span
      className={cn(
        'inline-flex rounded-md px-2 py-1 text-[11px] font-medium',
        status === 'Success'
          ? 'bg-emerald-500/10 text-emerald-400'
          : status === 'Failed'
            ? 'bg-red-500/10 text-red-400'
            : status === 'Running'
              ? 'bg-cyan-500/10 text-cyan-400'
              : 'bg-zinc-500/10 text-zinc-400',
      )}
    >
      {label ?? status}
    </span>
  );
}

function ErrorPage({
  code,
  title,
  detail,
  action,
}: {
  code: string;
  title: string;
  detail: string;
  action: () => void;
}) {
  return (
    <div className="grid min-h-[calc(100dvh-8rem)] place-items-center p-6 text-center">
      <div>
        <p className="font-mono text-sm text-primary">{code}</p>
        <h1 className="mt-3 text-2xl font-semibold">{title}</h1>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">{detail}</p>
        <Button className="mt-6" onClick={action}>
          <House className="mr-2 size-4" />
          Return to dashboard
        </Button>
      </div>
    </div>
  );
}

function relativeTime(value: string) {
  const difference = Math.max(0, Date.now() - Date.parse(value));
  const hours = Math.floor(difference / 3_600_000);
  if (hours < 1) return 'Less than an hour ago';
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function formatTime(seconds: number) {
  const whole = Math.floor(seconds);
  const frames = Math.floor((seconds - whole) * 24);
  return `00:00:${String(whole).padStart(2, '0')}:${String(frames).padStart(2, '0')}`;
}
