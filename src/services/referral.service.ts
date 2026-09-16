import { ref, get, set, update, runTransaction } from 'firebase/database';
import { rtdb } from '../config/firebase.config';
import { fetchAppSettings } from './adminService';
import { creditCoins, bdtToCoins } from './wallet.service';

function makeCode(username: string): string {
  var base = (username || 'user')
    .replace(/[^a-zA-Z0-9]/g, '')
    .slice(0, 6)
    .toUpperCase();
  var tail = Math.floor(1000 + Math.random() * 9000);
  return (base || 'MQ') + tail;
}

export async function ensureReferralCode(
  uid: string,
  username: string
): Promise<string> {
  var snap = await get(ref(rtdb, 'users/' + uid + '/referralCode'));
  if (snap.exists() && snap.val()) return String(snap.val());

  var code = makeCode(username);
  for (var i = 0; i < 5; i++) {
    var taken = await get(ref(rtdb, 'referral_codes/' + code));
    if (!taken.exists()) break;
    code = makeCode(username + i);
  }

  await set(ref(rtdb, 'referral_codes/' + code), uid);
  await update(ref(rtdb, 'users/' + uid), { referralCode: code });
  return code;
}

export async function applyReferralOnRegister(
  newUid: string,
  code: string,
  deviceId: string
): Promise<{ ok: boolean; reason?: string }> {
  if (!code || !code.trim()) return { ok: false, reason: 'no_code' };

  var clean = code.trim().toUpperCase();
  var codeSnap = await get(ref(rtdb, 'referral_codes/' + clean));
  if (!codeSnap.exists()) return { ok: false, reason: 'invalid_code' };

  var referrerUid = String(codeSnap.val());
  if (referrerUid === newUid) return { ok: false, reason: 'self' };

  // এক ডিভাইসে আগে অ্যাকাউন্ট থাকলে রেফার বন্ধ (যথাসম্ভব)
  if (deviceId) {
    var devSnap = await get(ref(rtdb, 'devices/' + deviceId));
    if (devSnap.exists()) {
      var prev = devSnap.val();
      if (prev && prev.uid && prev.uid !== newUid) {
        return { ok: false, reason: 'device_used' };
      }
    }
    await set(ref(rtdb, 'devices/' + deviceId), {
      uid: newUid,
      at: Date.now(),
    });
  }

  await update(ref(rtdb, 'users/' + newUid), {
    referredBy: referrerUid,
    referredByCode: clean,
  });

  await set(ref(rtdb, 'referral_edges/' + referrerUid + '/' + newUid), {
    status: 'pending',
    code: clean,
    adsByReferred: 0,
    createdAt: Date.now(),
    qualifiedAt: null,
  });

  await runTransaction(
    ref(rtdb, 'users/' + referrerUid + '/activeReferralsCount'),
    function (c) {
      return (typeof c === 'number' ? c : 0) + 1;
    }
  );

  return { ok: true };
}

/** রেফার্ড অ্যাড দেখলে: ২৫ এ বোনাস + ৫% কমিশন */
export async function onReferredUserAdView(
  referredUid: string,
  coinsEarnedThisView: number,
  referredAdsTotal: number
): Promise<void> {
  var userSnap = await get(ref(rtdb, 'users/' + referredUid));
  if (!userSnap.exists()) return;
  var referredBy = userSnap.val().referredBy;
  if (!referredBy) return;

  var settings = await fetchAppSettings();
  var need = settings.referralBonusAdsRequired || 25;
  var bonusCoins =
    settings.referralBonusCoins || bdtToCoins(10, settings.coinsPerPoisha || 10);
  var percent = settings.referralCommissionPercent || 5;

  var edgeRef = ref(
    rtdb,
    'referral_edges/' + referredBy + '/' + referredUid
  );
  var edgeSnap = await get(edgeRef);
  if (!edgeSnap.exists()) return;

  var edge = edgeSnap.val();
  var ads = referredAdsTotal;

  await update(edgeRef, { adsByReferred: ads });

  // ৫% কমিশন প্রতি অ্যাড আয়ের উপর
  var commission = Math.floor((coinsEarnedThisView * percent) / 100);
  if (commission > 0) {
    await creditCoins(referredBy, commission, 'referral_commission', {
      from: referredUid,
      base: coinsEarnedThisView,
      percent: percent,
    });
  }

  // ২৫ অ্যাডে একবার ১০ টাকা বোনাস
  if (edge.status === 'pending' && ads >= need) {
    await update(edgeRef, {
      status: 'qualified',
      qualifiedAt: Date.now(),
    });
    await creditCoins(referredBy, bonusCoins, 'referral_bonus', {
      from: referredUid,
      ads: ads,
    });
    await runTransaction(
      ref(rtdb, 'users/' + referredBy + '/qualifiedReferralsCount'),
      function (c) {
        return (typeof c === 'number' ? c : 0) + 1;
      }
    );
  }
}

export function getReferralLink(code: string, baseUrl?: string): string {
  var base =
    baseUrl ||
    (typeof window !== 'undefined' ? window.location.origin : '');
  return base + '/?ref=' + encodeURIComponent(code);
                  }
