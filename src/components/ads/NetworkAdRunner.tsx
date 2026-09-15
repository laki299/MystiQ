import React, { useEffect, useRef } from 'react';
import {
  fetchAdNetworks,
  getAdTiming,
  pickNetwork,
} from '../../services/adNetwork.service';
import { fetchAppSettings } from '../../services/adminService';
import { recordAdViewCoins } from '../../services/coin.service';
import { AdNetworkConfig } from '../../types/admin';

interface NetworkAdRunnerProps {
  uid: string | null;
  isAdmin: boolean;
}

function loadScriptOnce(src: string, id: string): Promise<void> {
  return new Promise(function (resolve, reject) {
    if (document.getElementById(id)) {
      resolve();
      return;
    }
    var s = document.createElement('script');
    s.id = id;
    s.async = true;
    s.setAttribute('data-cfasync', 'false');
    s.src = src;
    s.onload = function () {
      resolve();
    };
    s.onerror = function () {
      reject(new Error('Ad script failed: ' + src));
    };
    document.body.appendChild(s);
  });
}

function ensureContainer(containerId: string) {
  if (!containerId) return;
  if (document.getElementById(containerId)) return;
  var div = document.createElement('div');
  div.id = containerId;
  div.style.cssText =
    'width:100%;min-height:1px;overflow:hidden;pointer-events:auto;';
  document.body.appendChild(div);
}

async function injectNetwork(net: AdNetworkConfig): Promise<void> {
  if (!net.scriptUrl) return;

  if (net.containerId) {
    ensureContainer(net.containerId);
  }

  var src = net.scriptUrl;
  if (src.indexOf('//') === 0) src = 'https:' + src;

  await loadScriptOnce(src, 'mystiq-ad-' + net.id);
}

export const NetworkAdRunner: React.FC<NetworkAdRunnerProps> = function (
  props
) {
  var uid = props.uid;
  var isAdmin = props.isAdmin;
  var shownRef = useRef(0);
  var timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  var intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  var stopped = useRef(false);

  useEffect(
    function () {
      stopped.current = false;
      if (isAdmin || !uid) return;

      async function boot() {
        try {
          var settings = await fetchAppSettings();
          if (!settings.networkAdsEnabled) return;

          var networks = await fetchAdNetworks();
          if (!networks.length) return;

          var timing = getAdTiming(settings);

          function clearAll() {
            if (timerRef.current) clearTimeout(timerRef.current);
            if (intervalRef.current) clearInterval(intervalRef.current);
            timerRef.current = null;
            intervalRef.current = null;
          }

          async function showOne() {
            if (stopped.current) return;
            if (shownRef.current >= timing.maxAdsPerSession) {
              clearAll();
              return;
            }
            var net = pickNetwork(networks);
            if (!net) return;
            try {
              await injectNetwork(net);
              shownRef.current += 1;
              if (uid) {
                try {
                  await recordAdViewCoins(uid);
                } catch (ce) {
                  console.warn('[coins]', ce);
                }
              }
            } catch (e) {
              console.warn('[NetworkAd]', e);
            }
          }

          timerRef.current = setTimeout(function () {
            showOne();
            intervalRef.current = setInterval(
              showOne,
              timing.adIntervalSec * 1000
            );
          }, timing.firstAdAfterSec * 1000);

          return clearAll;
        } catch (e) {
          console.warn('[NetworkAd boot]', e);
        }
      }

      var cleanupPromise = boot();
      return function () {
        stopped.current = true;
        if (timerRef.current) clearTimeout(timerRef.current);
        if (intervalRef.current) clearInterval(intervalRef.current);
        if (cleanupPromise && typeof (cleanupPromise as any).then === 'function') {
          (cleanupPromise as Promise<any>).then(function (fn) {
            if (typeof fn === 'function') fn();
          });
        }
      };
    },
    [uid, isAdmin]
  );

  return null;
};
