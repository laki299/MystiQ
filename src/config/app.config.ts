export const APP_CONFIG = {
  appName: 'MystiQ',
  version: '1.0.0',
  limits: {
    textExpirySeconds: 150,
    voiceDailyLimit: 25,
    voiceMaxDurationSeconds: 60,
    presenceHeartbeatSeconds: 25,
    presenceStaleSeconds: 45,
    requestExpirySeconds: 300,
    inactiveThresholdDays: 30,
    autoSweepThreshold: 30,
    messageRateLimitPerMinute: 20,
  },
  reward: {
    durationHours: 8,
    defaultEnabled: false,
  },
  categories: [
    { id: 'general', name: 'General', description: 'Open random chat', icon: '💬', color: 'from-blue-600 to-indigo-600' },
    { id: 'friendship', name: 'Friendship', description: 'Make anonymous friends', icon: '🤝', color: 'from-emerald-600 to-teal-600' },
    { id: 'romantic', name: 'Romantic', description: 'Flirty & romantic vibes', icon: '💜', color: 'from-rose-600 to-pink-600' },
    { id: 'casual', name: 'Casual', description: 'Light & casual talk', icon: '🌙', color: 'from-cyan-600 to-blue-700' },
  ],
} as const;
