import type {
  UserProfile,
  UserSubscription,
  UserWallet,
  UsageRecord,
  Invoice,
  CreditPackage,
  CreditTransaction,
  PlanPolicy,
  PlanTier
} from '../types';

class CommercialService {
  private profileMock: UserProfile = {
    userId: 'usr-saas-demo',
    displayName: 'Senior AI Engineer',
    email: 'engineer@aistudio.local',
    avatarUrl: 'https://ui-avatars.com/api/?name=AI+Studio&background=6366f1&color=fff',
    createdAt: new Date(Date.now() - 90 * 86400000).toISOString(),
    currentPlan: 'Minimum',
    planName: 'Creator Pro',
    remainingCredits: 2450,
    totalPurchasedCredits: 2500,
    totalUsedCredits: 50
  };

  private subscriptionMock: UserSubscription = {
    id: 'sub-creator-1',
    userId: 'usr-saas-demo',
    tier: 'Minimum',
    status: 'Active',
    currentPeriodStart: new Date().toISOString(),
    currentPeriodEnd: new Date(Date.now() + 30 * 86400000).toISOString(),
    cancelAtPeriodEnd: false
  };

  private policyMock: Record<PlanTier, PlanPolicy> = {
    Free: {
      tier: 'Free',
      name: 'Free Starter',
      priceMonthlyUsd: 0,
      monthlyCredits: 100,
      allowedCapabilities: ['text-generation', 'reasoning', 'translation', 'subtitle-generation'],
      allowedProviders: ['mock', 'openai'],
      allowedModels: ['gpt-4o-mini'],
      maxQueueLimit: 2,
      maxExportLimit: 3,
      maxConcurrentJobs: 1,
      allowCustomStudioMode: false,
      allowAdvancedWorkflows: false
    },
    Minimum: {
      tier: 'Minimum',
      name: 'Creator Pro',
      priceMonthlyUsd: 29,
      monthlyCredits: 2500,
      allowedCapabilities: ['text-generation', 'reasoning', 'translation', 'subtitle-generation', 'image-generation', 'vision', 'review'],
      allowedProviders: ['mock', 'openai', 'gemini', 'runway'],
      allowedModels: ['gpt-4o', 'gpt-4o-mini', 'dall-e-3', 'gemini-1.5-pro'],
      maxQueueLimit: 10,
      maxExportLimit: 50,
      maxConcurrentJobs: 3,
      allowCustomStudioMode: true,
      allowAdvancedWorkflows: true
    },
    Maximum: {
      tier: 'Maximum',
      name: 'Studio Enterprise',
      priceMonthlyUsd: 99,
      monthlyCredits: 10000,
      allowedCapabilities: ['*'],
      allowedProviders: ['*'],
      allowedModels: ['*'],
      maxQueueLimit: 100,
      maxExportLimit: 1000,
      maxConcurrentJobs: 10,
      allowCustomStudioMode: true,
      allowAdvancedWorkflows: true
    }
  };

  private packagesMock: CreditPackage[] = [
    { id: 'pkg-starter', name: 'Starter Boost', credits: 500, priceUsd: 4.99, isPopular: false },
    { id: 'pkg-pro', name: 'Creator Pack', credits: 2500, priceUsd: 19.99, isPopular: true },
    { id: 'pkg-studio', name: 'Studio Mega Pack', credits: 10000, priceUsd: 69.99, isPopular: false }
  ];

  private usageMock: UsageRecord[] = [
    {
      id: 'use-1',
      userId: 'usr-saas-demo',
      providerId: 'openai',
      modelId: 'gpt-4o',
      capability: 'text-generation',
      executionPlanId: 'plan-script-101',
      creditsUsed: 5,
      estimatedCost: 0.005,
      actualCost: 0.005,
      durationMs: 1250,
      status: 'Success',
      timestamp: new Date(Date.now() - 600000).toISOString()
    },
    {
      id: 'use-2',
      userId: 'usr-saas-demo',
      providerId: 'openai',
      modelId: 'dall-e-3',
      capability: 'image-generation',
      executionPlanId: 'plan-img-102',
      creditsUsed: 40,
      estimatedCost: 0.04,
      actualCost: 0.04,
      durationMs: 5400,
      status: 'Success',
      timestamp: new Date(Date.now() - 2100000).toISOString()
    }
  ];

  async getProfile(): Promise<UserProfile> {
    return { ...this.profileMock };
  }

  async getSubscription(): Promise<{ subscription: UserSubscription; policy: PlanPolicy }> {
    return {
      subscription: { ...this.subscriptionMock },
      policy: { ...this.policyMock[this.subscriptionMock.tier] }
    };
  }

  async upgradePlan(tier: PlanTier): Promise<UserSubscription> {
    this.subscriptionMock = {
      ...this.subscriptionMock,
      tier,
      currentPeriodStart: new Date().toISOString(),
      currentPeriodEnd: new Date(Date.now() + 30 * 86400000).toISOString()
    };
    this.profileMock.currentPlan = tier;
    this.profileMock.planName = this.policyMock[tier].name;
    this.profileMock.remainingCredits += this.policyMock[tier].monthlyCredits;
    return { ...this.subscriptionMock };
  }

  async getCredits(): Promise<{ wallet: UserWallet; packages: CreditPackage[] }> {
    return {
      wallet: {
        userId: this.profileMock.userId,
        remainingCredits: this.profileMock.remainingCredits,
        totalPurchasedCredits: this.profileMock.totalPurchasedCredits,
        totalUsedCredits: this.profileMock.totalUsedCredits,
        updatedAt: new Date().toISOString()
      },
      packages: [...this.packagesMock]
    };
  }

  async purchaseCredits(packageId: string): Promise<UserWallet> {
    const pkg = this.packagesMock.find(p => p.id === packageId);
    if (pkg) {
      this.profileMock.remainingCredits += pkg.credits;
      this.profileMock.totalPurchasedCredits += pkg.credits;
    }
    return {
      userId: this.profileMock.userId,
      remainingCredits: this.profileMock.remainingCredits,
      totalPurchasedCredits: this.profileMock.totalPurchasedCredits,
      totalUsedCredits: this.profileMock.totalUsedCredits,
      updatedAt: new Date().toISOString()
    };
  }

  async getUsage(): Promise<UsageRecord[]> {
    return [...this.usageMock];
  }

  async getInvoices(): Promise<Invoice[]> {
    return [
      {
        id: 'inv-2026-001',
        userId: this.profileMock.userId,
        subscriptionId: this.subscriptionMock.id,
        amount: 29.0,
        currency: 'USD',
        status: 'Paid',
        invoicePdfUrl: 'https://ai-studio.local/invoices/inv-2026-001.pdf',
        createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
        paidAt: new Date(Date.now() - 5 * 86400000).toISOString()
      }
    ];
  }

  async getTransactions(): Promise<CreditTransaction[]> {
    return [
      {
        id: 'tx-001',
        userId: this.profileMock.userId,
        amount: 2500,
        type: 'SubscriptionGrant',
        description: 'Creator Pro Monthly Grant',
        createdAt: new Date(Date.now() - 5 * 86400000).toISOString()
      },
      {
        id: 'tx-002',
        userId: this.profileMock.userId,
        amount: -40,
        type: 'ActionUsage',
        description: 'DALL-E 3 Image Generation',
        createdAt: new Date(Date.now() - 2100000).toISOString()
      }
    ];
  }

  getAllPolicies(): PlanPolicy[] {
    return Object.values(this.policyMock);
  }
}

export const commercialService = new CommercialService();
