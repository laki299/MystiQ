import React, { useEffect, useState } from 'react';
import { getRefCodeFromUrl } from '../../utils/deviceId';

interface AuthScreenProps {
  onLogin: (username: string, password: string) => Promise<void>;
  onRegister: (
    username: string,
    password: string,
    extra?: { referralCode?: string }
  ) => Promise<void>;
}

export const AuthScreen: React.FC<AuthScreenProps> = function (props) {
  var onLogin = props.onLogin;
  var onRegister = props.onRegister;

  var [mode, setMode] = useState<'login' | 'register'>('login');
  var [username, setUsername] = useState('');
  var [password, setPassword] = useState('');
  var [refCode, setRefCode] = useState('');
  var [error, setError] = useState('');
  var [busy, setBusy] = useState(false);

  useEffect(function () {
    var fromUrl = getRefCodeFromUrl();
    if (fromUrl) {
      setRefCode(fromUrl);
      setMode('register');
    }
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      if (mode === 'login') {
        await onLogin(username, password);
      } else {
        await onRegister(username, password, {
          referralCode: refCode.trim() || undefined,
        });
      }
    } catch (err: any) {
      setError(err && err.message ? String(err.message) : 'Failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-5">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-extrabold text-purple-400 tracking-wide">
            MYSTIQ
          </h1>
          <p className="text-xs text-slate-400">Anonymous · Private · Chat</p>
        </div>

        <div className="flex rounded-xl overflow-hidden border border-slate-800">
          <button
            type="button"
            onClick={function () {
              setMode('login');
            }}
            className={
              'flex-1 py-2.5 text-sm font-bold ' +
              (mode === 'login'
                ? 'bg-purple-600 text-white'
                : 'bg-slate-900 text-slate-400')
            }
          >
            Login
          </button>
          <button
            type="button"
            onClick={function () {
              setMode('register');
            }}
            className={
              'flex-1 py-2.5 text-sm font-bold ' +
              (mode === 'register'
                ? 'bg-purple-600 text-white'
                : 'bg-slate-900 text-slate-400')
            }
          >
            Register
          </button>
        </div>

        <form
          onSubmit={submit}
          className="space-y-3 bg-slate-900 border border-slate-800 rounded-2xl p-4"
        >
          <label className="block text-xs text-slate-400">
            Username
            <input
              className="mt-1 w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white"
              value={username}
              onChange={function (e) {
                setUsername(e.target.value);
              }}
              autoCapitalize="off"
              autoCorrect="off"
              required
            />
          </label>

          <label className="block text-xs text-slate-400">
            Password
            <input
              type="password"
              className="mt-1 w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white"
              value={password}
              onChange={function (e) {
                setPassword(e.target.value);
              }}
              required
            />
          </label>

          {mode === 'register' ? (
            <label className="block text-xs text-slate-400">
              Referral code (optional)
              <input
                className="mt-1 w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white uppercase"
                value={refCode}
                onChange={function (e) {
                  setRefCode(e.target.value.toUpperCase());
                }}
                placeholder="Friend code"
              />
            </label>
          ) : null}

          {error ? (
            <p className="text-xs text-rose-400 bg-rose-950/40 border border-rose-900 rounded-lg px-2 py-1.5">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={busy}
            className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-sm font-bold text-white disabled:opacity-50"
          >
            {busy
              ? 'Please wait…'
              : mode === 'login'
                ? 'Login'
                : 'Create account'}
          </button>
        </form>
      </div>
    </div>
  );
};
