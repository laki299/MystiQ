import React, { useEffect, useState } from 'react';
import { fetchAppSettings } from '../../services/adminService';

export const ShareAppButton: React.FC = () => {
  const [downloadUrl, setDownloadUrl] = useState(
    'https://mysti-q-flame.vercel.app'
  );
  const [shareMessage, setShareMessage] = useState(
    'MystiQ — Anonymous chat. Download / open here:'
  );
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchAppSettings()
      .then((s) => {
        if (s.appDownloadUrl) setDownloadUrl(s.appDownloadUrl);
        if (s.shareMessage) setShareMessage(s.shareMessage);
      })
      .catch(() => {});
  }, []);

  const fullText = `\( {shareMessage}\n \){downloadUrl}`;

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'MystiQ',
          text: shareMessage,
          url: downloadUrl,
        });
        return;
      }
    } catch {
      // copy fallback
    }

    try {
      await navigator.clipboard.writeText(fullText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt('Copy this link:', fullText);
    }
  };

  return (
    <button
      onClick={handleShare}
      className="w-full rounded-2xl border border-purple-500/30 bg-purple-600/15 hover:bg-purple-600/25 p-4 flex items-center gap-3 active:scale-[0.99] transition"
    >
      <div className="w-11 h-11 rounded-xl bg-purple-600/30 flex items-center justify-center text-xl">
        📤
      </div>
      <div className="flex-1 text-left">
        <p className="text-sm font-bold text-purple-200">
          {copied ? 'Link copied!' : 'Share App'}
        </p>
        <p className="text-[11px] text-slate-400">
          Invite friends — copy download link
        </p>
      </div>
      <span className="text-purple-400 text-lg">›</span>
    </button>
  );
};
