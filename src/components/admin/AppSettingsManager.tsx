import React, { useEffect, useState } from 'react';
import { fetchAppSettings, updateAppSettings } from '../../services/adminService';
import { AppSettings, AdminRole } from '../../types/admin';

interface AppSettingsManagerProps {
  adminUid: string;
  adminRole: AdminRole;
}

export const AppSettingsManager: React.FC<AppSettingsManagerProps> = ({
  adminUid,
  adminRole,
}) => {
  const [settings, setSettings] = useState<AppSettings>({
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
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const loadSettings = async () => {
      setLoading(true);
      try {
        const data = await fetchAppSettings();
        setSettings(data);
      } catch (err) {
        console.error('Error fetching app settings:', err);
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  const handleChange = (field: keyof AppSettings, value: any) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    try {
      await updateAppSettings(adminUid, adminRole, settings);
      setSuccessMsg('Settings saved. Share link updated for all users.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error('Error updating settings:', err);
    } finally {
      setSaving(false);
    }
  };

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
        <h2 className="text-xl font-bold text-blue-400">⚙️ App Configuration</h2>
        <p className="text-xs text-slate-400">
          Limits, rewards, and share / download link
        </p>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold rounded-lg">
          ✅ {successMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="p-4 bg-slate-800/60 rounded-lg border border-purple-500/30 space-y-3">
          <h3 className="text-xs font-bold text-purple-300 uppercase">
            📤 App Share & Download Link
          </h3>
          <p className="text-[11px] text-slate-400">
            Google Drive / APK link. Change anytime when Drive hits limit.
          </p>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Download URL</label>
            <input
              type="url"
              value={settings.appDownloadUrl}
              onChange={(e) => handleChange('appDownloadUrl', e.target.value)}
              placeholder="https://drive.google.com/..."
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm focus:outline-none focus:border-purple-500"
              required
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Share message</label>
            <textarea
              rows={2}
              value={settings.shareMessage}
              onChange={(e) => handleChange('shareMessage', e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm focus:outline-none focus:border-purple-500 resize-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-800/60 rounded-lg border border-slate-700 space-y-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase">
              ⌛ Expirations & Limits
            </h3>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Text Expiry (Minutes)</label>
              <input
                type="number"
                step="0.5"
                value={settings.textExpiryMinutes}
                onChange={(e) => handleChange('textExpiryMinutes', Number(e.target.value))}
                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-sm focus:outline-none focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Voice Daily Limit</label>
              <input
                type="number"
                value={settings.voiceDailyLimit}
                onChange={(e) => handleChange('voiceDailyLimit', Number(e.target.value))}
                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-sm focus:outline-none focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Max Voice Duration (Sec)</label>
              <input
                type="number"
                value={settings.maxVoiceDurationSec}
                onChange={(e) => handleChange('maxVoiceDurationSec', Number(e.target.value))}
                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-sm focus:outline-none focus:border-blue-500"
                required
              />
            </div>
          </div>

          <div className="p-4 bg-slate-800/60 rounded-lg border border-slate-700 space-y-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase">
              ⏱️ Sessions & Thresholds
            </h3>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Presence Timeout (Sec)</label>
              <input
                type="number"
                value={settings.presenceTimeoutSec}
                onChange={(e) => handleChange('presenceTimeoutSec', Number(e.target.value))}
                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-sm focus:outline-none focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Request Expiry (Sec)</label>
              <input
                type="number"
                value={settings.requestExpirySec}
                onChange={(e) => handleChange('requestExpirySec', Number(e.target.value))}
                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-sm focus:outline-none focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Inactive Threshold (Days)</label>
              <input
                type="number"
                value={settings.inactiveThresholdDays}
                onChange={(e) => handleChange('inactiveThresholdDays', Number(e.target.value))}
                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-sm focus:outline-none focus:border-blue-500"
                required
              />
            </div>
          </div>
        </div>

        <div className="p-4 bg-slate-800/60 rounded-lg border border-slate-700 space-y-3">
          <h3 className="text-xs font-bold text-slate-300 uppercase">🎁 Rewards</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Reward Duration (Hours)</label>
              <input
                type="number"
                value={settings.rewardDurationHours}
                onChange={(e) => handleChange('rewardDurationHours', Number(e.target.value))}
                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-sm focus:outline-none focus:border-blue-500"
                required
              />
            </div>
            <div className="flex items-center space-x-3 pt-6">
              <input
                type="checkbox"
                id="rewardedAdsEnabled"
                checked={settings.rewardedAdsEnabled}
                onChange={(e) => handleChange('rewardedAdsEnabled', e.target.checked)}
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
