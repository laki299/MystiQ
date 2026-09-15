import { ref, get, set, update, push } from 'firebase/database';
import { rtdb } from '../config/firebase.config';
import { AdNetworkConfig, AppSettings } from '../types/admin';
import { fetchAppSettings } from './adminService';

export const fetchAdNetworks = async function (): Promise<AdNetworkConfig[]> {
  var snap = await get(ref(rtdb, 'ad_networks'));
  if (!snap.exists()) return [];
  var val = snap.val();
  return Object.keys(val)
    .map(function (k) {
      return Object.assign({ id: k }, val[k]) as AdNetworkConfig;
    })
    .filter(function (n) {
      return n.enabled && n.scriptUrl;
    })
    .sort(function (a, b) {
      return (a.order || 0) - (b.order || 0);
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
      return Object.assign({ id: k }, val[k]) as AdNetworkConfig;
    })
    .sort(function (a, b) {
      return (a.order || 0) - (b.order || 0);
    });
};

export const upsertAdNetwork = async function (
  data: Omit<AdNetworkConfig, 'id'> & { id?: string }
): Promise<string> {
  if (data.id) {
    await update(ref(rtdb, 'ad_networks/' + data.id), {
      name: data.name,
      scriptUrl: data.scriptUrl,
      containerId: data.containerId || '',
      type: data.type || 'script',
      enabled: !!data.enabled,
      weight: data.weight || 1,
      order: data.order || 0,
    });
    return data.id;
  }
  var p = push(ref(rtdb, 'ad_networks'));
  await set(p, {
    name: data.name,
    scriptUrl: data.scriptUrl,
    containerId: data.containerId || '',
    type: data.type || 'script',
    enabled: !!data.enabled,
    weight: data.weight || 1,
    order: data.order || 0,
  });
  return p.key as string;
};

export const shouldShowNetworkAds = async function (): Promise<boolean> {
  var settings = await fetchAppSettings();
  if (!settings.networkAdsEnabled) return false;
  var nets = await fetchAdNetworks();
  return nets.length > 0;
};

export const pickNetwork = function (
  networks: AdNetworkConfig[]
): AdNetworkConfig | null {
  if (!networks.length) return null;
  var total = 0;
  networks.forEach(function (n) {
    total += n.weight || 1;
  });
  var r = Math.random() * total;
  var acc = 0;
  for (var i = 0; i < networks.length; i++) {
    acc += networks[i].weight || 1;
    if (r <= acc) return networks[i];
  }
  return networks[0];
};

export const getAdTiming = function (settings: AppSettings) {
  return {
    firstAdAfterSec: settings.firstAdAfterSec || 120,
    adIntervalSec: settings.adIntervalSec || 300,
    maxAdsPerSession: settings.maxAdsPerSession || 6,
  };
};
