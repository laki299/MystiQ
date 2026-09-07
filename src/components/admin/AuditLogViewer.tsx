import React, { useEffect, useState } from 'react';
import { fetchAuditLogs } from '../../services/adminService';
import { AuditLog } from '../../types/admin';

export const AuditLogViewer: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await fetchAuditLogs(100);
      setLogs(data);
    } catch (err) {
      console.error("Error fetching audit logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  return (
    <div className="p-4 space-y-6 text-white bg-slate-900 rounded-xl border border-slate-800 shadow-xl">
      <div className="flex justify-between items-center border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-purple-400">📜 Audit Logs</h2>
          <p className="text-xs text-slate-400">Track all administrative activities and system changes</p>
        </div>
        <button
          onClick={loadLogs}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-lg transition border border-slate-700"
        >
          Refresh Logs
        </button>
      </div>

      {loading ? (
        <div className="text-center py-6 text-slate-500 text-sm">Loading Audit Logs...</div>
      ) : logs.length === 0 ? (
        <div className="text-center py-8 text-slate-500 text-sm bg-slate-800/30 rounded-lg border border-dashed border-slate-700">
          No audit logs recorded yet.
        </div>
      ) : (
        <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
          {logs.map((log) => (
            <div 
              key={log.id} 
              className="p-3 bg-slate-800/60 rounded-lg border border-slate-700/80 text-xs flex flex-col md:flex-row md:items-center justify-between gap-2"
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-purple-300 uppercase">{log.action}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 border border-purple-500/30 font-semibold">
                    {log.adminRole}
                  </span>
                </div>
                <p className="text-slate-300">{log.details}</p>
                <div className="text-[11px] text-slate-400">
                  Admin UID: <code className="text-slate-300">{log.adminUid}</code>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 whitespace-nowrap">
                {new Date(log.timestamp).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

