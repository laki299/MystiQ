const KEY = 'mystiq_device_id';

function randomId(): string {
  return (
    'dev_' +
    Date.now().toString(36) +
    '_' +
    Math.random().toString(36).slice(2, 10)
  );
}

export function getOrCreateDeviceId(): string {
  try {
    var existing = localStorage.getItem(KEY);
    if (existing && existing.length > 8) return existing;
    var id = randomId();
    localStorage.setItem(KEY, id);
    return id;
  } catch {
    return randomId();
  }
}

export function getRefCodeFromUrl(): string {
  try {
    var q = new URLSearchParams(window.location.search);
    var ref = q.get('ref') || q.get('referral') || '';
    return ref.trim().toUpperCase();
  } catch {
    return '';
  }
}
