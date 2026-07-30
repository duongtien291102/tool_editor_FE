import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { adminService } from '../services/adminService';
import type { AdminUserSummary, AuditLogEntry, FeatureFlag, SystemHealthReport, SystemMetrics } from '../types';
import { MetricsDashboardTab } from './MetricsDashboardTab';
import { SystemHealthTab } from './SystemHealthTab';
import { AuditLogsTab } from './AuditLogsTab';
import { FeatureFlagsTab } from './FeatureFlagsTab';
import { UserManagementTab } from './UserManagementTab';
import { JobsManagementTab } from './JobsManagementTab';
import { BackupExportTab } from './BackupExportTab';

export type AdminTab = 'metrics' | 'health' | 'audit' | 'flags' | 'users' | 'jobs' | 'export';

interface AdminConsoleScreenProps {
  defaultTab?: AdminTab;
}

export const AdminConsoleScreen: React.FC<AdminConsoleScreenProps> = ({ defaultTab = 'metrics' }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<AdminTab>(defaultTab);

  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [health, setHealth] = useState<SystemHealthReport | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>([]);
  const [users, setUsers] = useState<AdminUserSummary[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [m, h, a, f, u] = await Promise.all([
      adminService.getMetrics(),
      adminService.getHealth(),
      adminService.getAuditLogs(),
      adminService.getFeatureFlags(),
      adminService.getUsers()
    ]);
    setMetrics(m);
    setHealth(h);
    setAuditLogs(a);
    setFeatureFlags(f);
    setUsers(u);
  };

  const handleToggleFlag = async (key: string, isEnabled: boolean) => {
    await adminService.toggleFeatureFlag(key, isEnabled);
    const updatedFlags = await adminService.getFeatureFlags();
    setFeatureFlags(updatedFlags);
  };

  const tabs: { key: AdminTab; label: string }[] = [
    { key: 'metrics', label: t('admin.tabs.metrics', '📊 Chỉ số') },
    { key: 'health', label: t('admin.tabs.health', '💚 Sức khỏe') },
    { key: 'audit', label: t('admin.tabs.audit', '📜 Nhật ký Kiểm toán') },
    { key: 'flags', label: t('admin.tabs.flags', '🚩 Cờ Tính năng') },
    { key: 'users', label: t('admin.tabs.users', '👥 Người dùng & Tín chỉ') },
    { key: 'jobs', label: t('admin.tabs.jobs', '⚙️ Công việc & Hàng đợi') },
    { key: 'export', label: t('admin.tabs.export', '💾 Sao lưu & Xuất') }
  ];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800 pb-4 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white">{t('admin.title', 'Bảng điều khiển Quản trị Sản xuất')}</h1>
          <p className="text-slate-400 text-sm mt-1">{t('admin.subtitle', 'Khả năng quan sát hoạt động, sức khỏe hệ thống, nhật ký kiểm toán và kiểm soát tính năng thời gian chạy')}</p>
        </div>

        <button
          onClick={loadData}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg"
        >
          {t('admin.refreshStatus', '🔄 Làm mới Trạng thái Hệ thống')}
        </button>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-2">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === t.key
                ? 'bg-indigo-600 text-white shadow'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'metrics' && <MetricsDashboardTab metrics={metrics} />}
      {activeTab === 'health' && <SystemHealthTab health={health} />}
      {activeTab === 'audit' && <AuditLogsTab logs={auditLogs} />}
      {activeTab === 'flags' && <FeatureFlagsTab flags={featureFlags} onToggleFlag={handleToggleFlag} />}
      {activeTab === 'users' && <UserManagementTab users={users} />}
      {activeTab === 'jobs' && <JobsManagementTab />}
      {activeTab === 'export' && <BackupExportTab />}
    </div>
  );
};
