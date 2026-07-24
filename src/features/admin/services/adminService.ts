import type {
  AdminUserSummary,
  AuditLogEntry,
  FeatureFlag,
  SystemHealthReport,
  SystemMetrics
} from '../types';

class AdminService {
  private flagsMock: FeatureFlag[] = [
    { key: 'EnableOpenAI', name: 'Enable OpenAI Provider', description: 'Enable OpenAI Responses API integration adapter', isEnabled: true, category: 'AI Providers' },
    { key: 'EnableGemini', name: 'Enable Gemini Provider', description: 'Enable Google Gemini Multimodal Provider adapter', isEnabled: true, category: 'AI Providers' },
    { key: 'EnableVeo', name: 'Enable Google Veo Video Provider', description: 'Enable Google Veo Video Generation adapter', isEnabled: true, category: 'AI Providers' },
    { key: 'EnableRunway', name: 'Enable Runway Gen-3 Provider', description: 'Enable Runway Video Synthesis adapter', isEnabled: true, category: 'AI Providers' },
    { key: 'EnableKling', name: 'Enable Kling AI Video Provider', description: 'Enable Kling AI Video Generation adapter', isEnabled: true, category: 'AI Providers' },
    { key: 'EnableStudioMode', name: 'Enable Advanced Studio Mode', description: 'Enable professional timeline & multitrack editor features', isEnabled: true, category: 'Studio Features' },
    { key: 'EnableExperimentalFeatures', name: 'Enable Experimental Features', description: 'Enable beta AI storyboarding & prompt auto-enhance', isEnabled: false, category: 'Experimental' },
    { key: 'EnableCreditDeduction', name: 'Enable Atomic Credit Deduction', description: 'Deduct user credits atomically upon generation pipeline step execution', isEnabled: true, category: 'Commercial' }
  ];

  async getMetrics(): Promise<SystemMetrics> {
    return {
      activeUsersCount: 148,
      totalGenerationsCount: 2840,
      successRatePercent: 99.4,
      failureRatePercent: 0.6,
      queueLength: 2,
      avgGenerationTimeMs: 4200.0,
      totalCreditsConsumed: 48500,
      apiLatencyMs: 85.2,
      providerUsageCounts: {
        openai: 1420,
        gemini: 680,
        veo: 310,
        runway: 240,
        kling: 190
      }
    };
  }

  async getHealth(): Promise<SystemHealthReport> {
    return {
      overallStatus: 'Healthy',
      memoryUsedMb: 184.2,
      storageUsedGb: 12.4,
      cpuUsagePercent: 4.8,
      timestamp: new Date().toISOString(),
      components: [
        { componentName: 'Database', status: 'Healthy', details: 'SQLite/PostgreSQL database operational, 2ms latency', checkedAt: new Date().toISOString() },
        { componentName: 'Provider OpenAI', status: 'Healthy', details: 'OpenAI API responsive, health check 98ms', checkedAt: new Date().toISOString() },
        { componentName: 'Provider Gemini', status: 'Healthy', details: 'Gemini API responsive, health check 110ms', checkedAt: new Date().toISOString() },
        { componentName: 'Job Queue', status: 'Healthy', details: 'Queue depth 2 jobs, processing throughput 15 jobs/min', checkedAt: new Date().toISOString() },
        { componentName: 'Background Worker', status: 'Healthy', details: 'RenderWorker active, thread pool healthy', checkedAt: new Date().toISOString() },
        { componentName: 'Asset Storage', status: 'Healthy', details: 'Local storage healthy, 450 GB available', checkedAt: new Date().toISOString() }
      ]
    };
  }

  async getAuditLogs(): Promise<AuditLogEntry[]> {
    return [
      { id: 'audit-1', userId: 'admin-user-01', eventType: 'Login', description: 'User logged into Admin Console', ipAddress: '192.168.1.10', userAgent: 'Mozilla/5.0', timestamp: new Date(Date.now() - 2700000).toISOString() },
      { id: 'audit-2', userId: 'usr-saas-demo', eventType: 'PlanUpgrade', description: 'Upgraded plan to Creator Pro', ipAddress: '192.168.1.15', userAgent: 'Chrome/124.0', timestamp: new Date(Date.now() - 1800000).toISOString() },
      { id: 'audit-3', userId: 'usr-saas-demo', eventType: 'CreditPurchase', description: 'Purchased 1000 Credits Package', ipAddress: '192.168.1.15', userAgent: 'Chrome/124.0', timestamp: new Date(Date.now() - 1500000).toISOString() },
      { id: 'audit-4', userId: 'usr-saas-demo', eventType: 'Generation', description: 'Completed video generation session', ipAddress: '192.168.1.15', userAgent: 'Chrome/124.0', timestamp: new Date(Date.now() - 600000).toISOString() },
      { id: 'audit-5', userId: 'usr-saas-demo', eventType: 'Download', description: 'Downloaded artifact FinalVideo.mp4', ipAddress: '192.168.1.15', userAgent: 'Chrome/124.0', timestamp: new Date(Date.now() - 300000).toISOString() }
    ];
  }

  async getFeatureFlags(): Promise<FeatureFlag[]> {
    return [...this.flagsMock];
  }

  async toggleFeatureFlag(key: string, isEnabled: boolean): Promise<FeatureFlag> {
    const idx = this.flagsMock.findIndex(f => f.key === key);
    if (idx !== -1) {
      this.flagsMock[idx] = { ...this.flagsMock[idx], isEnabled };
      return { ...this.flagsMock[idx] };
    }
    throw new Error('Flag not found');
  }

  async getUsers(): Promise<AdminUserSummary[]> {
    return [
      { userId: 'usr-saas-demo', displayName: 'SaaS Studio Owner', email: 'owner@ai-studio.local', planTier: 'Creator Pro', remainingCredits: 2455, totalGenerations: 12, createdAt: new Date(Date.now() - 2592000000).toISOString() },
      { userId: 'usr-demo-2', displayName: 'John Creator', email: 'john@creators.co', planTier: 'Free', remainingCredits: 100, totalGenerations: 2, createdAt: new Date(Date.now() - 864000000).toISOString() },
      { userId: 'usr-demo-3', displayName: 'Agency Admin', email: 'admin@studioagency.io', planTier: 'Enterprise Max', remainingCredits: 50000, totalGenerations: 140, createdAt: new Date(Date.now() - 5184000000).toISOString() }
    ];
  }

  async exportData(type: 'user' | 'audit' | 'project'): Promise<void> {
    const payload = JSON.stringify({ type, exportedAt: new Date().toISOString(), status: 'SUCCESS' }, null, 2);
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `export_${type}_${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

export const adminService = new AdminService();
