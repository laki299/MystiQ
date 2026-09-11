import React from 'react';

interface ServerFullScreenProps {
  onlineCount: number;
  maxUsers: number;
  onRetry: () => void;
  onLogout?: () => void;
}

export const ServerFullScreen: React.FC<ServerFullScreenProps> = function (
  props
) {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="w-full max-w-sm text-center space-y-5">
        <div className="text-5xl">🚦</div>
        <h1 className="text-2xl font-black text-white">Server Full</h1>
        <p className="text-sm text-slate-400 leading-relaxed">
          MystiQ is at capacity right now (
          {props.onlineCount}/{props.maxUsers} online).
          <br />
          Please try again in a few minutes.
        </p>
        <p className="text-[11px] text-slate-600">
          Free plan limit — protects the app from crashing.
        </p>
        <button
          type="button"
          onClick={props.onRetry}
          className="w-full py-3.5 rounded-2xl bg-purple-600 text-white font-bold text-sm"
        >
          Try Again
        </button>
        {props.onLogout ? (
          <button
            type="button"
            onClick={props.onLogout}
            className="w-full py-3 rounded-2xl border border-slate-700 text-slate-400 text-sm"
          >
            Log out
          </button>
        ) : null}
      </div>
    </div>
  );
};
