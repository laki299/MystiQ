import React, { useEffect, useState } from 'react';
import { fetchAppSettings, updateAppSettings } from '../../services/adminService';
import { AppSettings, AdminRole } from '../../types/admin';

interface AppSettingsManagerProps {
  adminUid: string;
  adminRole: AdminRole;
}

export const AppSettingsManager: React.FC<AppSettingsManagerProps> = function (
  props
) {
  var adminUid = props.adminUid;
  var adminRole = props.adminRole;

  var settingsState = useState({
    textExpiryMinutes: 2.5,
    voiceDailyLimit: 25,
    maxVoiceDurationSec: 60,
    presenceTimeoutSec: 45,
    requestExpirySec: 300,
    inactiveThresholdDays: 30,
    rewardDurationHours: 8,
    rewardedAdsEnabled: false,
    appDownloadUrl: 'https://mysti-q-flame.vercel.app',
    shareMessage: 'MystiQ — Anonymous chat. Download / open here:',
    maxConcurrentUsers: 85,
  } as AppSettings);
  var settings = settingsState[0];
  var setSettings = settingsState[1];

  var loadingState = useState(true);
  var loading = loadingState[0];
  var setLoading = loadingState[1];

  var savingState = useState(false);
  var saving = savingState[0];
  var setSaving = savingState[1];

  var successState = useState('');
  var successMsg = successState[0];
  var setSuccessMsg = successState[1];

  useEffect(function () {
    async function loadSettings() {
      setLoading(true);
      try {
        var data = await fetchAppSettings();
        setSettings(data);
      } catch (err) {
        console.error('Error fetching app settings:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  function handleChange(field: keyof AppSettings, value: any) {
    setSettings(function (prev) {
      var next = Object.assign({}, prev);
      next[field] = value as never;
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    try {
      await updateAppSettings(adminUid, adminRole, settings);
      setSuccessMsg('Settings saved successfully.');
      setTimeout(function () {
        setSuccessMsg('');
      }, 3000);
    } catch (err) {
      console.error('Error updating settings:', err);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="text-center py-6 text-slate-400 text-sm">
        Loading System Settings...
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 text-white bg-slate-900 rounded-xl border border-slate-800 shadow-xl">
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-xl font-bold text-blue-400">App Configuration</h2>
        <p className="text-xs text-slate-400">
          Limits, rewards, share link, concurrent users
        </p>
      </div>

      {successMsg ? (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold rounded-lg">
          {successMsg}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Share / Download */}
        <div className="p-4 bg-slate-800/60 rounded-lg border border-purple-500/30 space-y-3">
          <h3 className="text-xs font-bold text-purple-300 uppercase">
            App Share & Download Link
          </h3>
          <p className="text-[11px] text-slate-400">
            Google Drive / APK link. Change anytime when Drive hits limit.
          </p>
          <div>
            <label className="block text-xs text-slate-400 mb-1">
              Download URL
            </label>
            <input
              type="url"
              value={settings.appDownloadUrl}
              onChange={function (e) {
                handleChange('appDownloadUrl', e.target.value);
              }}
              placeholder="https://drive.google.com/..."
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm focus:outline-none focus:border-purple-500"
              required
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">
              Share message
            </label>
            <textarea
              rows={2}
              value={settings.shareMessage}
              onChange={function (e) {
                handleChange('shareMessage', e.target.value);
              }}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm focus:outline-none focus:border-purple-500 resize-none"
            />
          </div>
        </div>

        {/* Spark concurrent limit */}
        <div className="p-4 bg-amber-950/30 rounded-lg border border-amber-500/30 space-y-3">
          <h3 className="text-xs font-bold text-amber-300 uppercase">
            Spark Plan — Concurrent Users
          </h3>
          <p className="text-[11px] text-slate-400">
            Firebase Free allows about 100 simultaneous connections. Keep this
            under 90 for safety.
          </p>
          <div>
            <label className="block text-xs text-slate-400 mb-1">
              Max Concurrent Users
            </label>
            <input
              type="number"
              min={10}
              max={100}
              value={settings.maxConcurrentUsers}
              onChange={function (e) {
                handleChange('maxConcurrentUsers', Number(e.target.value));
              }}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm focus:outline-none focus:border-amber-500"
              required
            />
            <p className="text-[10px] text-slate-500 mt-1">
              Recommended: 80–85. When online users reach this limit, new users
              will see Server Full.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-800/60 rounded-lg border border-slate-700 space-y-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase">
              Expirations & Limits
            </h3>
            <div>
              <label className="block text-xs text-slate-400 mb-1">
                Text Expiry (Minutes)
              </label>
              <input
                type="number"
                step="0.5"
                value={settings.textExpiryMinutes}
                onChange={function (e) {
                  handleChange('textExpiryMinutes', Number(e.target.value));
                }}
                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">
                Voice Daily Limit
              </label>
              <input
                type="number"
                value={settings.voiceDailyLimit}
                onChange={function (e) {
                  handleChange('voiceDailyLimit', Number(e.target.value));
                }}
                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">
                Max Voice Duration (Sec)
              </label>
              <input
                type="number"
                value={settings.maxVoiceDurationSec}
                onChange={function (e) {
                  handleChange('maxVoiceDurationSec', Number(e.target.value));
                }}
                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-sm"
                required
              />
            </div>
          </div>

          <div className="p-4 bg-slate-800/60 rounded-lg border border-slate-700 space-y-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase">
              Sessions & Thresholds
            </h3>
            <div>
              <label className="block text-xs text-slate-400 mb-1">
                Presence Timeout (Sec)
              </label>
              <input
                type="number"
                value={settings.presenceTimeoutSec}
                onChange={function (e) {
                  handleChange('presenceTimeoutSec', Number(e.target.value));
                }}
                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">
                Request Expiry (Sec)
              </label>
              <input
                type="number"
                value={settings.requestExpirySec}
                onChange={function (e) {
                  handleChange('requestExpirySec', Number(e.target.value));
                }}
                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">
                Inactive Threshold (Days)
              </label>
              <input
                type="number"
                value={settings.inactiveThresholdDays}
                onChange={function (e) {
                  handleChange('inactiveThresholdDays', Number(e.target.value));
                }}
                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-sm"
                required
              />
            </div>
          </div>
        </div>

        <div className="p-4 bg-slate-800/60 rounded-lg border border-slate-700 space-y-3">
          <h3 className="text-xs font-bold text-slate-300 uppercase">Rewards</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">
                Reward Duration (Hours)
              </label>
              <input
                type="number"
                value={settings.rewardDurationHours}
                onChange={function (e) {
                  handleChange('rewardDurationHours', Number(e.target.value));
                }}
                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-sm"
                required
              />
            </div>
            <div className="flex items-center space-x-3 pt-6">
              <input
                type="checkbox"
                id="rewardedAdsEnabled"
                checked={settings.rewardedAdsEnabled}
                onChange={function (e) {
                  handleChange('rewardedAdsEnabled', e.target.checked);
                }}
                className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
              />
              <label
                htmlFor="rewardedAdsEnabled"
                className="text-xs font-medium text-slate-300 cursor-pointer"
              >
                Enable Rewarded Ads System
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-xs font-bold rounded-lg transition shadow-lg"
          >
            {saving ? 'Saving...' : 'Save System Settings'}
          </button>
        </div>
      </form>
    </div>
  );
};
