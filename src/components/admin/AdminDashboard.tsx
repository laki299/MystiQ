import React, { useState } from 'react';
import { AdminRole } from '../../types/admin';
import { AnalyticsDashboard } from './AnalyticsDashboard';
import { AdManager } from './AdManager';
import { AppSettingsManager } from './AppSettingsManager';
import { ReportManager } from './ReportManager';
import { AuditLogViewer } from './AuditLogViewer';
import { adminDeleteExpiredMessages } from '../../services/adminService';

interface AdminDashboardProps {
  adminUid: string;
  adminRole: AdminRole;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  adminUid,
  adminRole,
}) => {
  const [activeTab, setActiveTab] = useState<
    'analytics' | 'ads' | 'settings' | 'reports' | 'logs' | 'cleanup'
  >('analytics');
  const [cleanupMsg, setCleanupMsg] = useState('');
  const [cleaning, setCleaning] = useState(false);

  const tabs = [
    { id: 'analytics' as const, label: '📊 Analytics', active: 'bg-indigo-600' },
    { id: 'ads' as const, label: '📢 Ads', active: 'bg-amber-600' },
    { id: 'settings' as const, label: '⚙️ Settings', active: 'bg-blue-600' },
    { id: 'reports' as const, label: '🛡️ Reports', active: 'bg-rose-600' },
    { id: 'logs' as const, label: '📜 Logs', active: 'bg-purple-600' },
    { id: 'cleanup' as const, label: '🧹 Cleanup', active: 'bg-emerald-600' },
  ];

  const runCleanup = async () => {
    if (!window.confirm('Delete all expired messages now?')) return;
    setCleaning(true);
    setCleanupMsg('');
    try {
      const n = await adminDeleteExpiredMessages(adminUid, adminRole);
      setCleanupMsg(`Cleanup complete. Deleted ${n} expired messages.`);
    } catch (err) {
      setCleanupMsg('Cleanup failed. Check console.');
      console.error(err);
    } finally {
      setCleaning(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800 pb-4 gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-indigo-400">⚡ Control Panel</h1>
          <p className="text-xs text-slate-400">
            Admin: <span className="text-white font-mono">{adminUid}</span>
          </p>
        </div>
        <span className="text-xs font-bold uppercase px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
          {adminRole}
        </span>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition ${
              activeTab === t.id
                ? `${t.active} text-white shadow-lg`
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div>
        {activeTab === 'analytics' && <AnalyticsDashboard />}
        {activeTab === 'ads' && <AdManager adminUid={adminUid} adminRole={adminRole} />}
        {activeTab === 'settings' && (
          <AppSettingsManager adminUid={adminUid} adminRole={adminRole} />
        )}
        {activeTab === 'reports' && (
          <ReportManager adminUid={adminUid} adminRole={adminRole} />
        )}
        {activeTab === 'logs' && <AuditLogViewer />}
        {activeTab === 'cleanup' && (
          <div className="p-4 space-y-4 text-white bg-slate-900 rounded-xl border border-slate-800">
            <h2 className="text-xl font-bold text-emerald-400">🧹 Database Cleanup</h2>
            <p className="text-xs text-slate-400">
              Spark-compatible manual cleanup. Only deletes records where expiresAt ≤ now.
            </p>
            <button
              onClick={runCleanup}
              disabled={cleaning}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-xs font-bold rounded-xl"
            >
              {cleaning ? 'Cleaning...' : 'Delete Expired Messages'}
            </button>
            {cleanupMsg && (
              <p className="text-xs text-emerald-300 bg-emerald-950/40 border border-emerald-800/40 rounded-lg px-3 py-2">
                {cleanupMsg}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
