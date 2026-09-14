import React, { useEffect, useState } from 'react';
import {
  fetchRegisteredUsers,
  RegisteredUserRow,
} from '../../services/adminService';
import {
  adminAdjustHostCoins,
  setUserAsHost,
  getCoinPool,
  distributePoolToHosts,
  fetchWithdrawRequests,
  adminReviewWithdraw,
} from '../../services/coin.service';
import { WithdrawRequest } from '../../types/admin';

interface HostManagerProps {
  adminUid: string;
}

export const HostManager: React.FC<HostManagerProps> = function (props) {
  var adminUid = props.adminUid;
  var usersState = useState([] as RegisteredUserRow[]);
  var users = usersState[0];
  var setUsers = usersState[1];
  var poolState = useState(0);
  var pool = poolState[0];
  var setPool = poolState[1];
  var reqsState = useState([] as WithdrawRequest[]);
  var reqs = reqsState[0];
  var setReqs = reqsState[1];
  var msgState = useState('');
  var msg = msgState[0];
  var setMsg = msgState[1];
  var loadingState = useState(true);
  var loading = loadingState[0];
  var setLoading = loadingState[1];
  var coinInputState = useState({} as Record<string, string>);
  var coinInputs = coinInputState[0];
  var setCoinInputs = coinInputState[1];

  async function load() {
    setLoading(true);
    try {
      var rows = await fetchRegisteredUsers();
      setUsers(rows);
      var p = await getCoinPool();
      setPool(p);
      var w = await fetchWithdrawRequests();
      setReqs(w);
    } catch (e: any) {
      setMsg(e && e.message ? e.message : 'Load failed');
    } finally {
      setLoading(false);
    }
  }

  useEffect(function () {
    load();
  }, []);

  async function toggleHost(uid: string, makeHost: boolean) {
    try {
      await setUserAsHost(uid, makeHost);
      setMsg(makeHost ? 'Set as host' : 'Removed host role');
      await load();
    } catch (e: any) {
      setMsg(e && e.message ? e.message : 'Failed');
    }
  }

  async function addCoins(uid: string) {
    var raw = coinInputs[uid] || '0';
    var n = Number(raw);
    if (!n || isNaN(n)) {
      setMsg('Enter a valid coin amount');
      return;
    }
    try {
      await adminAdjustHostCoins(uid, n, adminUid, 'manual admin adjust');
      setMsg('Coins updated');
      setCoinInputs(function (prev) {
        var next = Object.assign({}, prev);
        next[uid] = '';
        return next;
      });
      await load();
    } catch (e: any) {
      setMsg(e && e.message ? e.message : 'Failed');
    }
  }

  async function doDistribute() {
    if (!window.confirm('Distribute coin pool equally to all hosts?')) return;
    try {
      var r = await distributePoolToHosts(adminUid);
      setMsg(
        'Distributed ' + r.each + ' coins to each of ' + r.hosts + ' hosts'
      );
      await load();
    } catch (e: any) {
      setMsg(e && e.message ? e.message : 'Distribute failed');
    }
  }

  async function review(id: string, ok: boolean) {
    try {
      await adminReviewWithdraw(id, ok, adminUid, ok ? 'paid offline' : 'rejected');
      setMsg(ok ? 'Withdraw approved' : 'Withdraw rejected');
      await load();
    } catch (e: any) {
      setMsg(e && e.message ? e.message : 'Review failed');
    }
  }

  if (loading) {
    return <p className="text-sm text-slate-400 p-4">Loading hosts...</p>;
  }

  return (
    <div className="space-y-6 text-white">
      <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-emerald-400">Hosts & Coins</h2>
            <p className="text-xs text-slate-400">
              Pool:{' '}
              <span className="text-emerald-300 font-bold">{pool}</span> coins
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={load}
              className="px-3 py-1.5 bg-slate-800 text-xs font-bold rounded-lg"
            >
              Refresh
            </button>
            <button
              type="button"
              onClick={doDistribute}
              className="px-3 py-1.5 bg-emerald-700 text-xs font-bold rounded-lg"
            >
              Distribute Pool
            </button>
          </div>
        </div>
        {msg ? (
          <p className="text-xs text-slate-200 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2">
            {msg}
          </p>
        ) : null}
      </div>

      <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
        <h3 className="text-sm font-bold text-cyan-300">All users</h3>
        <div className="space-y-2 max-h-[50vh] overflow-y-auto">
          {users.map(function (u) {
            var isHost = u.role === 'host';
            return (
              <div
                key={u.uid}
                className="rounded-xl border border-slate-800 bg-slate-950/50 p-3 space-y-2"
              >
                <div className="flex justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-bold truncate">
                      {u.anonymousName}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      @{u.username} · {u.role} · coins: {u.hostCoins}
                    </p>
                    <p className="text-[10px] text-slate-600 font-mono break-all">
                      {u.uid}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={function () {
                      toggleHost(u.uid, !isHost);
                    }}
                    className={
                      'px-2.5 py-1 text-[10px] font-bold rounded-lg shrink-0 ' +
                      (isHost
                        ? 'bg-amber-900 text-amber-200'
                        : 'bg-emerald-900 text-emerald-200')
                    }
                  >
                    {isHost ? 'Remove host' : 'Make host'}
                  </button>
                </div>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="+ / - coins"
                    value={coinInputs[u.uid] || ''}
                    onChange={function (e) {
                      var v = e.target.value;
                      setCoinInputs(function (prev) {
                        var next = Object.assign({}, prev);
                        next[u.uid] = v;
                        return next;
                      });
                    }}
                    className="flex-1 px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs"
                  />
                  <button
                    type="button"
                    onClick={function () {
                      addCoins(u.uid);
                    }}
                    className="px-3 py-1.5 bg-indigo-700 text-xs font-bold rounded-lg"
                  >
                    Apply
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
        <h3 className="text-sm font-bold text-amber-300">Withdraw requests</h3>
        {reqs.length === 0 ? (
          <p className="text-xs text-slate-500">No requests</p>
        ) : (
          reqs.map(function (r) {
            return (
              <div
                key={r.id}
                className="rounded-xl border border-slate-800 p-3 space-y-1"
              >
                <p className="text-sm font-bold">
                  {r.anonymousName || r.username || r.uid} — {r.amount} coins
                </p>
                <p className="text-[10px] text-slate-500">
                  {r.status} · {new Date(r.createdAt).toLocaleString()}
                </p>
                {r.status === 'pending' ? (
                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={function () {
                        review(r.id, true);
                      }}
                      className="px-3 py-1 bg-emerald-700 text-[10px] font-bold rounded-lg"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={function () {
                        review(r.id, false);
                      }}
                      className="px-3 py-1 bg-rose-800 text-[10px] font-bold rounded-lg"
                    >
                      Reject
                    </button>
                  </div>
                ) : null}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
