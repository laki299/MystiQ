import React, { useState } from 'react';
import { AdminRole } from '../../types/admin';
import { AnalyticsDashboard } from './AnalyticsDashboard';
import { AdManager } from './AdManager';
import { AppSettingsManager } from './AppSettingsManager';
import { ReportManager } from './ReportManager';
import { AuditLogViewer } from './AuditLogViewer';

interface AdminDashboardProps {
  adminUid: string;
  adminRole: AdminRole;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ adminUid, adminRole }) => {
  const [activeTab, setActiveTab] = useState<'analytics' | 'ads' | 'settings' | 'reports' | 'logs'>('analytics');

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800 pb-4 gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-indigo-400">⚡ Control Panel Dashboard</h1>
          <p className="text-xs text-slate-400">Logged in as: <span className="text-white font-mono">{adminUid}</span></p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-400">Role:</span>
          <span className="text-xs font-bold uppercase px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            {adminRole}
          </span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition ${
            activeTab === 'analytics' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
          }`}
        >
          📊 System Analytics
        </button>

        <button
          onClick={() => setActiveTab('ads')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition ${
            activeTab === 'ads' ? 'bg-amber-600 text-white shadow-lg' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
          }`}
        >
          📢 Ad Manager
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition ${
            activeTab === 'settings' ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
          }`}
        >
          ⚙️ App Settings
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition ${
            activeTab === 'reports' ? 'bg-rose-600 text-white shadow-lg' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
          }`}
        >
          🛡️ Reports & Moderation
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition ${
            activeTab === 'logs' ? 'bg-purple-600 text-white shadow-lg' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
          }`}
        >
          📜 Audit Logs
        </button>
      </div>

      {/* Active Tab View */}
      <div>
        {activeTab === 'analytics' && <AnalyticsDashboard />}
        {activeTab === 'ads' && <AdManager adminUid={adminUid} adminRole={adminRole} />}
        {activeTab === 'settings' && <AppSettingsManager adminUid={adminUid} adminRole={adminRole} />}
        {activeTab === 'reports' && <ReportManager adminUid={adminUid} adminRole={adminRole} />}
        {activeTab === 'logs' && <AuditLogViewer />}
      </div>
    </div>
  );
};
          
