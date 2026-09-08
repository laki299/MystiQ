import React, { useEffect, useState } from 'react';
import { fetchUserReports, resolveUserReport } from '../../services/adminService';
import { UserReport, AdminRole } from '../../types/admin';

interface ReportManagerProps {
  adminUid: string;
  adminRole: AdminRole;
}

export const ReportManager: React.FC<ReportManagerProps> = ({
  adminUid,
  adminRole,
}) => {
  const [reports, setReports] = useState<UserReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('pending');

  const loadReports = async () => {
    setLoading(true);
    try {
      const data = await fetchUserReports();
      setReports(data);
    } catch (err) {
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const getTargetUid = (r: UserReport) => r.targetId || r.targetUid || '';
  const getReporterUid = (r: UserReport) => r.reporterId || r.reporterUid || '';

  const handleAction = async (
    reportId: string,
    targetUid: string,
    status: 'reviewed' | 'resolved' | 'dismissed',
    actionTaken: 'none' | 'warn' | 'suspend' | 'block'
  ) => {
    try {
      await resolveUserReport(
        adminUid,
        adminRole,
        reportId,
        targetUid,
        status,
        actionTaken
      );
      await loadReports();
    } catch (err) {
      console.error('Error resolving report:', err);
    }
  };

  const filtered = reports.filter(
    (r) => filterStatus === 'all' || r.status === filterStatus
  );

  return (
    <div className="p-4 space-y-6 text-white bg-slate-900 rounded-xl border border-slate-800 shadow-xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-rose-400">🛡️ Reports & Moderation</h2>
          <p className="text-xs text-slate-400">Review and take action</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs font-medium focus:outline-none focus:border-rose-500"
          >
            <option value="pending">Pending</option>
            <option value="resolved">Resolved</option>
            <option value="dismissed">Dismissed</option>
            <option value="all">All</option>
          </select>
          <button
            onClick={loadReports}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-lg border border-slate-700"
          >
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-6 text-slate-500 text-sm">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-8 text-slate-500 text-sm border border-dashed border-slate-700 rounded-lg">
          No reports under “{filterStatus}”
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((report) => {
            const targetUid = getTargetUid(report);
            return (
              <div
                key={report.id}
                className="p-4 bg-slate-800/60 rounded-lg border border-slate-700 flex flex-col md:flex-row justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                        report.status === 'pending'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : 'bg-slate-700 text-slate-400'
                      }`}
                    >
                      {report.status}
                    </span>
                    <span className="text-xs text-slate-400">
                      {new Date(report.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-sm">
                    <span className="text-slate-400">Reason: </span>
                    <span className="font-semibold text-rose-300">{report.reason}</span>
                  </div>
                  <div className="text-xs text-slate-400 space-x-3">
                    <span>
                      Reporter: <code className="text-indigo-300">{getReporterUid(report)}</code>
                    </span>
                    <span>
                      Target: <code className="text-amber-300">{targetUid}</code>
                    </span>
                  </div>
                </div>

                {report.status === 'pending' && (
                  <div className="flex flex-wrap md:flex-col gap-2 min-w-[140px]">
                    <button
                      onClick={() => handleAction(report.id, targetUid, 'resolved', 'warn')}
                      className="px-3 py-1 bg-amber-500/20 text-amber-300 text-xs font-semibold rounded border border-amber-500/30"
                    >
                      ⚠️ Warn
                    </button>
                    <button
                      onClick={() => handleAction(report.id, targetUid, 'resolved', 'suspend')}
                      className="px-3 py-1 bg-orange-500/20 text-orange-300 text-xs font-semibold rounded border border-orange-500/30"
                    >
                      ⏸️ Suspend
                    </button>
                    <button
                      onClick={() => handleAction(report.id, targetUid, 'resolved', 'block')}
                      className="px-3 py-1 bg-rose-500/20 text-rose-300 text-xs font-semibold rounded border border-rose-500/30"
                    >
                      🚫 Block
                    </button>
                    <button
                      onClick={() => handleAction(report.id, targetUid, 'dismissed', 'none')}
                      className="px-3 py-1 bg-slate-700 text-slate-300 text-xs font-semibold rounded"
                    >
                      Dismiss
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
