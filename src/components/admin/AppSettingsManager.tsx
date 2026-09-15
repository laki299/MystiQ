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
  shareMessage: 'Join MystiQ',
  maxConcurrentUsers: 89,
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

  function num(key: keyof AppSettings, value: string) {
    var n = parseFloat(value);
    if (isNaN(n)) return;
    setSettings(function (prev) {
      return Object.assign({}, prev, { [key]: n });
    });
  }

  function toggle(key: keyof AppSettings) {
    setSettings(function (prev) {
      return Object.assign({}, prev, { [key]: !(prev as any)[key] });
    });
  }

  function text(key: keyof AppSettings, value: string) {
    setSettings(function (prev) {
      return Object.assign({}, prev, { [key]: value });
    });
  }

  async function save() {
    setSaving(true);
    setMsg('');
    try {
      await updateAppSettings(adminUid, settings);
      setMsg('Settings saved');
    } catch (e: any) {
      setMsg(e && e.message ? e.message : 'Save failed');
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

      <section className="space-y-2">
        <p className="text-xs font-semibold text-purple-300 uppercase">
          Network Ads (Master)
        </p>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={!!settings.networkAdsEnabled}
            onChange={function () {
              toggle('networkAdsEnabled');
            }}
          />
          Enable network ads (ON করলেই waterfall চালু)
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={settings.bannerAlwaysOn !== false}
            onChange={function () {
              toggle('bannerAlwaysOn');
            }}
          />
          চ্যাটে ছোট ব্যানার সবসময়
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={settings.interstitialOnEntry !== false}
            onChange={function () {
              toggle('interstitialOnEntry');
            }}
          />
          প্রথম ঢোকায় ফুলস্ক্রিন
        </label>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <label>
            First fullscreen after (sec)
            <input
              type="number"
              className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5"
              value={settings.firstInterstitialAfterSec}
              onChange={function (e) {
                num('firstInterstitialAfterSec', e.target.value);
              }}
            />
          </label>
          <label>
            Fullscreen every (sec) — 600 = 10 min
            <input
              type="number"
              className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5"
              value={settings.interstitialIntervalSec}
              onChange={function (e) {
                num('interstitialIntervalSec', e.target.value);
              }}
            />
          </label>
          <label>
            Max fullscreen / session
            <input
              type="number"
              className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5"
              value={settings.maxInterstitialsPerSession}
              onChange={function (e) {
                num('maxInterstitialsPerSession', e.target.value);
              }}
            />
          </label>
        </div>
      </section>

      <section className="space-y-2">
        <p className="text-xs font-semibold text-purple-300 uppercase">
          Download / Share
        </p>
        <label className="text-xs block">
          App download URL
          <input
            className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-sm"
            value={settings.appDownloadUrl || ''}
            onChange={function (e) {
              text('appDownloadUrl', e.target.value);
            }}
          />
        </label>
        <label className="text-xs block">
          Share message
          <input
            className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-sm"
            value={settings.shareMessage || ''}
            onChange={function (e) {
              text('shareMessage', e.target.value);
            }}
          />
        </label>
        <label className="text-xs block">
          Max concurrent users
          <input
            type="number"
            className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5"
            value={settings.maxConcurrentUsers}
            onChange={function (e) {
              num('maxConcurrentUsers', e.target.value);
            }}
          />
        </label>
      </section>

      <section className="space-y-2">
        <p className="text-xs font-semibold text-purple-300 uppercase">
          Host coins
        </p>
        <div className="grid grid-cols-3 gap-2 text-xs">
          <label>
            Coins / ad view
            <input
              type="number"
              className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5"
              value={settings.coinsPerAdView}
              onChange={function (e) {
                num('coinsPerAdView', e.target.value);
              }}
            />
          </label>
          <label>
            Host pool %
            <input
              type="number"
              className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5"
              value={settings.hostPoolPercent}
              onChange={function (e) {
                num('hostPoolPercent', e.target.value);
              }}
            />
          </label>
          <label>
            Min withdraw
            <input
              type="number"
              className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5"
              value={settings.minWithdrawCoins}
              onChange={function (e) {
                num('minWithdrawCoins', e.target.value);
              }}
            />
          </label>
        </div>
      </section>

      <section className="space-y-2">
        <p className="text-xs font-semibold text-purple-300 uppercase">
          Expirations & limits
        </p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <label>
            Text expiry (min)
            <input
              type="number"
              step="0.5"
              className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5"
              value={settings.textExpiryMinutes}
              onChange={function (e) {
                num('textExpiryMinutes', e.target.value);
              }}
            />
          </label>
          <label>
            Presence timeout (sec)
            <input
              type="number"
              className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5"
              value={settings.presenceTimeoutSec}
              onChange={function (e) {
                num('presenceTimeoutSec', e.target.value);
              }}
            />
          </label>
          <label>
            Voice daily limit
            <input
              type="number"
              className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5"
              value={settings.voiceDailyLimit}
              onChange={function (e) {
                num('voiceDailyLimit', e.target.value);
              }}
            />
          </label>
          <label>
            Max voice (sec)
            <input
              type="number"
              className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5"
              value={settings.maxVoiceDurationSec}
              onChange={function (e) {
                num('maxVoiceDurationSec', e.target.value);
              }}
            />
          </label>
        </div>
      </section>

      {msg ? (
        <p className="text-xs text-emerald-400">{msg}</p>
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
