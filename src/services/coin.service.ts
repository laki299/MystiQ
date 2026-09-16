import { ref, get, set, update, push, increment } from 'firebase/database';
import { rtdb } from '../config/firebase.config';
import { CoinLog, WithdrawRequest } from '../types/admin';
import { fetchAppSettings } from './adminService';
import { recordPaidAdView } from './wallet.service';

export const getHostCoins = async function (uid: string): Promise<number> {
  var snap = await get(ref(rtdb, 'users/' + uid + '/hostCoins'));
  if (!snap.exists()) return 0;
  return Number(snap.val()) || 0;
};

export const getCoinPool = async function (): Promise<number> {
  var snap = await get(ref(rtdb, 'coin_pool/totalCoins'));
  if (!snap.exists()) return 0;
  return Number(snap.val()) || 0;
};

/** NetworkAdRunner থেকে কল — MultiTag ভিউ */
export async function recordAdViewCoins(viewerUid: string): Promise<void> {
  if (!viewerUid) return;
  try {
    await recordPaidAdView(viewerUid);
  } catch (e) {
    console.warn('[recordAdViewCoins]', e);
  }
}

export const adminAdjustHostCoins = async function (
  targetUid: string,
  delta: number,
  adminUid: string,
  note?: string
): Promise<number> {
  var path = 'users/' + targetUid + '/hostCoins';
  var snap = await get(ref(rtdb, path));
  var current = snap.exists() ? Number(snap.val()) || 0 : 0;
  var next = current + delta;
  if (next < 0) next = 0;
  await update(ref(rtdb, 'users/' + targetUid), { hostCoins: next });

  var logRef = push(ref(rtdb, 'coin_logs'));
  await set(logRef, {
    id: logRef.key,
    type: delta >= 0 ? 'admin_add' : 'admin_remove',
    uid: targetUid,
    amount: delta,
    note: note || '',
    by: adminUid,
    at: Date.now(),
  });
  return next;
};

export const setUserAsHost = async function (
  targetUid: string,
  isHost: boolean
): Promise<void> {
  await update(ref(rtdb, 'users/' + targetUid), {
    role: isHost ? 'host' : 'user',
  });
};

export const requestWithdraw = async function (
  uid: string,
  amount: number,
  meta?: { username?: string; anonymousName?: string }
): Promise<string> {
  var settings = await fetchAppSettings();
  var min = settings.minWithdrawCoins || 100;
  if (amount < min) {
    throw new Error('Minimum withdraw is ' + min + ' coins');
  }
  var coins = await getHostCoins(uid);
  if (amount > coins) {
    throw new Error('Not enough coins');
  }

  var reqRef = push(ref(rtdb, 'withdraw_requests'));
  var data: WithdrawRequest = {
    id: reqRef.key || '',
    uid: uid,
    username: meta && meta.username,
    anonymousName: meta && meta.anonymousName,
    amount: amount,
    status: 'pending',
    createdAt: Date.now(),
  };
  await set(reqRef, data);
  return data.id;
};

export const adminReviewWithdraw = async function (
  requestId: string,
  approve: boolean,
  adminUid: string,
  note?: string
): Promise<void> {
  var snap = await get(ref(rtdb, 'withdraw_requests/' + requestId));
  if (!snap.exists()) throw new Error('Request not found');
  var req = snap.val() as WithdrawRequest;
  if (req.status !== 'pending') throw new Error('Already reviewed');

  if (approve) {
    var coins = await getHostCoins(req.uid);
    if (req.amount > coins) throw new Error('Host has insufficient coins');
    await update(ref(rtdb, 'users/' + req.uid), {
      hostCoins: coins - req.amount,
    });
    var logRef = push(ref(rtdb, 'coin_logs'));
    await set(logRef, {
      id: logRef.key,
      type: 'withdraw',
      uid: req.uid,
      amount: -req.amount,
      note: note || 'approved',
      by: adminUid,
      at: Date.now(),
    });
  }

  await update(ref(rtdb, 'withdraw_requests/' + requestId), {
    status: approve ? 'approved' : 'rejected',
    reviewedAt: Date.now(),
    reviewedBy: adminUid,
    note: note || '',
  });
};

export const fetchWithdrawRequests = async function (): Promise<
  WithdrawRequest[]
> {
  var snap = await get(ref(rtdb, 'withdraw_requests'));
  if (!snap.exists()) return [];
  var val = snap.val();
  return Object.keys(val)
    .map(function (k) {
      return Object.assign({ id: k }, val[k]);
    })
    .sort(function (a, b) {
      return (b.createdAt || 0) - (a.createdAt || 0);
    });
};

export const distributePoolToHosts = async function (
  adminUid: string
): Promise<{ each: number; hosts: number }> {
  var pool = await getCoinPool();
  if (pool <= 0) return { each: 0, hosts: 0 };

  var usersSnap = await get(ref(rtdb, 'users'));
  if (!usersSnap.exists()) return { each: 0, hosts: 0 };
  var users = usersSnap.val();
  var hostUids: string[] = [];
  Object.keys(users).forEach(function (uid) {
    if (users[uid] && users[uid].role === 'host') hostUids.push(uid);
  });
  if (hostUids.length === 0) return { each: 0, hosts: 0 };

  var each = Math.floor(pool / hostUids.length);
  if (each <= 0) return { each: 0, hosts: hostUids.length };

  var updates: Record<string, unknown> = {};
  hostUids.forEach(function (uid) {
    var cur = Number(users[uid].hostCoins) || 0;
    updates['users/' + uid + '/hostCoins'] = cur + each;
  });
  updates['coin_pool/totalCoins'] = pool - each * hostUids.length;
  updates['coin_pool/updatedAt'] = Date.now();
  await update(ref(rtdb), updates);

  var logRef = push(ref(rtdb, 'coin_logs'));
  await set(logRef, {
    id: logRef.key,
    type: 'distribute',
    amount: each * hostUids.length,
    note: 'each=' + each + ' hosts=' + hostUids.length,
    by: adminUid,
    at: Date.now(),
  });

  return { each: each, hosts: hostUids.length };
};
