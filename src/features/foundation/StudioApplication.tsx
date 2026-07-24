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
  Download,
  Film,
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
  MoreHorizontal,
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
  Upload,
  Video,
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
  useEffect,
  useState,
} from 'react';
import { Button } from '@/components/ui/Button';
import {
  Card,
  DataTable,
  Dialog,
  EmptyState,
  Input,
  Progress,
  ToastMessage,
} from '@/components/ui/Foundation';
import {
  type AssetKind,
  type JobStatus,
  type ProjectRecord,
  useStudioStore,
} from '@/state/studioStore';
import { cn } from '@/core/utils/cn';
import { appLogger } from '@/core/logger';
import { WorkflowPanel } from '@/features/workflow';
import {
  AssetVersionPanel,
  CompactAssetVersions,
  assetPipelineTypes,
  getAssetPipelineDetail,
  matchesAssetFilters,
  type AssetPipelineType,
} from '@/features/asset-pipeline';
import { AiProvidersScreen } from '@/features/ai-providers';
import { CommercialScreen, type CommercialTab } from '@/features/commercial';
import { GenerationScreen } from '@/features/generation';
import { AdminConsoleScreen, type AdminTab } from '@/features/admin';
import { CreditCard, ShieldCheck } from 'lucide-react';

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
  if (['commercial', 'billing', 'profile', 'subscription', 'credits', 'pricing', 'invoices', 'usage'].includes(parts[0])) {
    const tabMap: Record<string, CommercialTab> = {
      commercial: 'profile',
      billing: 'subscription',
      profile: 'profile',
      subscription: 'subscription',
      credits: 'credits',
      pricing: 'pricing',
      invoices: 'invoices',
      usage: 'usage'
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
    return { failed: true, errorId, errorMessage: error.message || 'An unexpected rendering error occurred.' };
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
            <p className="text-xs text-slate-400">
              {this.state.errorMessage}
            </p>
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-left text-[11px] font-mono text-slate-400 flex justify-between items-center">
              <span className="truncate">Correlation ID: {this.state.errorId}</span>
              <button
                onClick={() => navigator.clipboard.writeText(this.state.errorId)}
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
  const user = useStudioStore((state) => state.user);
  const session = useStudioStore((state) => state.session);
  const refreshSession = useStudioStore((state) => state.refreshSession);
  const toast = useStudioStore((state) => state.ui.toast);
  const clearToast = useStudioStore((state) => state.clearToast);

  useEffect(() => {
    if (session && session.expiresAt <= Date.now()) refreshSession();
  }, [refreshSession, session]);

  useEffect(() => {
    if (!user && route.name !== 'login') navigate('/login', true);
    if (user && route.name === 'login') navigate('/dashboard', true);
  }, [route.name, user]);

  if (!user) return <LoginScreen onAuthenticated={() => navigate('/dashboard', true)} />;

  return (
    <ScreenErrorBoundary onReset={() => navigate('/dashboard')}>
      <AppShell route={route} navigate={navigate}>
        <RouteScreen route={route} navigate={navigate} />
      </AppShell>
      {toast && <ToastMessage message={toast} onClose={clearToast} />}
    </ScreenErrorBoundary>
  );
}

function LoginScreen({ onAuthenticated }: { onAuthenticated: () => void }) {
  const login = useStudioStore((state) => state.login);
  const [email, setEmail] = useState('owner@northstar.studio');
  const [password, setPassword] = useState('studio-demo');
  const [error, setError] = useState('');

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setError('');
    if (!login(email, password)) {
      setError('Enter both email and password.');
      return;
    }
    appLogger.info('User session created', { mode: 'mock' });
    onAuthenticated();
  };

  return (
    <main className="grid min-h-[100dvh] bg-background text-foreground lg:grid-cols-[1.1fr_0.9fr]">
      <section className="hidden border-r border-border bg-[#101416] p-12 lg:flex lg:flex-col lg:justify-between">
        <Brand />
        <div className="max-w-xl">
          <p className="mb-4 text-sm font-medium text-primary">Creative work, one durable system.</p>
          <h1 className="text-5xl font-semibold leading-[1.05] tracking-[-0.04em] text-zinc-100">
            Build the story. Shape the cut.
          </h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-zinc-400">
            A stable studio foundation for projects, assets, timelines, jobs and final delivery.
          </p>
        </div>
        <p className="text-xs text-zinc-500">Sprint 2 foundation environment</p>
      </section>
      <section className="flex items-center justify-center p-6 sm:p-10">
        <form onSubmit={submit} className="w-full max-w-sm">
          <div className="mb-9 lg:hidden"><Brand /></div>
          <h2 className="text-2xl font-semibold tracking-tight">Sign in to AI Studio</h2>
          <p className="mt-2 text-sm text-muted-foreground">Use the prefilled development account to enter the workspace.</p>
          <label className="mt-8 block text-sm font-medium">
            Email
            <Input className="mt-2" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" />
          </label>
          <label className="mt-4 block text-sm font-medium">
            Password
            <Input className="mt-2" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" />
          </label>
          {error && <p className="mt-3 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
          <Button className="mt-6 w-full" type="submit">Sign in</Button>
          <p className="mt-5 text-center text-xs text-muted-foreground">Local mock authentication. No external API key is used.</p>
        </form>
      </section>
    </main>
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
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, match: 'dashboard' },
  { label: 'Workspaces', path: '/workspaces', icon: BriefcaseBusiness, match: 'workspaces' },
  { label: 'Assets', path: '/assets', icon: Boxes, match: 'assets' },
  { label: 'Job Center', path: '/jobs', icon: Gauge, match: 'jobs' },
  { label: 'Render Center', path: '/renders', icon: Film, match: 'renders' },
  { label: 'Providers', path: '/providers', icon: Sparkles, match: 'providers' },
  { label: 'Generation Wizard', path: '/wizard', icon: WandSparkles, match: 'generation' },
  { label: 'Commercial & SaaS', path: '/commercial', icon: CreditCard, match: 'commercial' },
  { label: 'Admin Console', path: '/admin', icon: ShieldCheck, match: 'admin' },
  { label: 'Settings', path: '/settings', icon: Settings, match: 'settings' },
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
  const workspaces = useStudioStore((state) => state.workspaces);
  const currentWorkspaceId = useStudioStore((state) => state.currentWorkspaceId);
  const selectWorkspace = useStudioStore((state) => state.selectWorkspace);
  const logout = useStudioStore((state) => state.logout);
  const user = useStudioStore((state) => state.user);
  const ui = useStudioStore((state) => state.ui);
  const setUi = useStudioStore((state) => state.setUi);
  const jobs = useStudioStore((state) => state.jobs);
  const activeJobs = jobs.filter((job) => job.status === 'Queued' || job.status === 'Running').length;
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
            <button className="rounded-md p-2 text-zinc-400 lg:hidden" onClick={() => setUi({ mobileNavigationOpen: false })} aria-label="Close navigation">
              <X className="size-4" />
            </button>
          </div>
          <nav className="flex-1 space-y-1 p-3" aria-label="Main navigation">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = route.name === item.match || (item.match === 'dashboard' && route.name === 'project');
              return (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    setUi({ mobileNavigationOpen: false });
                  }}
                  title={ui.sidebarCollapsed ? item.label : undefined}
                  className={cn(
                    'flex h-10 w-full items-center gap-3 rounded-lg px-3 text-sm transition-colors',
                    active ? 'bg-primary/15 text-primary' : 'text-zinc-400 hover:bg-white/6 hover:text-zinc-100',
                    ui.sidebarCollapsed && 'justify-center px-0',
                  )}
                >
                  <Icon className="size-[18px] shrink-0" />
                  {!ui.sidebarCollapsed && <span>{item.label}</span>}
                  {!ui.sidebarCollapsed && item.match === 'jobs' && activeJobs > 0 && (
                    <span className="ml-auto rounded bg-white/8 px-1.5 py-0.5 text-[10px] text-zinc-300">{activeJobs}</span>
                  )}
                </button>
              );
            })}
          </nav>
          <div className="border-t border-white/8 p-3">
            <button
              className={cn('flex w-full items-center gap-3 rounded-lg p-2 text-left text-sm text-zinc-300 hover:bg-white/6', ui.sidebarCollapsed && 'justify-center')}
              onClick={() => {
                logout();
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
      {ui.mobileNavigationOpen && <button className="fixed inset-0 z-30 bg-black/60 lg:hidden" onClick={() => setUi({ mobileNavigationOpen: false })} aria-label="Close navigation overlay" />}
      <div className={cn('transition-[padding] lg:pl-60', ui.sidebarCollapsed && 'lg:pl-[72px]')}>
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-background/95 px-4 backdrop-blur sm:px-6">
          <button className="rounded-lg border border-border p-2 lg:hidden" onClick={() => setUi({ mobileNavigationOpen: true })} aria-label="Open navigation">
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
              {workspaces.map((workspace) => <option key={workspace.id} value={workspace.id}>{workspace.name}</option>)}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-2.5 size-4 text-muted-foreground" />
          </div>
          <div className="hidden h-5 w-px bg-border sm:block" />
          <Breadcrumb route={route} currentWorkspace={currentWorkspace?.name ?? 'Workspace'} navigate={navigate} />
          <div className="ml-auto flex items-center gap-2">
            <button onClick={() => navigate('/jobs')} className="relative rounded-lg border border-border p-2 text-muted-foreground hover:bg-accent hover:text-foreground" aria-label="Open active jobs">
              <Clock3 className="size-4" />
              {activeJobs > 0 && <span className="absolute -right-1 -top-1 grid min-w-4 place-items-center rounded bg-primary px-1 text-[9px] font-semibold text-primary-foreground">{activeJobs}</span>}
            </button>
          </div>
        </header>
        <main className={cn('min-h-[calc(100dvh-4rem)]', route.name === 'editor' ? 'overflow-hidden' : 'p-4 sm:p-6 lg:p-8')}>
          {children}
        </main>
      </div>
    </div>
  );
}

function Breadcrumb({ route, currentWorkspace, navigate }: { route: Route; currentWorkspace: string; navigate: (path: string) => void }) {
  const project = useStudioStore((state) => route.name === 'project' || route.name === 'editor' ? state.projects.find((item) => item.id === route.projectId) : undefined);
  return (
    <div className="min-w-0 text-sm text-muted-foreground">
      <button className="hidden hover:text-foreground sm:inline" onClick={() => navigate('/dashboard')}>{currentWorkspace}</button>
      {project && (
        <>
          <span className="hidden px-2 sm:inline">/</span>
          <button className="max-w-44 truncate align-bottom font-medium text-foreground hover:text-primary" onClick={() => navigate(`/projects/${project.id}`)}>{project.name}</button>
          {route.name === 'editor' && <><span className="px-2">/</span><span>Editor</span></>}
        </>
      )}
      {!project && <span className="font-medium text-foreground sm:hidden">{routeTitle(route)}</span>}
    </div>
  );
}

function routeTitle(route: Route) {
  const titles: Partial<Record<Route['name'], string>> = {
    dashboard: 'Dashboard', workspaces: 'Workspaces', assets: 'Assets', jobs: 'Job Center',
    renders: 'Render Center', providers: 'Providers', settings: 'Settings',
  };
  return titles[route.name] ?? 'AI Studio';
}

function RouteScreen({ route, navigate }: { route: Route; navigate: (path: string) => void }) {
  const projects = useStudioStore((state) => state.projects);
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
  if (route.name === 'unauthorized') return <ErrorPage code="401" title="Sign in required" detail="Your session is no longer valid." action={() => navigate('/login')} />;
  if (route.name === 'forbidden') return <ErrorPage code="403" title="Access denied" detail="You do not have permission to view this resource." action={() => navigate('/dashboard')} />;
  if (route.name === 'not-found') return <ErrorPage code="404" title="Page not found" detail="The address does not match a screen in AI Studio." action={() => navigate('/dashboard')} />;
  if (route.name === 'project' || route.name === 'editor') {
    const project = projects.find((item) => item.id === route.projectId);
    if (!project || project.status === 'Archived') return <ErrorPage code="404" title="Project unavailable" detail="This project was archived or does not exist." action={() => navigate('/dashboard')} />;
    return route.name === 'editor' ? <EditorShell project={project} /> : <ProjectOverview project={project} navigate={navigate} />;
  }
  return null;
}

function PageHeader({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
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
  const currentWorkspaceId = useStudioStore((state) => state.currentWorkspaceId);
  const allProjects = useStudioStore((state) => state.projects);
  const allJobs = useStudioStore((state) => state.jobs);
  const allRenders = useStudioStore((state) => state.renders);
  const projects = allProjects.filter((project) => project.workspaceId === currentWorkspaceId && project.status !== 'Archived');
  const jobs = allJobs.filter((job) => job.workspaceId === currentWorkspaceId);
  const renders = allRenders.filter((render) => render.workspaceId === currentWorkspaceId);
  const [createOpen, setCreateOpen] = useState(false);
  const activeJobs = jobs.filter((job) => job.status === 'Running' || job.status === 'Queued');

  return (
    <div className="mx-auto max-w-[1440px]">
      <PageHeader
        title="Production overview"
        description="Projects, media operations and output activity in the current workspace."
        action={<Button onClick={() => setCreateOpen(true)}><Plus className="mr-2 size-4" />New project</Button>}
      />
      <div className="grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Active projects" value={String(projects.length)} hint="Current workspace" />
        <Metric label="Jobs in progress" value={String(activeJobs.length)} hint={`${jobs.filter((job) => job.status === 'Failed').length} need attention`} />
        <Metric label="Assets available" value={String(useStudioStore.getState().assets.filter((asset) => asset.workspaceId === currentWorkspaceId).length)} hint="Originals and media" />
        <Metric label="Completed renders" value={String(renders.filter((render) => render.status === 'Success').length)} hint="Ready for export" />
      </div>
      <div className="mt-7 grid gap-7 xl:grid-cols-[1.45fr_0.75fr]">
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Recent projects</h2>
            <span className="text-xs text-muted-foreground">{projects.length} active</span>
          </div>
          {projects.length ? (
            <div className="grid gap-3 md:grid-cols-2">
              {projects.map((project) => (
                <button key={project.id} onClick={() => navigate(`/projects/${project.id}`)} className="group rounded-xl border border-border bg-card p-5 text-left hover:border-primary/60">
                  <div className="mb-6 flex items-start justify-between">
                    <div className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary"><Film className="size-5" /></div>
                    <span className="text-xs text-muted-foreground">{project.aspectRatio} / {project.frameRate} fps</span>
                  </div>
                  <h3 className="font-semibold group-hover:text-primary">{project.name}</h3>
                  <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted-foreground">{project.description}</p>
                  <div className="mt-5 flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
                    <span>{project.status}</span><span>{relativeTime(project.updatedAt)}</span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <EmptyState icon={<Film className="size-5" />} title="No projects yet" description="Create the first project in this workspace." action={<Button onClick={() => setCreateOpen(true)}>Create project</Button>} />
          )}
        </section>
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Activity</h2>
            <button onClick={() => navigate('/jobs')} className="text-xs text-primary hover:underline">Open Job Center</button>
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
      <ProjectDialog open={createOpen} onClose={() => setCreateOpen(false)} onCreated={(project) => navigate(`/projects/${project.id}`)} />
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

function ProjectDialog({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: (project: ProjectRecord) => void }) {
  const createProject = useStudioStore((state) => state.createProject);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [aspectRatio, setAspectRatio] = useState<ProjectRecord['aspectRatio']>('16:9');
  const [frameRate, setFrameRate] = useState<ProjectRecord['frameRate']>(24);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const project = createProject({ name: name.trim(), description: description.trim(), aspectRatio, frameRate });
    if (project) {
      onClose();
      onCreated(project);
      setName('');
      setDescription('');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} title="Create project" description="Create the project identity and default editorial format.">
      <form onSubmit={submit} className="space-y-4">
        <label className="block text-sm font-medium">Project name<Input className="mt-2" required value={name} onChange={(event) => setName(event.target.value)} placeholder="Campaign or production name" /></label>
        <label className="block text-sm font-medium">Description<Input className="mt-2" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Short production brief" /></label>
        <div className="grid grid-cols-2 gap-4">
          <label className="block text-sm font-medium">Aspect ratio<select className="studio-select mt-2" value={aspectRatio} onChange={(event) => setAspectRatio(event.target.value as ProjectRecord['aspectRatio'])}><option>16:9</option><option>9:16</option><option>1:1</option></select></label>
          <label className="block text-sm font-medium">Frame rate<select className="studio-select mt-2" value={frameRate} onChange={(event) => setFrameRate(Number(event.target.value) as ProjectRecord['frameRate'])}><option value={24}>24 fps</option><option value={25}>25 fps</option><option value={30}>30 fps</option></select></label>
        </div>
        <div className="flex justify-end gap-2 pt-3"><Button type="button" variant="outline" onClick={onClose}>Cancel</Button><Button type="submit">Create project</Button></div>
      </form>
    </Dialog>
  );
}

function WorkspaceCenter() {
  const workspaces = useStudioStore((state) => state.workspaces);
  const projects = useStudioStore((state) => state.projects);
  const currentWorkspaceId = useStudioStore((state) => state.currentWorkspaceId);
  const selectWorkspace = useStudioStore((state) => state.selectWorkspace);
  const createWorkspace = useStudioStore((state) => state.createWorkspace);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title="Workspaces" description="Tenant boundaries for projects, members, assets and usage." action={<Button onClick={() => setOpen(true)}><Plus className="mr-2 size-4" />New workspace</Button>} />
      <div className="space-y-3">
        {workspaces.map((workspace) => {
          const count = projects.filter((project) => project.workspaceId === workspace.id && project.status !== 'Archived').length;
          const active = workspace.id === currentWorkspaceId;
          return (
            <Card key={workspace.id} className={cn('flex flex-col gap-4 p-5 sm:flex-row sm:items-center', active && 'border-primary/60')}>
              <div className="grid size-11 place-items-center rounded-lg bg-muted"><BriefcaseBusiness className="size-5 text-muted-foreground" /></div>
              <div className="flex-1"><h2 className="font-semibold">{workspace.name}</h2><p className="mt-1 text-sm text-muted-foreground">{count} active projects / Owner workspace</p></div>
              {active ? <span className="text-sm font-medium text-primary">Current workspace</span> : <Button variant="outline" onClick={() => selectWorkspace(workspace.id)}>Switch workspace</Button>}
            </Card>
          );
        })}
      </div>
      <Dialog open={open} onClose={() => setOpen(false)} title="Create workspace" description="Create a separate boundary for projects and assets.">
        <form onSubmit={(event) => { event.preventDefault(); if (name.trim()) { createWorkspace(name); setName(''); setOpen(false); } }}>
          <label className="block text-sm font-medium">Workspace name<Input className="mt-2" value={name} onChange={(event) => setName(event.target.value)} required /></label>
          <div className="mt-5 flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button type="submit">Create workspace</Button></div>
        </form>
      </Dialog>
    </div>
  );
}

function ProjectOverview({ project, navigate }: { project: ProjectRecord; navigate: (path: string) => void }) {
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
      <PageHeader title={project.name} description={project.description} action={<div className="flex gap-2"><Button variant="outline" onClick={() => setEditOpen(true)}>Edit project</Button><Button onClick={() => navigate(`/projects/${project.id}/editor`)}><Clapperboard className="mr-2 size-4" />Open editor</Button></div>} />
      <div className="grid gap-5 md:grid-cols-3">
        <Card className="p-5"><p className="text-xs text-muted-foreground">Editorial format</p><p className="mt-3 font-mono text-lg">{project.aspectRatio} / {project.frameRate} fps</p></Card>
        <Card className="p-5"><p className="text-xs text-muted-foreground">Assets</p><p className="mt-3 font-mono text-lg">{assets.length} linked</p></Card>
        <Card className="p-5"><p className="text-xs text-muted-foreground">Operations</p><p className="mt-3 font-mono text-lg">{jobs.filter((job) => job.status === 'Running').length} running</p></Card>
      </div>
      <div className="mt-7 grid gap-7 lg:grid-cols-[1fr_320px]">
        <Card className="overflow-hidden">
          <div className="border-b border-border p-5"><h2 className="font-semibold">Project structure</h2><p className="mt-1 text-sm text-muted-foreground">The production objects prepared for editing.</p></div>
          <div className="grid gap-px bg-border sm:grid-cols-3">
            <ProjectModule icon={<Layers3 />} name="Storyboard" meta="1 board / 6 scenes" />
            <ProjectModule icon={<Clapperboard />} name="Timeline" meta="Main sequence / Draft" />
            <ProjectModule icon={<Boxes />} name="Asset collection" meta={`${assets.length} references`} />
          </div>
        </Card>
        <Card className="p-5">
          <h2 className="font-semibold">Lifecycle</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between"><dt className="text-muted-foreground">Status</dt><dd>{project.status}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Updated</dt><dd>{relativeTime(project.updatedAt)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Version</dt><dd>Foundation v1</dd></div>
          </dl>
          <Button variant="outline" className="mt-6 w-full text-destructive hover:text-destructive" onClick={() => { archiveProject(project.id); navigate('/dashboard'); }}><Archive className="mr-2 size-4" />Archive project</Button>
        </Card>
      </div>
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} title="Edit project" description="Update project metadata without changing timeline data.">
        <form onSubmit={(event) => { event.preventDefault(); updateProject(project.id, { name, description }); setEditOpen(false); }}>
          <label className="block text-sm font-medium">Name<Input className="mt-2" value={name} onChange={(event) => setName(event.target.value)} /></label>
          <label className="mt-4 block text-sm font-medium">Description<Input className="mt-2" value={description} onChange={(event) => setDescription(event.target.value)} /></label>
          <div className="mt-5 flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button><Button type="submit">Save project</Button></div>
        </form>
      </Dialog>
    </div>
  );
}

function ProjectModule({ icon, name, meta }: { icon: ReactNode; name: string; meta: string }) {
  return <div className="bg-card p-5"><div className="mb-4 text-muted-foreground [&>svg]:size-5">{icon}</div><p className="text-sm font-medium">{name}</p><p className="mt-1 text-xs text-muted-foreground">{meta}</p></div>;
}

const trackRows = [
  { id: 'video-1', label: 'V1', name: 'Primary video', clips: [{ id: 'clip-city', left: 2, width: 27, name: 'City dawn' }, { id: 'clip-product', left: 31, width: 32, name: 'Product turntable' }, { id: 'clip-end', left: 65, width: 22, name: 'End frame' }] },
  { id: 'video-2', label: 'V2', name: 'Titles', clips: [{ id: 'clip-title', left: 34, width: 19, name: 'Product title' }] },
  { id: 'audio-1', label: 'A1', name: 'Music', clips: [{ id: 'clip-audio', left: 1, width: 86, name: 'Pulse score' }] },
  { id: 'audio-2', label: 'A2', name: 'Voice', clips: [{ id: 'clip-voice', left: 9, width: 18, name: 'Voice 01' }, { id: 'clip-voice-2', left: 42, width: 24, name: 'Voice 02' }] },
];

function EditorShell({ project }: { project: ProjectRecord }) {
  const editor = useStudioStore((state) => state.editor);
  const setEditor = useStudioStore((state) => state.setEditor);
  const workspaceId = useStudioStore((state) => state.currentWorkspaceId);
  const allAssets = useStudioStore((state) => state.assets);
  const allJobs = useStudioStore((state) => state.jobs);
  const assets = allAssets.filter((asset) => asset.workspaceId === workspaceId);
  const jobs = allJobs.filter((job) => job.projectId === project.id);
  const selectedAsset = assets[0];
  return (
    <div className="flex h-[calc(100dvh-4rem)] flex-col bg-[#0d1012] text-zinc-200">
      <div className="flex h-12 items-center gap-1 border-b border-white/8 px-3">
        {(['select', 'trim', 'split'] as const).map((tool) => <button key={tool} onClick={() => setEditor({ activeTool: tool })} className={cn('rounded-md px-3 py-1.5 text-xs capitalize', editor.activeTool === tool ? 'bg-primary text-primary-foreground' : 'text-zinc-400 hover:bg-white/7')}>{tool}</button>)}
        <div className="mx-2 h-5 w-px bg-white/10" />
        <button className="editor-icon" aria-label="Undo"><ArrowLeft className="size-4" /></button>
        <button className="editor-icon" aria-label="Redo"><Redo2 className="size-4" /></button>
        <div className="ml-auto flex items-center gap-2 text-xs text-zinc-500"><span>Timeline draft saved</span><Button size="sm">Render</Button></div>
      </div>
      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[260px_minmax(440px,1fr)] 2xl:grid-cols-[260px_minmax(540px,1fr)_280px]">
        <aside className="hidden min-h-0 border-r border-white/8 bg-[#111517] lg:flex lg:flex-col">
          <div className="grid grid-cols-3 border-b border-white/8">
            <button onClick={() => setEditor({ leftPanel: 'workflow' })} className={cn('px-2 py-3 text-[11px] font-medium', editor.leftPanel === 'workflow' ? 'border-b-2 border-primary text-zinc-100' : 'text-zinc-500')}>Workflow</button>
            <button onClick={() => setEditor({ leftPanel: 'assets' })} className={cn('px-3 py-3 text-xs font-medium', editor.leftPanel === 'assets' ? 'border-b-2 border-primary text-zinc-100' : 'text-zinc-500')}>Assets</button>
            <button onClick={() => setEditor({ leftPanel: 'jobs' })} className={cn('px-3 py-3 text-xs font-medium', editor.leftPanel === 'jobs' ? 'border-b-2 border-primary text-zinc-100' : 'text-zinc-500')}>Jobs</button>
          </div>
          {editor.leftPanel === 'workflow' && <WorkflowPanel project={project} />}
          {editor.leftPanel === 'assets' && <EditorAssets assets={assets} />}
          {editor.leftPanel === 'jobs' && <EditorJobs jobs={jobs} />}
        </aside>
        <section className="grid min-h-0 grid-rows-[minmax(280px,1fr)_300px]">
          <PreviewCanvas project={project} assetName={selectedAsset?.name} playhead={editor.playhead} />
          <TimelineShell />
        </section>
        <Inspector project={project} />
      </div>
    </div>
  );
}

function EditorAssets({ assets }: { assets: ReturnType<typeof useStudioStore.getState>['assets'] }) {
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState(assets[0]?.id);
  const visible = assets.filter((asset) =>
    asset.name.toLowerCase().includes(search.toLowerCase()));
  const selected = assets.find((asset) => asset.id === selectedId);
  return (
    <div className="min-h-0 flex-1 overflow-auto">
      <div className="p-3">
        <div className="relative mb-3">
          <Search className="absolute left-2.5 top-2.5 size-3.5 text-zinc-500" />
          <input
            className="h-8 w-full rounded-md border border-white/10 bg-black/20 pl-8 pr-2 text-xs outline-none focus:border-primary"
            placeholder="Search assets"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          {visible.slice(0, 8).map((asset) => {
            const detail = getAssetPipelineDetail(asset);
            return (
              <button
                key={asset.id}
                onClick={() => setSelectedId(asset.id)}
                className={cn(
                  'overflow-hidden rounded-lg border bg-white/[0.025] text-left',
                  asset.id === selectedId
                    ? 'border-primary'
                    : 'border-white/8 hover:border-primary/50',
                )}
              >
                <div className="grid aspect-video place-items-center" style={{ backgroundColor: asset.color }}>
                  <AssetIcon kind={asset.kind} className="size-5 text-white/70" />
                </div>
                <div className="flex items-center gap-1 p-2">
                  <p className="min-w-0 flex-1 truncate text-[11px] text-zinc-300">{asset.name}</p>
                  <span className="font-mono text-[9px] text-zinc-600">v{detail.versions.length}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
      {selected && <CompactAssetVersions asset={selected} />}
    </div>
  );
}

function EditorJobs({ jobs }: { jobs: ReturnType<typeof useStudioStore.getState>['jobs'] }) {
  return <div className="divide-y divide-white/8 overflow-auto">{jobs.map((job) => <div key={job.id} className="p-3"><div className="flex items-center gap-2"><StatusIcon status={job.status} /><p className="min-w-0 flex-1 truncate text-xs">{job.type}</p><span className="text-[10px] text-zinc-500">{job.status}</span></div>{job.status === 'Running' && <Progress value={job.progress} className="mt-2" />}</div>)}</div>;
}

function PreviewCanvas({ project, assetName, playhead }: { project: ProjectRecord; assetName?: string; playhead: number }) {
  const [playing, setPlaying] = useState(false);
  return (
    <div className="relative flex min-h-0 items-center justify-center bg-[#090b0c] p-5">
      <div className={cn('relative overflow-hidden border border-white/10 bg-[#1d2529] shadow-2xl shadow-black/40', project.aspectRatio === '9:16' ? 'h-[78%] aspect-[9/16]' : project.aspectRatio === '1:1' ? 'h-[72%] aspect-square' : 'w-[72%] aspect-video')}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_60%_35%,rgba(92,142,158,0.28),transparent_38%),linear-gradient(145deg,#202a2f,#111517_65%)]" />
        <div className="absolute bottom-5 left-5"><p className="text-[10px] uppercase tracking-[0.14em] text-zinc-400">Current frame</p><p className="mt-1 text-sm font-medium text-zinc-100">{assetName ?? project.name}</p></div>
        <div className="absolute inset-0 grid place-items-center"><button className="grid size-12 place-items-center rounded-full bg-zinc-100/90 text-zinc-900 shadow-xl" onClick={() => setPlaying(!playing)} aria-label={playing ? 'Pause preview' : 'Play preview'}>{playing ? <Pause className="size-5 fill-current" /> : <Play className="ml-0.5 size-5 fill-current" />}</button></div>
      </div>
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-md border border-white/8 bg-black/60 px-2 py-1 font-mono text-[10px] text-zinc-400">{formatTime(playhead)} / 00:00:42:12</div>
    </div>
  );
}

function TimelineShell() {
  const editor = useStudioStore((state) => state.editor);
  const setEditor = useStudioStore((state) => state.setEditor);
  const rulerMarks = Array.from({ length: 11 }, (_, index) => index * 5);
  return (
    <div className="min-h-0 border-t border-white/8 bg-[#111517]">
      <div className="flex h-10 items-center border-b border-white/8 px-3">
        <span className="text-xs font-medium">Main timeline</span>
        <div className="ml-auto flex items-center gap-2">
          <button className="editor-icon" onClick={() => setEditor({ zoom: Math.max(0.5, editor.zoom - 0.25) })} aria-label="Zoom out"><ZoomOut className="size-3.5" /></button>
          <span className="w-10 text-center font-mono text-[10px] text-zinc-500">{Math.round(editor.zoom * 100)}%</span>
          <button className="editor-icon" onClick={() => setEditor({ zoom: Math.min(2, editor.zoom + 0.25) })} aria-label="Zoom in"><ZoomIn className="size-3.5" /></button>
        </div>
      </div>
      <div className="grid h-[calc(100%-2.5rem)] grid-cols-[112px_minmax(620px,1fr)] overflow-auto">
        <div className="sticky left-0 z-10 bg-[#111517] pt-7">
          {trackRows.map((track) => <div key={track.id} className="flex h-12 items-center gap-2 border-b border-r border-white/8 px-2"><span className="w-6 font-mono text-[10px] text-zinc-500">{track.label}</span><span className="truncate text-[10px] text-zinc-400">{track.name}</span></div>)}
        </div>
        <div className="relative min-w-[720px]" style={{ width: `${Math.max(100, editor.zoom * 100)}%` }}>
          <div className="relative h-7 border-b border-white/8 bg-[#0d1012]">
            {rulerMarks.map((mark, index) => <button key={mark} onClick={() => setEditor({ playhead: mark })} className="absolute top-0 h-full border-l border-white/10 pl-1 font-mono text-[9px] text-zinc-600" style={{ left: `${index * 10}%` }}>{`00:${String(mark).padStart(2, '0')}`}</button>)}
          </div>
          {trackRows.map((track) => (
            <div key={track.id} className="relative h-12 border-b border-white/8 bg-[linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[length:10%_100%]">
              {track.clips.map((clip) => <button key={clip.id} onClick={() => setEditor({ selectedClipId: clip.id })} className={cn('absolute top-1.5 h-9 overflow-hidden rounded-md border px-2 text-left text-[10px]', track.id.startsWith('audio') ? 'border-emerald-700/40 bg-emerald-900/30 text-emerald-200' : 'border-cyan-700/40 bg-cyan-900/35 text-cyan-100', editor.selectedClipId === clip.id && 'ring-2 ring-primary')} style={{ left: `${clip.left}%`, width: `${clip.width}%` }}><span className="truncate">{clip.name}</span>{track.id.startsWith('audio') && <span className="absolute inset-x-2 bottom-1 h-1 bg-[repeating-linear-gradient(90deg,rgba(110,231,183,.45)_0_2px,transparent_2px_5px)]" />}</button>)}
            </div>
          ))}
          <button className="absolute bottom-0 top-0 z-20 w-px bg-primary" onPointerDown={(event) => event.currentTarget.setPointerCapture(event.pointerId)} onPointerMove={(event) => { if (event.currentTarget.hasPointerCapture(event.pointerId)) { const box = event.currentTarget.parentElement?.getBoundingClientRect(); if (box) setEditor({ playhead: Math.max(0, Math.min(50, ((event.clientX - box.left) / box.width) * 50)) }); } }} style={{ left: `${(editor.playhead / 50) * 100}%` }} aria-label="Timeline playhead"><span className="absolute -left-1.5 top-0 size-3 rotate-45 bg-primary" /></button>
        </div>
      </div>
    </div>
  );
}

function Inspector({ project }: { project: ProjectRecord }) {
  const selectedClipId = useStudioStore((state) => state.editor.selectedClipId);
  return (
    <aside className="hidden min-h-0 overflow-auto border-l border-white/8 bg-[#111517] p-4 2xl:block">
      <div className="flex items-center justify-between"><h2 className="text-xs font-semibold">Inspector</h2><PanelRight className="size-4 text-zinc-600" /></div>
      <div className="mt-5 aspect-video rounded-lg border border-white/8 bg-[#1d2529]" />
      <dl className="mt-5 space-y-4 text-xs">
        <InspectorField label="Selection" value={selectedClipId ?? 'No clip selected'} />
        <InspectorField label="Position" value="00:00:12:10" />
        <InspectorField label="Duration" value="00:00:08:06" />
        <InspectorField label="Scale" value="100%" />
        <InspectorField label="Opacity" value="100%" />
        <InspectorField label="Project format" value={`${project.aspectRatio} / ${project.frameRate} fps`} />
      </dl>
      <div className="mt-6 border-t border-white/8 pt-4"><button className="flex w-full items-center justify-between text-xs"><span>Transform</span><ChevronDown className="size-3.5 text-zinc-500" /></button><button className="mt-4 flex w-full items-center justify-between text-xs"><span>Audio</span><ChevronDown className="size-3.5 text-zinc-500" /></button></div>
    </aside>
  );
}

function InspectorField({ label, value }: { label: string; value: string }) {
  return <div><dt className="mb-1 text-[10px] text-zinc-500">{label}</dt><dd className="rounded-md border border-white/8 bg-black/15 px-2.5 py-2 text-zinc-300">{value}</dd></div>;
}

function AssetLibrary() {
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
  const folders = ['All assets', ...Array.from(new Set(assets.map((asset) => asset.folder)))];
  const visible = assets.filter((asset) =>
    (folder === 'All assets' || asset.folder === folder)
    && matchesAssetFilters(asset, {
      text: search,
      type: kind,
      tag,
      provider,
      workflow,
      version,
    }));
  const selected = assets.find((asset) => asset.id === selectedId);

  return (
    <div className="mx-auto max-w-[1500px]">
      <PageHeader title="Asset Library" description="Workspace media catalog with immutable asset references." action={<Button onClick={() => notify('Mock upload queued in Asset Ingestion')}><Upload className="mr-2 size-4" />Upload asset</Button>} />
      <div className="grid gap-4 lg:grid-cols-[190px_minmax(0,1fr)_260px]">
        <Card className="p-3">
          <p className="px-2 py-2 text-xs font-semibold">Folders</p>
          <div className="mt-1 space-y-1">{folders.map((item) => <button key={item} onClick={() => setFolder(item)} className={cn('flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm', folder === item ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-accent hover:text-foreground')}>{item === 'All assets' ? <FolderOpen className="size-4" /> : <Folder className="size-4" />}<span className="truncate">{item}</span></button>)}</div>
          <p className="mt-6 px-2 text-[10px] text-muted-foreground">Workspace {workspaceId}</p>
        </Card>
        <section>
          <Card className="mb-4 grid gap-3 p-3 sm:grid-cols-2 xl:grid-cols-3">
            <div className="relative xl:col-span-2"><Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" /><Input className="pl-9" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search assets" /></div>
            <select aria-label="Asset type" className="studio-select" value={kind} onChange={(event) => setKind(event.target.value as 'All' | AssetPipelineType)}><option>All</option>{assetPipelineTypes.map((type) => <option key={type}>{type}</option>)}</select>
            <Input aria-label="Asset tag" value={tag} onChange={(event) => setTag(event.target.value)} placeholder="Tag" />
            <select aria-label="Asset provider" className="studio-select" value={provider} onChange={(event) => setProvider(event.target.value)}><option value="">Provider</option><option>mock-video</option><option>mock-indexer</option><option>mock-import</option></select>
            <select aria-label="Asset workflow" className="studio-select" value={workflow} onChange={(event) => setWorkflow(event.target.value)}><option value="">Workflow</option><option>idea</option><option>scene</option><option>quality-review</option></select>
            <select aria-label="Asset version" className="studio-select" value={version} onChange={(event) => setVersion(event.target.value)}><option value="">Version</option><option value="1">v1</option><option value="2">v2</option><option value="3">v3</option></select>
            <div className="flex rounded-lg border border-border p-0.5"><button className={cn('rounded-md p-2', view === 'grid' && 'bg-accent')} onClick={() => setUi({ assetView: 'grid' })} aria-label="Grid view"><Grid2X2 className="size-4" /></button><button className={cn('rounded-md p-2', view === 'list' && 'bg-accent')} onClick={() => setUi({ assetView: 'list' })} aria-label="List view"><List className="size-4" /></button></div>
          </Card>
          {visible.length === 0 ? <EmptyState icon={<Boxes className="size-5" />} title="No matching assets" description="Change the search or filter to see other media." /> : view === 'grid' ? (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{visible.map((asset) => <AssetTile key={asset.id} asset={asset} selected={asset.id === selectedId} onClick={() => setSelectedId(asset.id)} />)}</div>
          ) : (
            <DataTable columns={['Name', 'Type', 'Folder', 'Size', 'Duration']}>{visible.map((asset) => <tr key={asset.id} onClick={() => setSelectedId(asset.id)} className={cn('cursor-pointer hover:bg-accent/50', asset.id === selectedId && 'bg-primary/5')}><td className="px-4 py-3 font-medium">{asset.name}</td><td className="px-4 py-3 text-muted-foreground">{asset.kind}</td><td className="px-4 py-3 text-muted-foreground">{asset.folder}</td><td className="px-4 py-3 font-mono text-xs">{asset.size}</td><td className="px-4 py-3 font-mono text-xs">{asset.duration ?? '-'}</td></tr>)}</DataTable>
          )}
        </section>
        <Card className="h-fit overflow-hidden">
          {selected ? <AssetVersionPanel key={selected.id} asset={selected} onNotify={notify} preview={<div className="grid aspect-video place-items-center" style={{ backgroundColor: selected.color }}><AssetIcon kind={selected.kind} className="size-9 text-white/70" /></div>} /> : <EmptyState icon={<ImageIcon className="size-5" />} title="Select an asset" description="Asset metadata appears here." />}
        </Card>
      </div>
    </div>
  );
}

function AssetTile({ asset, selected, onClick }: { asset: ReturnType<typeof useStudioStore.getState>['assets'][number]; selected: boolean; onClick: () => void }) {
  return <button onClick={onClick} className={cn('overflow-hidden rounded-xl border bg-card text-left transition-colors', selected ? 'border-primary ring-2 ring-primary/15' : 'border-border hover:border-primary/50')}><div className="grid aspect-video place-items-center" style={{ backgroundColor: asset.color }}><AssetIcon kind={asset.kind} className="size-7 text-white/70" /></div><div className="p-3"><p className="truncate text-sm font-medium">{asset.name}</p><div className="mt-2 flex justify-between text-xs text-muted-foreground"><span>{asset.kind}</span><span>{asset.size}</span></div></div></button>;
}

function AssetIcon({ kind, className }: { kind: AssetKind; className?: string }) {
  const Icon = kind === 'Video' ? Video : kind === 'Audio' ? Music2 : ImageIcon;
  return <Icon className={className} />;
}

function JobCenter() {
  const workspaceId = useStudioStore((state) => state.currentWorkspaceId);
  const allJobs = useStudioStore((state) => state.jobs);
  const jobs = allJobs.filter((job) => job.workspaceId === workspaceId);
  const retryJob = useStudioStore((state) => state.retryJob);
  const [status, setStatus] = useState<'All' | JobStatus>('All');
  const visible = status === 'All' ? jobs : jobs.filter((job) => job.status === status);
  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader title="Job Center" description="Queue and execution status for long-running studio operations." />
      <div className="mb-4 flex flex-wrap gap-2">{(['All', 'Queued', 'Running', 'Success', 'Failed'] as const).map((item) => <button key={item} onClick={() => setStatus(item)} className={cn('rounded-lg border px-3 py-2 text-sm', status === item ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-card text-muted-foreground hover:text-foreground')}>{item}<span className="ml-2 font-mono text-xs">{item === 'All' ? jobs.length : jobs.filter((job) => job.status === item).length}</span></button>)}</div>
      <DataTable columns={['Job', 'Subject', 'Status', 'Progress', 'Created', '']}>
        {visible.map((job) => <tr key={job.id}><td className="px-4 py-4"><p className="font-medium">{job.type}</p><p className="mt-0.5 font-mono text-[10px] text-muted-foreground">{job.id}</p></td><td className="px-4 py-4 text-muted-foreground">{job.subject}</td><td className="px-4 py-4"><StatusLabel status={job.status} /></td><td className="w-48 px-4 py-4">{job.status === 'Running' ? <div className="flex items-center gap-3"><Progress value={job.progress} className="flex-1" /><span className="font-mono text-xs">{job.progress}%</span></div> : <span className="text-xs text-muted-foreground">{job.progress}%</span>}</td><td className="px-4 py-4 text-xs text-muted-foreground">{relativeTime(job.createdAt)}</td><td className="px-4 py-4 text-right">{job.status === 'Failed' && <Button size="sm" variant="outline" onClick={() => retryJob(job.id)}><RefreshCw className="mr-2 size-3.5" />Retry</Button>}</td></tr>)}
      </DataTable>
    </div>
  );
}

function RenderCenter() {
  const workspaceId = useStudioStore((state) => state.currentWorkspaceId);
  const allRenders = useStudioStore((state) => state.renders);
  const renders = allRenders.filter((render) => render.workspaceId === workspaceId);
  const [tab, setTab] = useState<'Queue' | 'History' | 'Exports'>('Queue');
  const visible = tab === 'Queue' ? renders.filter((render) => render.status === 'Queued' || render.status === 'Running') : tab === 'History' ? renders.filter((render) => render.status === 'Success' || render.status === 'Failed') : renders.filter((render) => render.status === 'Success');
  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader title="Render Center" description="Render queue, completed history and export-ready artifacts." />
      <div className="mb-5 flex border-b border-border">{(['Queue', 'History', 'Exports'] as const).map((item) => <button key={item} onClick={() => setTab(item)} className={cn('border-b-2 px-4 py-3 text-sm', tab === item ? 'border-primary text-primary' : 'border-transparent text-muted-foreground')}>{item}</button>)}</div>
      {visible.length ? <div className="space-y-3">{visible.map((render) => <Card key={render.id} className="flex flex-col gap-4 p-5 md:flex-row md:items-center"><div className="grid size-11 place-items-center rounded-lg bg-muted"><Film className="size-5 text-muted-foreground" /></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h2 className="font-semibold">{render.projectName}</h2><StatusLabel status={render.status} /></div><p className="mt-1 text-sm text-muted-foreground">{render.preset} / Snapshot pinned</p>{render.status === 'Running' && <Progress value={render.progress} className="mt-3 max-w-md" />}</div><div className="flex items-center gap-2">{tab === 'Exports' && <Button variant="outline"><Download className="mr-2 size-4" />Export list</Button>}<Button size="icon" variant="ghost" aria-label="Render actions"><MoreHorizontal className="size-4" /></Button></div></Card>)}</div> : <EmptyState icon={<Film className="size-5" />} title={`No ${tab.toLowerCase()} items`} description="Render records will appear here when the corresponding mock operation exists." />}
    </div>
  );
}

function ProviderRegistry() {
  return <AiProvidersScreen />;
}

function SettingsCenter() {
  const user = useStudioStore((state) => state.user);
  const featureFlags = useStudioStore((state) => state.featureFlags);
  const setFeatureFlag = useStudioStore((state) => state.setFeatureFlag);
  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="Settings" description="Environment, feature flags and effective user settings." />
      <div className="space-y-5">
        <Card className="p-5"><h2 className="font-semibold">User session</h2><dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2"><div><dt className="text-xs text-muted-foreground">Name</dt><dd className="mt-1">{user?.name}</dd></div><div><dt className="text-xs text-muted-foreground">Role</dt><dd className="mt-1">{user?.role}</dd></div><div><dt className="text-xs text-muted-foreground">Email</dt><dd className="mt-1">{user?.email}</dd></div><div><dt className="text-xs text-muted-foreground">Authentication</dt><dd className="mt-1">Local mock session</dd></div></dl></Card>
        <Card className="p-5"><h2 className="font-semibold">Environment</h2><dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2"><div><dt className="text-xs text-muted-foreground">API mode</dt><dd className="mt-1">Mock foundation</dd></div><div><dt className="text-xs text-muted-foreground">Storage</dt><dd className="mt-1">Browser persistence</dd></div><div><dt className="text-xs text-muted-foreground">Theme</dt><dd className="mt-1">Dark creative workspace</dd></div><div><dt className="text-xs text-muted-foreground">Logging</dt><dd className="mt-1">Client console transport</dd></div></dl></Card>
        <Card className="p-5"><h2 className="font-semibold">Feature flags</h2><div className="mt-4 divide-y divide-border">{Object.entries(featureFlags).map(([key, enabled]) => <label key={key} className="flex items-center justify-between py-3 text-sm"><span>{key}</span><input type="checkbox" checked={enabled} onChange={(event) => setFeatureFlag(key, event.target.checked)} className="size-4 accent-[hsl(var(--primary))]" /></label>)}</div></Card>
      </div>
    </div>
  );
}

function StatusIcon({ status }: { status: JobStatus }) {
  if (status === 'Success') return <span className="grid size-6 place-items-center rounded-md bg-emerald-500/10 text-emerald-400"><Check className="size-3.5" /></span>;
  if (status === 'Failed') return <span className="grid size-6 place-items-center rounded-md bg-red-500/10 text-red-400"><X className="size-3.5" /></span>;
  if (status === 'Running') return <span className="grid size-6 place-items-center rounded-md bg-cyan-500/10 text-cyan-400"><RefreshCw className="size-3.5 animate-spin" /></span>;
  return <span className="grid size-6 place-items-center rounded-md bg-zinc-500/10 text-zinc-400"><Clock3 className="size-3.5" /></span>;
}

function StatusLabel({ status, label }: { status: JobStatus; label?: string }) {
  return <span className={cn('inline-flex rounded-md px-2 py-1 text-[11px] font-medium', status === 'Success' ? 'bg-emerald-500/10 text-emerald-400' : status === 'Failed' ? 'bg-red-500/10 text-red-400' : status === 'Running' ? 'bg-cyan-500/10 text-cyan-400' : 'bg-zinc-500/10 text-zinc-400')}>{label ?? status}</span>;
}

function ErrorPage({ code, title, detail, action }: { code: string; title: string; detail: string; action: () => void }) {
  return (
    <div className="grid min-h-[calc(100dvh-8rem)] place-items-center p-6 text-center">
      <div><p className="font-mono text-sm text-primary">{code}</p><h1 className="mt-3 text-2xl font-semibold">{title}</h1><p className="mt-2 max-w-md text-sm text-muted-foreground">{detail}</p><Button className="mt-6" onClick={action}><House className="mr-2 size-4" />Return to dashboard</Button></div>
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
