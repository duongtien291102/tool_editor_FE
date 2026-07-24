export interface SystemMetrics {
  activeUsersCount: number;
  totalGenerationsCount: number;
  successRatePercent: number;
  failureRatePercent: number;
  queueLength: number;
  avgGenerationTimeMs: number;
  totalCreditsConsumed: number;
  apiLatencyMs: number;
  providerUsageCounts: Record<string, number>;
}

export interface ComponentHealthStatus {
  componentName: string;
  status: string;
  details: string;
  checkedAt: string;
}

export interface SystemHealthReport {
  overallStatus: string;
  components: ComponentHealthStatus[];
  memoryUsedMb: number;
  storageUsedGb: number;
  cpuUsagePercent: number;
  timestamp: string;
}

export interface AuditLogEntry {
  id: string;
  userId: string;
  eventType: string;
  description: string;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
}

export interface FeatureFlag {
  key: string;
  name: string;
  description: string;
  isEnabled: boolean;
  category: string;
}

export interface AdminUserSummary {
  userId: string;
  displayName: string;
  email: string;
  planTier: string;
  remainingCredits: number;
  totalGenerations: number;
  createdAt: string;
}
