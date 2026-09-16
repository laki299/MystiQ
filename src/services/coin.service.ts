import { ref, get, set, update, push, runTransaction } from 'firebase/database';
import { rtdb } from '../config/firebase.config';
import { recordPaidAdView } from './wallet.service';
import { CoinPool, WithdrawRequest } from '../types/admin';

/** NetworkAdRunner → ওয়ালেট কয়েন */
export async function recordAdViewCoins(viewerUid: string): Promise<void> {
  if (!viewerUid) return;
  try {
    await recordPaidAdView(viewerUid);
  } catch (e) {
    console.warn('[recordAdViewCoins]', e);
  }
}

export async function getHostCoins(uid: string): Promise<number> {
  const snap = await get(ref(rtdb, 'users/' + uid));
  if (!snap.exists()) return 0;
  const u = snap.val();
  if (typeof u.coins === 'number') return u.coins;
  if (typeof u.hostCoins === 'number') return u.hostCoins;
  return 0;
}

export async function getCoinPool(): Promise<CoinPool> {
  const snap = await get(ref(rtdb, 'coin_pool'));
  if (!snap.exists()) {
    return { totalCoins: 0, updatedAt: Date.now() };
  }
  const v = snap.val();
  return {
    totalCoins: typeof v.totalCoins === 'number' ? v.totalCoins : 0,
    updatedAt: v.updatedAt || Date.now(),
  };
}

export async function adminAdjustHostCoins(
  targetUid: string,
  delta: number,
  adminUid: string
): Promise<void> {
  const userRef = ref(rtdb, 'users/' + targetUid);
  await runTransaction(userRef, (current) => {
    if (!current) return current;
    const c =
      typeof current.coins === 'number'
        ? current.coins
        : typeof current.hostCoins === 'number'
          ? current.hostCoins
          : 0;
    const next = c + delta;
    current.coins = next < 0 ? 0 : next;
    current.hostCoins = current.coins;
    return current;
  });

  try {
    const logRef = push(ref(rtdb, 'wallet_ledger/' + targetUid));
    await set(logRef, {
      id: logRef.key,
      type: 'admin_adjust',
      coins: delta,
      meta: { adminUid },
      createdAt: Date.now(),
    });
  } catch (e) {
    console.warn(e);
  }
}

export async function setUserAsHost(
  targetUid: string,
  makeHost: boolean
): Promise<void> {
  await update(ref(rtdb, 'users/' + targetUid), {
    role: makeHost ? 'host' : 'user',
    lastProfileUpdate: Date.now(),
  });
}

export async function distributePoolToHosts(
  adminUid: string
): Promise<{ distributed: number; hosts: number }> {
  const poolSnap = await get(ref(rtdb, 'coin_pool'));
  const pool = poolSnap.exists() ? poolSnap.val() : { totalCoins: 0 };
  const total = typeof pool.totalCoins === 'number' ? pool.totalCoins : 0;
  if (total <= 0) return { distributed: 0, hosts: 0 };

  const usersSnap = await get(ref(rtdb, 'users'));
  if (!usersSnap.exists()) return { distributed: 0, hosts: 0 };

  const users = usersSnap.val();
  const hostUids: string[] = [];
  Object.keys(users).forEach((uid) => {
    const u = users[uid];
    if (
      u &&
      (u.role === 'host' || u.role === 'admin' || u.role === 'super_admin')
    ) {
      hostUids.push(uid);
    }
  });

  if (hostUids.length === 0) return { distributed: 0, hosts: 0 };

  const each = Math.floor(total / hostUids.length);
  if (each <= 0) return { distributed: 0, hosts: hostUids.length };

  const updates: Record<string, unknown> = {};
  hostUids.forEach((uid) => {
    const u = users[uid];
    const c =
      typeof u.coins === 'number'
        ? u.coins
        : typeof u.hostCoins === 'number'
          ? u.hostCoins
          : 0;
    updates['users/' + uid + '/coins'] = c + each;
    updates['users/' + uid + '/hostCoins'] = c + each;
  });
  updates['coin_pool/totalCoins'] = 0;
  updates['coin_pool/updatedAt'] = Date.now();

  await update(ref(rtdb), updates);

  try {
    const logRef = push(ref(rtdb, 'audit_logs'));
    await set(logRef, {
      id: logRef.key,
      adminUid,
      adminRole: 'super_admin',
      action: 'DISTRIBUTE_POOL',
      details:
        'Distributed ' + each + ' each to ' + hostUids.length + ' hosts',
      timestamp: Date.now(),
    });
  } catch (e) {
    console.warn(e);
  }

  return { distributed: each * hostUids.length, hosts: hostUids.length };
}

export async function fetchWithdrawRequests(): Promise<WithdrawRequest[]> {
  const snap = await get(ref(rtdb, 'withdraw_requests'));
  if (!snap.exists()) return [];
  const val = snap.val();
  return Object.keys(val)
    .map((k) => {
      const row = val[k] || {};
      return {
        id: k,
        uid: row.uid || '',
        anonymousName: row.anonymousName,
        username: row.username,
        amountBdt: row.amountBdt || 0,
        amountCoins: row.amountCoins || 0,
        method: row.method,
        accountNumber: row.accountNumber,
        status: row.status || 'pending',
        note: row.note,
        createdAt: row.createdAt || 0,
        reviewedAt: row.reviewedAt,
        reviewedBy: row.reviewedBy,
        activeReferrals: row.activeReferrals,
        chatMinutesToday: row.chatMinutesToday,
      } as WithdrawRequest;
    })
    .sort((a, b) => b.createdAt - a.createdAt);
}

/** HostManager যে নামে ইমপোর্ট করে */
export async function adminReviewWithdraw(
  requestId: string,
  status: 'approved' | 'rejected' | 'paid',
  adminUid: string,
  note?: string
): Promise<void> {
  await update(ref(rtdb, 'withdraw_requests/' + requestId), {
    status,
    reviewedAt: Date.now(),
    reviewedBy: adminUid,
    note: note || '',
  });

  if (status === 'paid') {
    const snap = await get(ref(rtdb, 'withdraw_requests/' + requestId));
    if (snap.exists()) {
      const req = snap.val();
      const uid = req.uid;
      const coins = req.amountCoins || 0;
      if (uid && coins > 0) {
        const userRef = ref(rtdb, 'users/' + uid);
        await runTransaction(userRef, (current) => {
          if (!current) return current;
          const c = typeof current.coins === 'number' ? current.coins : 0;
          current.coins = Math.max(0, c - coins);
          if (typeof current.hostCoins === 'number') {
            current.hostCoins = current.coins;
          }
          return current;
        });
      }
    }
  }
}

export async function addToCoinPool(amount: number): Promise<void> {
  if (amount <= 0) return;
  const poolRef = ref(rtdb, 'coin_pool/totalCoins');
  await runTransaction(poolRef, (cur) => {
    const n = typeof cur === 'number' ? cur : 0;
    return n + amount;
  });
  await update(ref(rtdb, 'coin_pool'), { updatedAt: Date.now() });
}
