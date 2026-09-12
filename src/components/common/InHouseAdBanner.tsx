import React, { useEffect, useState } from 'react';
import { ref, update, increment } from 'firebase/database';
import { fetchAllAds } from '../../services/adminService';
import { AdItem } from '../../types/admin';
import { rtdb } from '../../config/firebase.config';

export const InHouseAdBanner: React.FC = function () {
  var adsState = useState([] as AdItem[]);
  var ads = adsState[0];
  var setAds = adsState[1];

  var indexState = useState(0);
  var index = indexState[0];
  var setIndex = indexState[1];

  useEffect(function () {
    fetchAllAds()
      .then(function (list) {
        var active = list.filter(function (a) {
          return a.status === 'active';
        });
        setAds(active);
        if (active.length > 0) {
          active.forEach(function (ad) {
            try {
              update(ref(rtdb, 'ads/' + ad.id), {
                views: increment(1),
              });
            } catch (e) {}
          });
        }
      })
      .catch(function () {});
  }, []);

  useEffect(
    function () {
      if (ads.length <= 1) return;
      var t = setInterval(function () {
        setIndex(function (i) {
          return (i + 1) % ads.length;
        });
      }, 5000);
      return function () {
        clearInterval(t);
      };
    },
    [ads.length]
  );

  if (!ads.length) return null;

  var ad = ads[index] || ads[0];
  if (!ad) return null;

  async function handleClick() {
    try {
      await update(ref(rtdb, 'ads/' + ad.id), {
        clicks: increment(1),
      });
    } catch (e) {}
    if (ad.link) {
      window.open(ad.link, '_blank', 'noopener,noreferrer');
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="w-full rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-950/80 via-orange-950/60 to-slate-900 p-4 flex items-center gap-3 text-left active:scale-[0.99] transition"
    >
      <div className="w-11 h-11 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-xl shrink-0">
        📢
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-semibold text-amber-400/80 uppercase tracking-wide">
          Sponsored
        </p>
        <p className="text-sm font-bold text-white truncate">
          {ad.title || 'Promoted'}
        </p>
        <p className="text-[11px] text-slate-400 truncate mt-0.5">
          Tap to open
        </p>
      </div>
      <span className="text-amber-400 text-lg shrink-0">›</span>
    </button>
  );
};
