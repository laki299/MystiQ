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
      console.error("Error fetching analytics:", err);
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
        <span className="ml-3 text-sm font-medium">Fetching Realtime Analytics...</span>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 text-white bg-slate-900 rounded-xl border border-slate-800 shadow-xl">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-indigo-400">📊 System Analytics</h2>
          <p className="text-xs text-slate-400">Realtime platform overview and database metrics</p>
        </div>
        <button 
          onClick={loadData}
          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold rounded-lg transition shadow-md"
        >
          Refresh Data
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-800/80 p-4 rounded-lg border border-slate-700">
          <p className="text-xs text-slate-400 uppercase font-semibold">Total Users</p>
          <p className="text-2xl font-black text-white mt-1">{analytics?.totalUsers}</p>
        </div>

        <div className="bg-slate-800/80 p-4 rounded-lg border border-emerald-800/50">
          <p className="text-xs text-slate-400 uppercase font-semibold">Active Now</p>
          <p className="text-2xl font-black text-emerald-400 mt-1">{analytics?.activeUsersNow}</p>
        </div>

        <div className="bg-slate-800/80 p-4 rounded-lg border border-rose-800/50">
          <p className="text-xs text-slate-400 uppercase font-semibold">Pending Reports</p>
          <p className="text-2xl font-black text-rose-400 mt-1">{analytics?.totalReportsPending}</p>
        </div>

        <div className="bg-slate-800/80 p-4 rounded-lg border border-slate-700">
          <p className="text-xs text-slate-400 uppercase font-semibold">Est. Storage Payload</p>
          <p className="text-2xl font-black text-cyan-400 mt-1">{analytics?.estimatedRtdbSizeKb} KB</p>
        </div>
      </div>

      <div className="bg-slate-800/80 p-4 rounded-lg border border-slate-700 space-y-3">
        <h3 className="text-sm font-semibold text-slate-300">💬 Chat & Session Activity</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex justify-between border-b border-slate-700 pb-2">
            <span className="text-slate-400">Active Public Categories:</span>
            <span className="font-bold text-indigo-300">{analytics?.activePublicChats}</span>
          </div>
          <div className="flex justify-between border-b border-slate-700 pb-2">
            <span className="text-slate-400">Direct Conversations:</span>
            <span className="font-bold text-indigo-300">{analytics?.totalDirectConversations}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
          
