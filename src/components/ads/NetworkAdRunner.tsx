import React, { useEffect, useRef, useState } from 'react';
import {
  fetchAdNetworks,
  getAdTiming,
  getBannerNetworks,
  getInterstitialNetworks,
  waterfallInject,
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

function ensureContainer(containerId: string, parent?: HTMLElement | null) {
  if (!containerId) return;
  if (document.getElementById(containerId)) return;
  var div = document.createElement('div');
  div.id = containerId;
  div.style.cssText =
    'width:100%;min-height:50px;overflow:hidden;pointer-events:auto;';
  if (parent) {
    parent.appendChild(div);
  } else {
    document.body.appendChild(div);
  }
}

async function injectNetwork(
  net: AdNetworkConfig,
  parent?: HTMLElement | null
): Promise<void> {
  if (!net.scriptUrl) throw new Error('No scriptUrl');
  if (net.containerId) {
    ensureContainer(net.containerId, parent || null);
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

  var [bannerReady, setBannerReady] = useState(false);
  var interCount = useRef(0);
  var entryTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  var loopTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  var stopped = useRef(false);
  var bannerHostRef = useRef<HTMLDivElement | null>(null);

  useEffect(
    function () {
      stopped.current = false;
      interCount.current = 0;
      setBannerReady(false);

      if (isAdmin || !uid) return;

      async function boot() {
        try {
          var settings = await fetchAppSettings();
          if (!settings.networkAdsEnabled) return;

          var networks = await fetchAdNetworks();
          if (!networks.length) return;

          var timing = getAdTiming(settings);
          var banners = getBannerNetworks(networks);
          var inters = getInterstitialNetworks(networks);

          function clearTimers() {
            if (entryTimer.current) clearTimeout(entryTimer.current);
            if (loopTimer.current) clearInterval(loopTimer.current);
            entryTimer.current = null;
            loopTimer.current = null;
          }

          async function credit() {
            if (!uid) return;
            try {
              await recordAdViewCoins(uid);
            } catch (e) {
              console.warn('[coins]', e);
            }
          }

          // —— ছোট ব্যানার: ওয়াটারফল, চ্যাটে সবসময় ——
          if (timing.bannerAlwaysOn && banners.length > 0) {
            var host = bannerHostRef.current;
            var filled = await waterfallInject(banners, function (net) {
              return injectNetwork(net, host);
            });
            if (filled) {
              setBannerReady(true);
              await credit();
            }
          }

          // —— ফুলস্ক্রিন ওয়াটারফল ——
          async function showInterstitial() {
            if (stopped.current) return;
            if (interCount.current >= timing.maxInterstitialsPerSession) {
              clearTimers();
              return;
            }
            if (!inters.length) return;

            var won = await waterfallInject(inters, function (net) {
              return injectNetwork(net, null);
            });
            if (won) {
              interCount.current += 1;
              await credit();
            }
            // কেউ ফিল না করলে কিছু দেখায় না — নীরব স্কিপ
          }

          // প্রথম ঢোকা
          if (timing.interstitialOnEntry && inters.length > 0) {
            entryTimer.current = setTimeout(function () {
              showInterstitial();
            }, timing.firstInterstitialAfterSec * 1000);
          }

          // প্রতি ১০ মিনিট (বা সেটিংস অনুযায়ী)
          if (inters.length > 0 && timing.interstitialIntervalSec > 0) {
            loopTimer.current = setInterval(function () {
              showInterstitial();
            }, timing.interstitialIntervalSec * 1000);
          }

          return clearTimers;
        } catch (e) {
          console.warn('[NetworkAd boot]', e);
        }
      }

      var cleanupPromise = boot();

      return function () {
        stopped.current = true;
        if (entryTimer.current) clearTimeout(entryTimer.current);
        if (loopTimer.current) clearInterval(loopTimer.current);
        if (
          cleanupPromise &&
          typeof (cleanupPromise as any).then === 'function'
        ) {
          (cleanupPromise as Promise<any>).then(function (fn) {
            if (typeof fn === 'function') fn();
          });
        }
      };
    },
    [uid, isAdmin]
  );

  // Admin বা অ্যাড অফ → UI নেই
  if (isAdmin || !uid) return null;

  return (
    <div
      ref={bannerHostRef}
      className="fixed bottom-16 left-0 right-0 z-40 pointer-events-auto"
      style={{ maxWidth: 480, margin: '0 auto' }}
      aria-hidden={!bannerReady}
    >
      {/* কোম্পানি কন্টেইনার এখানে ইনজেক্ট হবে; খালি থাকলে জায়গা নেয় না */}
      <div className="px-2" />
    </div>
  );
};
