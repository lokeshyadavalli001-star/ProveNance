import React, { useState, useEffect } from 'react';
import { ShieldCheck, KeyRound, AlertTriangle, Clock } from 'lucide-react';
import { apiService } from '../../services/api.js';

interface MFAModalProps {
  isOpen: boolean;
  tempToken: string;
  user: any;
  onSuccess: (authData: any) => void;
  onCancel: () => void;
}

export const MFAModal: React.FC<MFAModalProps> = ({
  isOpen,
  user,
  onSuccess,
  onCancel
}) => {
  const [code, setCode] = useState('');
  const [isBackup, setIsBackup] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);

  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 60));
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await apiService.verifyMfa(user.id, code, isBackup);
      onSuccess(response);
    } catch (err: any) {
      setError(err.message || 'MFA verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        <div className="text-center mb-6">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 mb-3">
            <KeyRound className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold text-white">Two-Factor Authentication (MFA)</h2>
          <p className="text-xs text-slate-400 mt-1">
            Required for privileged role: <span className="text-provenance-400 font-semibold">{user?.role}</span>
          </p>
        </div>

        {error && (
          <div className="mb-4 flex items-center space-x-2 rounded-lg bg-red-950/80 border border-red-800 p-3 text-xs text-red-200">
            <AlertTriangle className="h-4 w-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-4">
          {!isBackup ? (
            <div>
              <label className="block text-xs font-medium text-slate-300 text-center mb-2">
                Enter 6-digit Authenticator TOTP Code
              </label>
              <input
                type="text"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                className="w-full text-center text-3xl font-mono tracking-widest rounded-lg border border-slate-700 bg-slate-800 py-3 text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                autoFocus
              />
              <div className="flex items-center justify-center space-x-1.5 mt-2 text-xs text-slate-400">
                <Clock className="h-3.5 w-3.5 text-slate-400" />
                <span>Code window resets in: <strong className="text-emerald-400">{timeLeft}s</strong></span>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Enter Single-Use Backup Code
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="PROV-XXXX-XXXX"
                className="w-full text-center font-mono rounded-lg border border-slate-700 bg-slate-800 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || code.length < 4}
            className="w-full rounded-lg bg-emerald-600 py-2.5 text-xs font-semibold text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-500 disabled:opacity-50 transition"
          >
            {isLoading ? 'Validating Token...' : 'Verify Identity'}
          </button>
        </form>

        <div className="mt-4 flex items-center justify-between text-xs pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={() => {
              setIsBackup(!isBackup);
              setCode('');
              setError('');
            }}
            className="text-provenance-400 hover:text-provenance-300"
          >
            {isBackup ? 'Use Authenticator App' : 'Use Backup Code Instead'}
          </button>

          <button
            type="button"
            onClick={onCancel}
            className="text-slate-400 hover:text-white"
          >
            Cancel
          </button>
        </div>

        {/* Hackathon Demo Helper */}
        <div className="mt-4 rounded bg-slate-800/80 p-2.5 border border-slate-700/60 text-[11px] text-slate-400">
          <span className="font-semibold text-slate-300">Judge / Demo Quick Bypass:</span> Enter <button type="button" onClick={() => setCode('123456')} className="text-emerald-400 font-mono underline">123456</button> or backup code <button type="button" onClick={() => { setIsBackup(true); setCode('PROV-8821-X992'); }} className="text-emerald-400 font-mono underline">PROV-8821-X992</button>.
        </div>
      </div>
    </div>
  );
};
