import { ref, get } from 'firebase/database';
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
    adIntervalSec: settings.adIntervalSec || 240,
    maxAdsPerSession: settings.maxAdsPerSession || 8,
  };
};
