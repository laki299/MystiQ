import React, { useEffect, useState } from 'react';
import { fetchAppSettings, updateAppSettings } from '../../services/adminService';
import { AppSettings, AdminRole } from '../../types/admin';

interface AppSettingsManagerProps {
  adminUid: string;
  adminRole: AdminRole;
}

export const AppSettingsManager: React.FC<AppSettingsManagerProps> = ({ adminUid, adminRole }) => {
  const [settings, setSettings] = useState<AppSettings>({
    textExpiryMinutes: 60,
    voiceDailyLimit: 10,
    maxVoiceDurationSec: 30,
    presenceTimeoutSec: 120,
    requestExpirySec: 300,
    inactiveThresholdDays: 30,
    rewardDurationHours: 24,
    rewardedAdsEnabled: true
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string>('');

  useEffect(() => {
    const loadSettings = async () => {
      setLoading(true);
      try {
        const data = await fetchAppSettings();
        setSettings(data);
      } catch (err) {
        console.error("Error fetching app settings:", err);
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  const handleChange = (field: keyof AppSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    try {
      await updateAppSettings(adminUid, adminRole, settings);
      setSuccessMsg('Settings updated successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error("Error updating settings:", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-6 text-slate-400 text-sm">Loading System Settings...</div>;
  }

  return (
    <div className="p-4 space-y-6 text-white bg-slate-900 rounded-xl border border-slate-800 shadow-xl">
      <div className="flex justify-between items-center border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-blue-400">⚙️ App Configuration & Limits</h2>
          <p className="text-xs text-slate-400">Manage global system parameters, limits, and expiration rules</p>
        </div>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold rounded-lg">
          ✅ {successMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Expiry & Limits */}
          <div className="p-4 bg-slate-800/60 rounded-lg border border-slate-700 space-y-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase">⌛ Expirations & Limits</h3>
            
            <div>
              <label className="block text-xs text-slate-400 mb-1">Text Expiry (Minutes)</label>
              <input
                type="number"
                value={settings.textExpiryMinutes}
                onChange={(e) => handleChange('textExpiryMinutes', Number(e.target.value))}
                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-sm focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Voice Messages Daily Limit</label>
              <input
                type="number"
                value={settings.voiceDailyLimit}
                onChange={(e) => handleChange('voiceDailyLimit', Number(e.target.value))}
                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-sm focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Max Voice Duration (Seconds)</label>
              <input
                type="number"
                value={settings.maxVoiceDurationSec}
                onChange={(e) => handleChange('maxVoiceDurationSec', Number(e.target.value))}
                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-sm focus:outline-none focus:border-blue-500"
                required
              />
            </div>
          </div>

          {/* Timeouts & Thresholds */}
          <div className="p-4 bg-slate-800/60 rounded-lg border border-slate-700 space-y-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase">⏱️ Sessions & Thresholds</h3>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Presence Timeout (Seconds)</label>
              <input
                type="number"
                value={settings.presenceTimeoutSec}
                onChange={(e) => handleChange('presenceTimeoutSec', Number(e.target.value))}
                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-sm focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Request Expiry (Seconds)</label>
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

        {/* Rewards & Ads Config */}
        <div className="p-4 bg-slate-800/60 rounded-lg border border-slate-700 space-y-3">
          <h3 className="text-xs font-bold text-slate-300 uppercase">🎁 Rewards Config</h3>
          
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
              <label htmlFor="rewardedAdsEnabled" className="text-xs font-medium text-slate-300 cursor-pointer">
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
          
