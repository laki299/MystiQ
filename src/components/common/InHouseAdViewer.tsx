import React from 'react';
import { AdItem } from '../../types/admin';

interface InHouseAdViewerProps {
  ad: AdItem;
  onClose: () => void;
}

export const InHouseAdViewer: React.FC<InHouseAdViewerProps> = function (props) {
  var ad = props.ad;
  var onClose = props.onClose;

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900 shrink-0">
        <div className="min-w-0 flex-1 pr-3">
          <p className="text-[10px] text-amber-400 font-semibold uppercase">
            Sponsored
          </p>
          <p className="text-sm font-bold text-white truncate">
            {ad.title || 'Ad'}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-200 text-xs font-bold border border-slate-700"
        >
          Close
        </button>
      </div>

      <div className="flex-1 relative bg-black">
        {ad.link ? (
          <iframe
            src={ad.link}
            title={ad.title || 'Ad'}
            className="absolute inset-0 w-full h-full border-0"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
            referrerPolicy="no-referrer-when-downgrade"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-sm">
            No link
          </div>
        )}
      </div>

      <div className="px-4 py-2 border-t border-slate-800 bg-slate-900 shrink-0">
        <p className="text-[10px] text-slate-500 truncate text-center">
          {ad.link}
        </p>
      </div>
    </div>
  );
};
