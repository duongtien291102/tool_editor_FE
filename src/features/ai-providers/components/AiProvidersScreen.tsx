import {
  Activity,
  Calculator,
  CheckCircle2,
  Cpu,
  KeyRound,
  RefreshCw,
  Settings,
  Sparkles,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, DataTable, EmptyState } from '@/components/ui/Foundation';
import { useStudioStore } from '@/state/studioStore';
import { aiProviderService } from '../services/aiProviderService';
import type { AiProviderProfile, SecretSourceType } from '../types';
import { CapabilityViewer } from './CapabilityViewer';
import { CostBadge } from './CostBadge';
import { CostEstimateModal } from './CostEstimateModal';
import { HealthBadge } from './HealthBadge';
import { LatencyBadge } from './LatencyBadge';
import { ProviderDetailModal } from './ProviderDetailModal';
import { ProviderStatus } from './ProviderStatus';

export function AiProvidersScreen() {
  const notify = useStudioStore((state) => state.notify);
  const [providers, setProviders] = useState<AiProviderProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [healthChecking, setHealthChecking] = useState<Record<string, boolean>>({});

  const [selectedProvider, setSelectedProvider] = useState<AiProviderProfile | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [estimateOpen, setEstimateOpen] = useState(false);
  const [estimateProvider, setEstimateProvider] = useState<string | null>(null);

  const loadProviders = async () => {
    setLoading(true);
    try {
      const data = await aiProviderService.getProviders();
      setProviders(data);
    } catch {
      notify('Failed to load AI Provider profiles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProviders();
  }, []);

  const handleToggle = async (providerName: string, enabled: boolean) => {
    try {
      const updated = await aiProviderService.toggleProvider(providerName, enabled);
      setProviders((prev) =>
        prev.map((p) => (p.provider === providerName ? updated : p)),
      );
      notify(`${providerName} is now ${enabled ? 'enabled' : 'disabled'}`);
    } catch {
      notify(`Could not toggle status for ${providerName}`);
    }
  };

  const handleHealthCheck = async (providerName: string) => {
    setHealthChecking((prev) => ({ ...prev, [providerName]: true }));
    try {
      const res = await aiProviderService.runHealthCheck(providerName);
      setProviders((prev) =>
        prev.map((p) =>
          p.provider === providerName
            ? {
                ...p,
                healthStatus: res.isHealthy ? 'Healthy' : 'Degraded',
                lastHealthCheck: res.checkedAt,
                latencyMs: res.latencyMs,
              }
            : p,
        ),
      );
      notify(`${providerName} health check: ${res.status} (${res.latencyMs}ms)`);
    } catch {
      notify(`Health check failed for ${providerName}`);
    } finally {
      setHealthChecking((prev) => ({ ...prev, [providerName]: false }));
    }
  };

  const handleHealthCheckAll = async () => {
    for (const p of providers) {
      if (p.enabled) {
        await handleHealthCheck(p.provider);
      }
    }
  };

  const handleSaveProfile = async (
    providerName: string,
    changes: Partial<AiProviderProfile['configuration']> & {
      apiKey?: string;
      secretSource?: SecretSourceType;
      secretKeyName?: string;
      isDefault?: boolean;
      fallbackProvider?: string;
    },
  ) => {
    try {
      const updated = await aiProviderService.updateProvider(providerName, changes);
      await loadProviders();
      notify(`${providerName} configuration and secret binding saved`);
    } catch {
      notify(`Failed to update ${providerName}`);
    }
  };

  const activeCount = providers.filter((p) => p.enabled).length;
  const healthyCount = providers.filter((p) => p.healthStatus === 'Healthy').length;
  const defaultProvider = providers.find((p) => p.isDefault)?.provider || 'OpenAI';

  return (
    <div className="mx-auto max-w-[1500px] space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">AI Providers</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Integration layer between Studio Core and AI Providers with secret management abstraction and capability routing.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleHealthCheckAll}>
            <Activity className="mr-2 size-4 text-emerald-400" />
            Pulse Check All
          </Button>
          <Button onClick={loadProviders}>
            <RefreshCw className="mr-2 size-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2 xl:grid-cols-4">
        <div className="bg-card px-5 py-4">
          <p className="text-xs text-muted-foreground">Registered Integration Providers</p>
          <p className="mt-2 font-mono text-2xl font-semibold">{providers.length}</p>
          <p className="mt-1 text-xs text-muted-foreground">OpenAI, Gemini, Veo, Runway, Kling</p>
        </div>
        <div className="bg-card px-5 py-4">
          <p className="text-xs text-muted-foreground">Active & Enabled</p>
          <p className="mt-2 font-mono text-2xl font-semibold text-emerald-400">
            {activeCount} / {providers.length}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Ready for workload dispatch</p>
        </div>
        <div className="bg-card px-5 py-4">
          <p className="text-xs text-muted-foreground">Healthy Endpoints</p>
          <p className="mt-2 font-mono text-2xl font-semibold text-cyan-400">{healthyCount}</p>
          <p className="mt-1 text-xs text-muted-foreground">Synthetic checks passed</p>
        </div>
        <div className="bg-card px-5 py-4">
          <p className="text-xs text-muted-foreground">Default Primary Provider</p>
          <p className="mt-2 font-mono text-xl font-semibold text-primary">{defaultProvider}</p>
          <p className="mt-1 text-xs text-muted-foreground">Fallback chain configured</p>
        </div>
      </div>

      {/* Main Table */}
      {loading ? (
        <Card className="p-8 text-center text-muted-foreground">Loading AI Provider profiles...</Card>
      ) : providers.length === 0 ? (
        <EmptyState
          icon={<Sparkles className="size-5" />}
          title="No providers registered"
          description="Register AI Providers to start executing generative workloads."
        />
      ) : (
        <Card className="overflow-hidden">
          <DataTable
            columns={[
              'Provider',
              'Status',
              'Priority',
              'Capabilities',
              'Est. Cost',
              'Latency',
              'Health',
              'Secret Binding (Masked)',
              'Actions',
            ]}
          >
            {providers.map((p) => {
              const isChecking = !!healthChecking[p.provider];
              return (
                <tr key={p.provider} className="hover:bg-accent/40 transition-colors">
                  {/* Provider Name */}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary">
                        <Cpu className="size-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground">{p.provider}</span>
                          {p.isDefault && (
                            <span className="rounded bg-primary/20 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                              DEFAULT
                            </span>
                          )}
                        </div>
                        <p className="font-mono text-[11px] text-muted-foreground">
                          {p.configuration.model}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-4">
                    <ProviderStatus
                      enabled={p.enabled}
                      onToggle={(val) => handleToggle(p.provider, val)}
                    />
                  </td>

                  {/* Priority */}
                  <td className="px-4 py-4">
                    <span className="inline-flex rounded border border-border bg-muted/60 px-2 py-1 font-mono text-xs">
                      P{p.priority}
                    </span>
                  </td>

                  {/* Capabilities */}
                  <td className="px-4 py-4">
                    <CapabilityViewer capabilities={p.supportedCapabilities} maxDisplay={3} />
                  </td>

                  {/* Estimated Cost */}
                  <td className="px-4 py-4">
                    <CostBadge costProfile={p.costProfile} />
                  </td>

                  {/* Latency */}
                  <td className="px-4 py-4">
                    <LatencyBadge latencyMs={p.latencyMs} timeoutSeconds={p.timeoutSeconds} />
                  </td>

                  {/* Health Badge */}
                  <td className="px-4 py-4">
                    <div className="space-y-1">
                      <HealthBadge status={p.healthStatus} />
                      <p className="font-mono text-[10px] text-muted-foreground">
                        {p.lastHealthCheck ? new Date(p.lastHealthCheck).toLocaleTimeString() : 'Never'}
                      </p>
                    </div>
                  </td>

                  {/* Secret Binding */}
                  <td className="px-4 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-xs text-foreground font-mono">
                        <KeyRound className="size-3 text-muted-foreground" />
                        <span>{p.secretBinding.maskedValue}</span>
                      </div>
                      <span className="inline-block rounded bg-zinc-800/80 px-1.5 py-0.5 font-mono text-[9px] text-zinc-400">
                        {p.secretBinding.sourceType}
                      </span>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        size="sm"
                        variant="outline"
                        title="Run Synthetic Health Check"
                        onClick={() => handleHealthCheck(p.provider)}
                        disabled={isChecking || !p.enabled}
                      >
                        <Activity
                          className={`size-3.5 ${isChecking ? 'animate-spin text-primary' : ''}`}
                        />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        title="Estimate Cost & Duration"
                        onClick={() => {
                          setEstimateProvider(p.provider);
                          setEstimateOpen(true);
                        }}
                      >
                        <Calculator className="size-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        title="Configure Settings & Binding"
                        onClick={() => {
                          setSelectedProvider(p);
                          setDetailOpen(true);
                        }}
                      >
                        <Settings className="size-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </DataTable>
        </Card>
      )}

      {/* Detail Modal */}
      <ProviderDetailModal
        provider={selectedProvider}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        onSave={handleSaveProfile}
        allProviders={providers.map((p) => p.provider)}
      />

      {/* Cost Estimator Modal */}
      <CostEstimateModal
        provider={estimateProvider}
        open={estimateOpen}
        onClose={() => setEstimateOpen(false)}
      />
    </div>
  );
}
