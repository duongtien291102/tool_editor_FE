import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { commercialService } from '../services/commercialService';
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
import { ProfileTab } from './ProfileTab';
import { SubscriptionTab } from './SubscriptionTab';
import { PricingTab } from './PricingTab';
import { CreditsTab } from './CreditsTab';
import { UsageTab } from './UsageTab';
import { InvoicesTab } from './InvoicesTab';

export type CommercialTab = 'profile' | 'subscription' | 'pricing' | 'credits' | 'usage' | 'invoices';

interface CommercialScreenProps {
  defaultTab?: CommercialTab;
}

export const CommercialScreen: React.FC<CommercialScreenProps> = ({ defaultTab = 'profile' }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<CommercialTab>(defaultTab);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [policy, setPolicy] = useState<PlanPolicy | null>(null);
  const [wallet, setWallet] = useState<UserWallet | null>(null);
  const [packages, setPackages] = useState<CreditPackage[]>([]);
  const [usage, setUsage] = useState<UsageRecord[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadCommercialData();
  }, []);

  const loadCommercialData = async () => {
    setLoading(true);
    try {
      const [profData, subData, credData, usageData, invData, txData] = await Promise.all([
        commercialService.getProfile(),
        commercialService.getSubscription(),
        commercialService.getCredits(),
        commercialService.getUsage(),
        commercialService.getInvoices(),
        commercialService.getTransactions()
      ]);

      setProfile(profData);
      setSubscription(subData.subscription);
      setPolicy(subData.policy);
      setWallet(credData.wallet);
      setPackages(credData.packages);
      setUsage(usageData);
      setInvoices(invData);
      setTransactions(txData);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgradePlan = async (tier: PlanTier) => {
    const updatedSub = await commercialService.upgradePlan(tier);
    setSubscription(updatedSub);
    await loadCommercialData();
    setActiveTab('subscription');
  };

  const handlePurchaseCredits = async (packageId: string) => {
    const updatedWallet = await commercialService.purchaseCredits(packageId);
    setWallet(updatedWallet);
    await loadCommercialData();
    setActiveTab('credits');
  };

  if (loading || !profile || !subscription || !policy || !wallet) {
    return (
      <div className="p-8 text-center text-slate-400">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-800 rounded w-1/4 mx-auto" />
          <div className="h-48 bg-slate-800 rounded max-w-4xl mx-auto" />
        </div>
      </div>
    );
  }

  const policies = commercialService.getAllPolicies();

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800 pb-4 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white">{t('commercial.title', 'Trung tâm Thương mại & SaaS')}</h1>
          <p className="text-slate-400 text-sm mt-1">{t('commercial.description', 'Quản lý tài khoản người dùng, đăng ký gói, ví tín chỉ, lịch sử sử dụng và hóa đơn thanh toán')}</p>
        </div>

        <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 p-2 rounded-xl">
          <span className="text-xs text-slate-400 font-medium">{t('common.credits', 'Tín chỉ')}:</span>
          <span className="text-lg font-black text-indigo-400">{wallet.remainingCredits.toLocaleString()}</span>
          <button
            onClick={() => setActiveTab('credits')}
            className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow"
          >
            + {t('commercial.profile.purchaseCredits', 'Mua Tín chỉ')}
          </button>
        </div>
      </div>

      {/* Commercial Tabs Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-2">
        {(['profile', 'subscription', 'pricing', 'credits', 'usage', 'invoices'] as CommercialTab[]).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all capitalize ${
              activeTab === tab
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            {t(`commercial.tabs.${tab}`, tab)}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      {activeTab === 'profile' && <ProfileTab profile={profile} />}
      {activeTab === 'subscription' && (
        <SubscriptionTab
          subscription={subscription}
          policy={policy}
          onUpgradeClick={() => setActiveTab('pricing')}
        />
      )}
      {activeTab === 'pricing' && (
        <PricingTab
          policies={policies}
          currentTier={subscription.tier}
          onSelectPlan={handleUpgradePlan}
        />
      )}
      {activeTab === 'credits' && (
        <CreditsTab
          wallet={wallet}
          packages={packages}
          onPurchase={handlePurchaseCredits}
        />
      )}
      {activeTab === 'usage' && <UsageTab usage={usage} />}
      {activeTab === 'invoices' && (
        <InvoicesTab
          invoices={invoices}
          transactions={transactions}
        />
      )}
    </div>
  );
};
