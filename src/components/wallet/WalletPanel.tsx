import React, { useEffect, useState } from 'react';
import {
  getWallet,
  coinsToBdt,
  formatBdt,
} from '../../services/wallet.service';
import { getReferralLink } from '../../services/referral.service';
import { fetchAppSettings } from '../../services/adminService';
import { ref, push, set, get } from 'firebase/database';
import { rtdb } from '../../config/firebase.config';
import { UserProfile } from '../../types/user.types';

interface WalletPanelProps {
  profile: UserProfile;
  onProfileTouch?: () => void;
}

export const WalletPanel: React.FC<WalletPanelProps> = function (props) {
  var profile = props.profile;
  var [coins, setCoins] = useState(profile.coins || 0);
  var [bdt, setBdt] = useState(0);
  var [ads, setAds] = useState(profile.adsWatchedTotal || 0);
  var [code, setCode] = useState(profile.referralCode || '');
  var [qualified, setQualified] = useState(
    profile.qualifiedReferralsCount || 0
  );
  var [activeRefs, setActiveRefs] = useState(
    profile.activeReferralsCount || 0
  );
  var [copied, setCopied] = useState(false);
  var [withdrawOpen, setWithdrawOpen] = useState(false);
  var [method, setMethod] = useState('bkash');
  var [account, setAccount] = useState('');
  var [msg, setMsg] = useState('');
  var [busy, setBusy] = useState(false);
  var [minBdt, setMinBdt] = useState(500);
  var [minRefs, setMinRefs] = useState(10);

  async function refresh() {
    var w = await getWallet(profile.uid);
    setCoins(w.coins);
    setBdt(w.bdt);
    setAds(w.adsWatchedTotal || 0);
    setCode(w.referralCode || code);
    setQualified(w.qualifiedReferralsCount || 0);
    setActiveRefs(w.activeReferralsCount || 0);
  }

  useEffect(function () {
    refresh();
    fetchAppSettings().then(function (s) {
      setMinBdt(s.minWithdrawBdt || 500);
      setMinRefs(s.minActiveReferralsForWithdraw || 10);
    });
  }, [profile.uid]);

  function copyLink() {
    var link = getReferralLink(code);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(link).then(function () {
        setCopied(true);
        setTimeout(function () {
          setCopied(false);
        }, 2000);
      });
    } else {
      setMsg(link);
    }
  }

  async function requestWithdraw() {
    setMsg('');
    setBusy(true);
    try {
      var settings = await fetchAppSettings();
      var w = await getWallet(profile.uid);
      var needBdt = settings.minWithdrawBdt || 500;
      var needRefs = settings.minActiveReferralsForWithdraw || 10;
      var chatMin = settings.minChatMinutesPerDay || 60;

      if (w.bdt < needBdt) {
        throw new Error('Minimum withdraw ৳' + needBdt);
      }
      if ((w.qualifiedReferralsCount || 0) < needRefs) {
        throw new Error('Need at least ' + needRefs + ' qualified referrals');
      }

      var uSnap = await get(ref(rtdb, 'users/' + profile.uid));
      var u = uSnap.val() || {};
      var today = new Date().toISOString().slice(0, 10);
      var mins =
        u.chatActiveDate === today ? u.chatActiveMinutesToday || 0 : 0;
      if (mins < chatMin) {
        throw new Error(
          'Chat at least ' + chatMin + ' minutes today (now: ' + mins + ')'
        );
      }

      if (!account.trim()) throw new Error('Enter account number');

      var amountCoins = w.coins;
      var p = push(ref(rtdb, 'withdraw_requests'));
      await set(p, {
        id: p.key,
        uid: profile.uid,
        username: profile.username,
        anonymousName: profile.anonymousName,
        amountBdt: w.bdt,
        amountCoins: amountCoins,
        method: method,
        accountNumber: account.trim(),
        status: 'pending',
        activeReferrals: w.qualifiedReferralsCount || 0,
        chatMinutesToday: mins,
        createdAt: Date.now(),
      });
      setMsg('Withdraw request submitted. Admin will review.');
      setWithdrawOpen(false);
    } catch (e: any) {
      setMsg(e && e.message ? String(e.message) : 'Failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-slate-900 to-emerald-950/40 p-4">
        <p className="text-[11px] text-emerald-400/80 font-semibold uppercase tracking-wider">
          Wallet
        </p>
        <p className="text-2xl font-extrabold text-white mt-1">
          {formatBdt(bdt)}
        </p>
        <p className="text-xs text-slate-400 mt-0.5">
          {coins.toLocaleString()} coins · Ads watched: {ads}
        </p>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 space-y-2">
        <p className="text-[11px] text-purple-300 font-semibold uppercase">
          Referral
        </p>
        <p className="text-sm text-white font-mono tracking-wide">{code || '—'}</p>
        <p className="text-[11px] text-slate-400">
          Qualified: {qualified} · Active: {activeRefs}
        </p>
        <p className="text-[10px] text-slate-500">
          Friend watches 25 ads → you get ৳10 + 5% of their ad earnings
        </p>
        <button
          type="button"
          onClick={copyLink}
          className="w-full py-2 rounded-xl bg-purple-600/80 text-xs font-bold text-white"
        >
          {copied ? 'Copied!' : 'Copy referral link'}
        </button>
      </div>

      <button
        type="button"
        onClick={function () {
          setWithdrawOpen(!withdrawOpen);
        }}
        className="w-full py-2.5 rounded-xl border border-amber-500/30 bg-amber-950/30 text-xs font-bold text-amber-200"
      >
        Withdraw (min ৳{minBdt} · {minRefs}+ refs)
      </button>

      {withdrawOpen ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-3 space-y-2">
          <select
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-2 text-sm text-white"
            value={method}
            onChange={function (e) {
              setMethod(e.target.value);
            }}
          >
            <option value="bkash">bKash</option>
            <option value="nagad">Nagad</option>
            <option value="rocket">Rocket</option>
          </select>
          <input
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-2 text-sm text-white"
            placeholder="Account number"
            value={account}
            onChange={function (e) {
              setAccount(e.target.value);
            }}
          />
          <button
            type="button"
            disabled={busy}
            onClick={requestWithdraw}
            className="w-full py-2 rounded-xl bg-amber-600 text-xs font-bold disabled:opacity-50"
          >
            {busy ? 'Submitting…' : 'Submit request'}
          </button>
        </div>
      ) : null}

      {msg ? (
        <p className="text-[11px] text-slate-300 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5">
          {msg}
        </p>
      ) : null}
    </div>
  );
};
