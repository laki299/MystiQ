import React, { useEffect, useState } from 'react';
import { fetchSystemAnalytics } from '../../services/adminService';
import { SystemAnalytics } from '../../types/admin';

export const AnalyticsDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<SystemAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchSystemAnalytics();
      setAnalytics(data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8 text-indigo-400">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
        <span className="ml-3 text-sm font-medium">Fetching analytics...</span>
      </div>
    );
  }

  const cards = [
    { label: 'Total Users', value: analytics?.totalUsers ?? 0, color: 'text-white', border: 'border-slate-700' },
    { label: 'Active Now', value: analytics?.activeUsersNow ?? 0, color: 'text-emerald-400', border: 'border-emerald-800/50' },
    { label: 'New Today', value: analytics?.todayNewUsers ?? 0, color: 'text-cyan-400', border: 'border-cyan-800/50' },
    { label: 'Inactive (30d+)', value: analytics?.inactiveUsers ?? 0, color: 'text-amber-400', border: 'border-amber-800/50' },
    { label: 'Active Chats', value: analytics?.totalDirectConversations ?? 0, color: 'text-indigo-300', border: 'border-slate-700' },
    { label: 'Pending Requests', value: analytics?.totalPendingRequests ?? 0, color: 'text-purple-300', border: 'border-purple-800/40' },
    { label: 'Pending Reports', value: analytics?.totalReportsPending ?? 0, color: 'text-rose-400', border: 'border-rose-800/50' },
    { label: 'Est. RTDB Size', value: `${analytics?.estimatedRtdbSizeKb ?? 0} KB`, color: 'text-slate-200', border: 'border-slate-700' },
  ];

  return (
    <div className="p-4 space-y-6 text-white bg-slate-900 rounded-xl border border-slate-800 shadow-xl">
      <div className="flex justify-between items-center gap-3">
        <div>
          <h2 className="text-xl font-bold text-indigo-400">📊 System Analytics</h2>
          <p className="text-xs text-slate-400">Realtime platform overview</p>
        </div>
        <button
          onClick={loadData}
          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold rounded-lg transition shadow-md"
        >
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {cards.map((c) => (
          <div
            key={c.label}
            className={`bg-slate-800/80 p-4 rounded-lg border ${c.border}`}
          >
            <p className="text-[10px] text-slate-400 uppercase font-semibold tracking-wide">
              {c.label}
            </p>
            <p className={`text-2xl font-black mt-1 ${c.color}`}>{c.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-slate-800/60 p-4 rounded-lg border border-slate-700 text-xs text-slate-400 space-y-1">
        <p>
          <span className="text-slate-300 font-semibold">Active Now</span> = unique users with
          non-expired presence heartbeat.
        </p>
        <p>
          <span className="text-slate-300 font-semibold">New Today</span> = accounts created since
          local midnight.
        </p>
        <p>
          <span className="text-slate-300 font-semibold">Inactive</span> = lastActiveAt older than 30
          days (profile kept).
        </p>
      </div>
    </div>
  );
};
