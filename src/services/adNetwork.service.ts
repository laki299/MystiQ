import { ref, get, set, update, push } from 'firebase/database';
import { rtdb } from '../config/firebase.config';
import { AdNetworkConfig, AppSettings } from '../types/admin';
import { fetchAppSettings } from './adminService';

function mapRow(k: string, row: any): AdNetworkConfig {
  var t = row.type;
  if (t !== 'banner' && t !== 'interstitial' && t !== 'script') {
    t = 'script';
  }
  return {
    id: k,
    name: row.name || k,
    scriptUrl: row.scriptUrl || '',
    containerId: row.containerId || '',
    type: t,
    enabled: !!row.enabled,
    weight: typeof row.weight === 'number' ? row.weight : 1,
    order: typeof row.order === 'number' ? row.order : 99,
  };
}

export const fetchAdNetworks = async function (): Promise<AdNetworkConfig[]> {
  var snap = await get(ref(rtdb, 'ad_networks'));
  if (!snap.exists()) return [];
  var val = snap.val();
  return Object.keys(val)
    .map(function (k) {
      return mapRow(k, val[k] || {});
    })
    .filter(function (n) {
      return n.enabled && !!n.scriptUrl;
    })
    .sort(function (a, b) {
      return a.order - b.order;
    });
};

export const fetchAllAdNetworksAdmin = async function (): Promise<
  AdNetworkConfig[]
> {
  var snap = await get(ref(rtdb, 'ad_networks'));
  if (!snap.exists()) return [];
  var val = snap.val();
  return Object.keys(val)
    .map(function (k) {
      return mapRow(k, val[k] || {});
    })
    .sort(function (a, b) {
      return a.order - b.order;
    });
};

export const upsertAdNetwork = async function (
  data: Omit<AdNetworkConfig, 'id'> & { id?: string }
): Promise<string> {
  var payload = {
    name: data.name,
    scriptUrl: data.scriptUrl,
    containerId: data.containerId || '',
    type: data.type || 'script',
    enabled: !!data.enabled,
    weight: data.weight || 1,
    order: typeof data.order === 'number' ? data.order : 99,
  };
  if (data.id) {
    await update(ref(rtdb, 'ad_networks/' + data.id), payload);
    return data.id;
  }
  var p = push(ref(rtdb, 'ad_networks'));
  await set(p, payload);
  return p.key as string;
};

export const shouldShowNetworkAds = async function (): Promise<boolean> {
  var settings = await fetchAppSettings();
  if (!settings.networkAdsEnabled) return false;
  var nets = await fetchAdNetworks();
  return nets.length > 0;
};

/** ব্যানার তালিকা — order অনুযায়ী (Monetag আগে…) */
export const getBannerNetworks = function (
  networks: AdNetworkConfig[]
): AdNetworkConfig[] {
  return networks
    .filter(function (n) {
      return n.type === 'banner';
    })
    .sort(function (a, b) {
      return a.order - b.order;
    });
};

/** ফুলস্ক্রিন / স্ক্রিপ্ট ওয়াটারফল লিস্ট */
export const getInterstitialNetworks = function (
  networks: AdNetworkConfig[]
): AdNetworkConfig[] {
  return networks
    .filter(function (n) {
      return n.type === 'interstitial' || n.type === 'script';
    })
    .sort(function (a, b) {
      return a.order - b.order;
    });
};

/**
 * WATERFALL: order 1 → 2 → 3…
 * স্ক্রিপ্ট লোড সফল = ফিল ধরা; ফেল = পরের কোম্পানি
 * কেউ সফল না হলে null (কিছু দেখাবে না)
 */
export async function waterfallInject(
  list: AdNetworkConfig[],
  injectFn: (net: AdNetworkConfig) => Promise<void>
): Promise<AdNetworkConfig | null> {
  for (var i = 0; i < list.length; i++) {
    var net = list[i];
    try {
      await injectFn(net);
      return net;
    } catch (e) {
      console.warn('[waterfall skip]', net.name, e);
    }
  }
  return null;
}

export const getAdTiming = function (settings: AppSettings) {
  return {
    bannerAlwaysOn: settings.bannerAlwaysOn !== false,
    interstitialOnEntry: settings.interstitialOnEntry !== false,
    firstInterstitialAfterSec: settings.firstInterstitialAfterSec || 8,
    interstitialIntervalSec: settings.interstitialIntervalSec || 600,
    maxInterstitialsPerSession: settings.maxInterstitialsPerSession || 12,
    firstAdAfterSec: settings.firstAdAfterSec || 120,
    adIntervalSec: settings.adIntervalSec || 300,
    maxAdsPerSession: settings.maxAdsPerSession || 6,
  };
};
