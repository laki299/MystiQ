import { ref, get, set, update, push, runTransaction } from 'firebase/database';
import { rtdb } from '../config/firebase.config';
import { fetchAppSettings } from './adminService';

/** 10 coins = 1 poisha, 1000 coins = 1 BDT */
export function coinsToBdt(coins: number, coinsPerPoisha = 10): number {
  var poisha = coins / coinsPerPoisha;
  return Math.floor(poisha) / 100;
}

export function bdtToCoins(bdt: number, coinsPerPoisha = 10): number {
  return Math.round(bdt * 100 * coinsPerPoisha);
}

export function formatBdt(bdt: number): string {
  return '৳' + bdt.toFixed(2);
}

async function ledger(
  uid: string,
  type: string,
  coins: number,
  meta?: Record<string, unknown>
) {
  var p = push(ref(rtdb, 'wallet_ledger/' + uid));
  await set(p, {
    id: p.key,
    type: type,
    coins: coins,
    meta: meta || {},
    createdAt: Date.now(),
  });
}

export async function getWallet(uid: string) {
  var snap = await get(ref(rtdb, 'users/' + uid));
  if (!snap.exists()) {
    return { coins: 0, lifetimeCoins: 0, bdt: 0 };
  }
  var u = snap.val();
  var coins = typeof u.coins === 'number' ? u.coins : 0;
  var settings = await fetchAppSettings();
  var cpp = settings.coinsPerPoisha || 10;
  return {
    coins: coins,
    lifetimeCoins: typeof u.lifetimeCoins === 'number' ? u.lifetimeCoins : 0,
    bdt: coinsToBdt(coins, cpp),
    adsWatchedTotal: u.adsWatchedTotal || 0,
    referralCode: u.referralCode || '',
    qualifiedReferralsCount: u.qualifiedReferralsCount || 0,
    activeReferralsCount: u.activeReferralsCount || 0,
  };
}

export async function creditCoins(
  uid: string,
  amount: number,
  type: string,
  meta?: Record<string, unknown>
): Promise<number> {
  if (amount <= 0) return 0;
  var userRef = ref(rtdb, 'users/' + uid);
  var result = await runTransaction(userRef, function (current) {
    if (!current) return current;
    var c = typeof current.coins === 'number' ? current.coins : 0;
    var life =
      typeof current.lifetimeCoins === 'number' ? current.lifetimeCoins : 0;
    current.coins = c + amount;
    current.lifetimeCoins = life + amount;
    return current;
  });
  if (result.snapshot.exists()) {
    await ledger(uid, type, amount, meta);
    return amount;
  }
  return 0;
}

export async function debitCoins(
  uid: string,
  amount: number,
  type: string,
  meta?: Record<string, unknown>
): Promise<boolean> {
  if (amount <= 0) return false;
  var userRef = ref(rtdb, 'users/' + uid);
  var ok = false;
  await runTransaction(userRef, function (current) {
    if (!current) return current;
    var c = typeof current.coins === 'number' ? current.coins : 0;
    if (c < amount) return current;
    current.coins = c - amount;
    ok = true;
    return current;
  });
  if (ok) await ledger(uid, type, -amount, meta);
  return ok;
}

/** অ্যাড ভিউ → কয়েন + অ্যাড কাউন্ট + রেফার কোয়ালিফাই চেক */
export async function recordPaidAdView(uid: string): Promise<{
  credited: number;
  adsTotal: number;
}> {
  var settings = await fetchAppSettings();
  var perView = settings.coinsPerAdView || 1000;
  var today = new Date().toISOString().slice(0, 10);

  var userRef = ref(rtdb, 'users/' + uid);
  var adsTotal = 0;

  await runTransaction(userRef, function (current) {
    if (!current) return current;
    var c = typeof current.coins === 'number' ? current.coins : 0;
    var life =
      typeof current.lifetimeCoins === 'number' ? current.lifetimeCoins : 0;
    var total =
      typeof current.adsWatchedTotal === 'number' ? current.adsWatchedTotal : 0;
    var todayCount =
      current.adsWatchedTodayDate === today
        ? current.adsWatchedToday || 0
        : 0;

    current.coins = c + perView;
    current.lifetimeCoins = life + perView;
    current.adsWatchedTotal = total + 1;
    current.adsWatchedToday = todayCount + 1;
    current.adsWatchedTodayDate = today;
    adsTotal = current.adsWatchedTotal;
    return current;
  });

  await ledger(uid, 'ad_view', perView, { source: 'multitag' });

  // রেফার কোয়ালিফাই / কমিশন
  try {
    var { onReferredUserAdView } = await import('./referral.service');
    await onReferredUserAdView(uid, perView, adsTotal);
  } catch (e) {
    console.warn('[referral]', e);
  }

  return { credited: perView, adsTotal: adsTotal };
                                    }
