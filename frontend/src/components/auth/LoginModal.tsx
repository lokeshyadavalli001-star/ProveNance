import React, { useState } from 'react';
import { X, Lock, ShieldCheck, AlertTriangle } from 'lucide-react';
import { apiService } from '../../services/api.js';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (authData: any) => void;
  onRequireMfa: (tempToken: string, user: any) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  onRequireMfa
}) => {
  const [email, setEmail] = useState('admin@provenance.io');
  const [password, setPassword] = useState('AdminSecret2026!');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [loginAttempts, setLoginAttempts] = useState(0);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (loginAttempts >= 5) {
      setError('Too many failed login attempts. Account locked for 30 minutes.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiService.login(email, password);
      if (response.requiresMfa) {
        onRequireMfa(response.tempMfaToken, response.user);
      } else {
        onLoginSuccess(response);
        onClose();
      }
    } catch (err: any) {
      setLoginAttempts(prev => prev + 1);
      setError(err.message || 'Invalid credentials or account locked');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuth = async (provider: 'google' | 'okta') => {
    setIsLoading(true);
    try {
      const response = await apiService.mockOAuth(provider, email || 'enterprise.user@provenance.io');
      onLoginSuccess(response);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="text-center mb-6">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-provenance-600/20 text-provenance-400 border border-provenance-500/30 mb-3">
            <Lock className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold text-white">ProveNance™ Identity Gateway</h2>
          <p className="text-xs text-slate-400 mt-1">Zero-Trust Enterprise Authentication & Session Security</p>
        </div>

        {error && (
          <div className="mb-4 flex items-center space-x-2 rounded-lg bg-red-950/80 border border-red-800 p-3 text-xs text-red-200">
            <AlertTriangle className="h-4 w-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300">Corporate Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-provenance-500 focus:outline-none focus:ring-1 focus:ring-provenance-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-provenance-500 focus:outline-none focus:ring-1 focus:ring-provenance-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || loginAttempts >= 5}
            className="w-full rounded-lg bg-provenance-600 py-2.5 text-xs font-semibold text-white shadow-lg shadow-provenance-600/30 hover:bg-provenance-500 disabled:opacity-50 transition"
          >
            {isLoading ? 'Verifying Credentials...' : 'Sign In with Password'}
          </button>
        </form>

        {/* Demo Fast-Fill Buttons for Judges */}
        <div className="mt-4 pt-4 border-t border-slate-800">
          <p className="text-[11px] font-medium text-slate-400 mb-2">Judge / Demo Quick Presets:</p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => {
                setEmail('admin@provenance.io');
                setPassword('AdminSecret2026!');
              }}
              className="rounded bg-slate-800 px-2 py-1 text-[11px] text-slate-300 hover:bg-slate-700 border border-slate-700"
            >
              Admin (MFA)
            </button>
            <button
              type="button"
              onClick={() => {
                setEmail('analyst.emea@provenance.io');
                setPassword('AnalystSecret2026!');
              }}
              className="rounded bg-slate-800 px-2 py-1 text-[11px] text-slate-300 hover:bg-slate-700 border border-slate-700"
            >
              EMEA Analyst
            </button>
            <button
              type="button"
              onClick={() => {
                setEmail('operator@provenance.io');
                setPassword('OperatorSecret2026!');
              }}
              className="rounded bg-slate-800 px-2 py-1 text-[11px] text-slate-300 hover:bg-slate-700 border border-slate-700"
            >
              Operator
            </button>
          </div>
        </div>

        {/* SSO Federation Options */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleOAuth('google')}
            className="flex items-center justify-center space-x-2 rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700"
          >
            <span>Google SSO</span>
          </button>
          <button
            type="button"
            onClick={() => handleOAuth('okta')}
            className="flex items-center justify-center space-x-2 rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700"
          >
            <span>Okta OIDC</span>
          </button>
        </div>
      </div>
    </div>
  );
};
