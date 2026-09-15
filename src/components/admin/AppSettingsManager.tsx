import React, { useEffect, useState } from 'react';
import { AppSettings } from '../../types/admin';
import {
  fetchAppSettings,
  updateAppSettings,
} from '../../services/adminService';

interface AppSettingsManagerProps {
  adminUid: string;
  adminRole: string;
}

const DEFAULTS: AppSettings = {
  textExpiryMinutes: 2.5,
  voiceDailyLimit: 25,
  maxVoiceDurationSec: 60,
  presenceTimeoutSec: 45,
  requestExpirySec: 300,
  inactiveThresholdDays: 30,
  rewardDurationHours: 8,
  rewardedAdsEnabled: false,
  appDownloadUrl: '',
  shareMessage: 'MystiQ — Anonymous chat',
  maxConcurrentUsers: 80,
  networkAdsEnabled: false,
  bannerAlwaysOn: true,
  interstitialOnEntry: true,
  firstInterstitialAfterSec: 8,
  interstitialIntervalSec: 600,
  maxInterstitialsPerSession: 12,
  firstAdAfterSec: 120,
  adIntervalSec: 300,
  maxAdsPerSession: 6,
  coinsPerAdView: 1,
  hostPoolPercent: 40,
  minWithdrawCoins: 100,
};

export const AppSettingsManager: React.FC<AppSettingsManagerProps> = function (
  props
) {
  var adminUid = props.adminUid;
  var [settings, setSettings] = useState<AppSettings>(DEFAULTS);
  var [loading, setLoading] = useState(true);
  var [saving, setSaving] = useState(false);
  var [msg, setMsg] = useState('');

  useEffect(function () {
    (async function () {
      try {
        var s = await fetchAppSettings();
        setSettings(Object.assign({}, DEFAULTS, s));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function setNum(key: keyof AppSettings, value: string) {
    var n = parseFloat(value);
    if (isNaN(n)) return;
    setSettings(function (prev) {
      return Object.assign({}, prev, { [key]: n });
    });
  }

  function setBool(key: keyof AppSettings, value: boolean) {
    setSettings(function (prev) {
      return Object.assign({}, prev, { [key]: value });
    });
  }

  function setText(key: keyof AppSettings, value: string) {
    setSettings(function (prev) {
      return Object.assign({}, prev, { [key]: value });
    });
  }

  async function save() {
    setSaving(true);
    setMsg('');
    try {
      var payload = Object.assign({}, DEFAULTS, settings);
      await updateAppSettings(adminUid, payload);
      setMsg('Settings saved');
    } catch (e: any) {
      setMsg(e && e.message ? String(e.message) : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="p-4 text-slate-400 text-sm">Loading settings…</div>
    );
  }

  return (
    <div className="p-4 space-y-6 text-white bg-slate-900 rounded-xl border border-slate-800">
      <h3 className="text-sm font-bold text-indigo-300">App Configuration</h3>

      <section className="space-y-3">
        <p className="text-xs font-semibold text-purple-300 uppercase tracking-wide">
          Network Ads
        </p>
        <label className="flex items-center gap-2 text-sm text-slate-200">
          <input
            type="checkbox"
            className="rounded"
            checked={!!settings.networkAdsEnabled}
            onChange={function (e) {
              setBool('networkAdsEnabled', e.target.checked);
            }}
          />
          Enable network ads
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-200">
          <input
            type="checkbox"
            className="rounded"
            checked={settings.bannerAlwaysOn !== false}
            onChange={function (e) {
              setBool('bannerAlwaysOn', e.target.checked);
            }}
          />
          চ্যাটে ছোট ব্যানার সবসময়
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-200">
          <input
            type="checkbox"
            className="rounded"
            checked={settings.interstitialOnEntry !== false}
            onChange={function (e) {
              setBool('interstitialOnEntry', e.target.checked);
            }}
          />
          প্রথম ঢোকায় ফুলস্ক্রিন
        </label>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <label className="text-slate-400">
            First fullscreen after (sec)
            <input
              type="number"
              className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-slate-100"
              value={settings.firstInterstitialAfterSec}
              onChange={function (e) {
                setNum('firstInterstitialAfterSec', e.target.value);
              }}
            />
          </label>
          <label className="text-slate-400">
            Fullscreen every (sec) — 600 = 10 min
            <input
              type="number"
              className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-slate-100"
              value={settings.interstitialIntervalSec}
              onChange={function (e) {
                setNum('interstitialIntervalSec', e.target.value);
              }}
            />
          </label>
          <label className="text-slate-400 col-span-2">
            Max fullscreen / session
            <input
              type="number"
              className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-slate-100"
              value={settings.maxInterstitialsPerSession}
              onChange={function (e) {
                setNum('maxInterstitialsPerSession', e.target.value);
              }}
            />
          </label>
        </div>
      </section>

      <section className="space-y-2">
        <p className="text-xs font-semibold text-purple-300 uppercase tracking-wide">
          Download / Share
        </p>
        <label className="text-xs text-slate-400 block">
          App download URL
          <input
            className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-sm text-slate-100"
            value={settings.appDownloadUrl || ''}
            onChange={function (e) {
              setText('appDownloadUrl', e.target.value);
            }}
          />
        </label>
        <label className="text-xs text-slate-400 block">
          Share message
          <input
            className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-sm text-slate-100"
            value={settings.shareMessage || ''}
            onChange={function (e) {
              setText('shareMessage', e.target.value);
            }}
          />
        </label>
        <label className="text-xs text-slate-400 block">
          Max concurrent users
          <input
            type="number"
            className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-slate-100"
            value={settings.maxConcurrentUsers}
            onChange={function (e) {
              setNum('maxConcurrentUsers', e.target.value);
            }}
          />
        </label>
      </section>

      <section className="space-y-2">
        <p className="text-xs font-semibold text-purple-300 uppercase tracking-wide">
          Host coins
        </p>
        <div className="grid grid-cols-3 gap-2 text-xs">
          <label className="text-slate-400">
            Coins / ad view
            <input
              type="number"
              className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-slate-100"
              value={settings.coinsPerAdView}
              onChange={function (e) {
                setNum('coinsPerAdView', e.target.value);
              }}
            />
          </label>
          <label className="text-slate-400">
            Host pool %
            <input
              type="number"
              className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-slate-100"
              value={settings.hostPoolPercent}
              onChange={function (e) {
                setNum('hostPoolPercent', e.target.value);
              }}
            />
          </label>
          <label className="text-slate-400">
            Min withdraw
            <input
              type="number"
              className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-slate-100"
              value={settings.minWithdrawCoins}
              onChange={function (e) {
                setNum('minWithdrawCoins', e.target.value);
              }}
            />
          </label>
        </div>
      </section>

      <section className="space-y-2">
        <p className="text-xs font-semibold text-purple-300 uppercase tracking-wide">
          Expirations & limits
        </p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <label className="text-slate-400">
            Text expiry (min)
            <input
              type="number"
              step="0.5"
              className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-slate-100"
              value={settings.textExpiryMinutes}
              onChange={function (e) {
                setNum('textExpiryMinutes', e.target.value);
              }}
            />
          </label>
          <label className="text-slate-400">
            Presence timeout (sec)
            <input
              type="number"
              className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-slate-100"
              value={settings.presenceTimeoutSec}
              onChange={function (e) {
                setNum('presenceTimeoutSec', e.target.value);
              }}
            />
          </label>
          <label className="text-slate-400">
            Voice daily limit
            <input
              type="number"
              className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-slate-100"
              value={settings.voiceDailyLimit}
              onChange={function (e) {
                setNum('voiceDailyLimit', e.target.value);
              }}
            />
          </label>
          <label className="text-slate-400">
            Max voice (sec)
            <input
              type="number"
              className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-slate-100"
              value={settings.maxVoiceDurationSec}
              onChange={function (e) {
                setNum('maxVoiceDurationSec', e.target.value);
              }}
            />
          </label>
        </div>
      </section>

      {msg ? (
        <p
          className={
            msg.indexOf('fail') >= 0 || msg.indexOf('Error') >= 0
              ? 'text-xs text-rose-400'
              : 'text-xs text-emerald-400'
          }
        >
          {msg}
        </p>
      ) : null}

      <button
        type="button"
        disabled={saving}
        onClick={save}
        className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-sm font-bold disabled:opacity-50"
      >
        {saving ? 'Saving…' : 'Save System Settings'}
      </button>
    </div>
  );
};
