import React, { useEffect, useState } from 'react';
import {
  fetchRegisteredUsers,
  RegisteredUserRow,
} from '../../services/adminService';

export const UsersManager: React.FC = function () {
  var listState = useState([] as RegisteredUserRow[]);
  var list = listState[0];
  var setList = listState[1];
  var loadingState = useState(true);
  var loading = loadingState[0];
  var setLoading = loadingState[1];
  var errState = useState('');
  var err = errState[0];
  var setErr = errState[1];

  async function load() {
    setLoading(true);
    setErr('');
    try {
      var rows = await fetchRegisteredUsers();
      setList(rows);
    } catch (e: any) {
      setErr(e && e.message ? String(e.message) : 'Failed to load users');
      setList([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(function () {
    load();
  }, []);

  function fmt(ts: number) {
    if (!ts) return '—';
    try {
      return new Date(ts).toLocaleString();
    } catch (e) {
      return '—';
    }
  }

  return (
    <div className="p-4 space-y-4 text-white bg-slate-900 rounded-xl border border-slate-800">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-cyan-400">Registered Users</h2>
          <p className="text-xs text-slate-400">
            Total: <span className="text-white font-bold">{list.length}</span>
          </p>
        </div>
        <button
          type="button"
          onClick={load}
          className="px-3 py-1.5 bg-cyan-700 text-xs font-bold rounded-lg"
        >
          Refresh
        </button>
      </div>

      {err ? (
        <p className="text-xs text-rose-300 bg-rose-950/40 border border-rose-800 rounded-lg px-3 py-2">
          {err}
        </p>
      ) : null}

      {loading ? (
        <p className="text-sm text-slate-400">Loading...</p>
      ) : list.length === 0 ? (
        <p className="text-sm text-slate-500">No users found in database.</p>
      ) : (
        <div className="space-y-2 max-h-[70vh] overflow-y-auto">
          {list.map(function (u) {
            return (
              <div
                key={u.uid}
                className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 space-y-1"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-bold text-white truncate">
                    {u.anonymousName || '—'}
                  </p>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 uppercase">
                    {u.role}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  @{u.username || '—'} · {u.gender || '—'} · coins:{' '}
                  {u.hostCoins}
                </p>
                <p className="text-[10px] text-slate-500 font-mono break-all">
                  {u.uid}
                </p>
                <p className="text-[10px] text-slate-500">
                  Joined: {fmt(u.createdAt)} · Last: {fmt(u.lastActiveAt)} ·{' '}
                  {u.accountStatus}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
