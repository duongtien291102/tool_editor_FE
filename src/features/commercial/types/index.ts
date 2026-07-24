export type PlanTier = 'Free' | 'Minimum' | 'Maximum';

export interface PlanPolicy {
  tier: PlanTier;
  name: string;
  priceMonthlyUsd: number;
  monthlyCredits: number;
  allowedCapabilities: string[];
  allowedProviders: string[];
  allowedModels: string[];
  maxQueueLimit: number;
  maxExportLimit: number;
  maxConcurrentJobs: number;
  allowCustomStudioMode: boolean;
  allowAdvancedWorkflows: boolean;
}

export interface UserWallet {
  userId: string;
  remainingCredits: number;
  totalPurchasedCredits: number;
  totalUsedCredits: number;
  updatedAt: string;
}

export interface UserProfile {
  userId: string;
  displayName: string;
  email: string;
  avatarUrl: string;
  createdAt: string;
  currentPlan: PlanTier;
  planName: string;
  remainingCredits: number;
  totalPurchasedCredits: number;
  totalUsedCredits: number;
}

export interface UserSubscription {
  id: string;
  userId: string;
  tier: PlanTier;
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}

export interface UsageRecord {
  id: string;
  userId: string;
  providerId: string;
  modelId: string;
  capability: string;
  executionPlanId: string;
  creditsUsed: number;
  estimatedCost: number;
  actualCost: number;
  durationMs: number;
  status: string;
  timestamp: string;
}

export interface Invoice {
  id: string;
  userId: string;
  subscriptionId: string;
  amount: number;
  currency: string;
  status: string;
  invoicePdfUrl: string;
  createdAt: string;
  paidAt?: string;
}

export interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  priceUsd: number;
  isPopular: boolean;
}

export interface CreditTransaction {
  id: string;
  userId: string;
  amount: number;
  type: string;
  description: string;
  createdAt: string;
}
