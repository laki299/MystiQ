import { recordPaidAdView } from './wallet.service';

/** NetworkAdRunner থেকে কল — MultiTag ভিউ = কয়েন */
export async function recordAdViewCoins(viewerUid: string): Promise<void> {
  if (!viewerUid) return;
  try {
    await recordPaidAdView(viewerUid);
  } catch (e) {
    console.warn('[recordAdViewCoins]', e);
  }
}

export async function getHostCoins(uid: string): Promise<number> {
  const { getWallet } = await import('./wallet.service');
  const w = await getWallet(uid);
  return w.coins;
}
