import React, { useState } from 'react';
import { Shield, Lock, User, ArrowRight, AlertCircle, Info } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';

interface LoginPageProps {
  onNavigate: (page: 'landing' | 'login' | 'dashboard') => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!username.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    setIsLoading(true);

    // Mock network latency
    setTimeout(() => {
      setIsLoading(false);
      onNavigate('dashboard');
    }, 1200);
  };

  const handleQuickLogin = () => {
    setUsername('delivery_partner_pro');
    setPassword('guardian2026');
    setError('');
  };

  return (
    <div className="min-h-screen bg-brand-dark flex flex-col justify-center items-center px-6 relative">
      {/* Decorative Blobs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-brand-orange-alpha rounded-full blur-[140px] pointer-events-none"></div>

      {/* Brand Logo Header */}
      <div className="flex flex-col items-center gap-2 mb-8 cursor-pointer" onClick={() => onNavigate('landing')}>
        <Shield className="w-12 h-12 text-brand-orange animate-pulse-subtle" />
        <div className="text-center">
          <h2 className="text-2xl font-extrabold text-white tracking-tight leading-none m-0">DeliverAI</h2>
          <span className="text-[11px] uppercase font-bold text-brand-orange tracking-widest">Guardian</span>
        </div>
      </div>

      {/* Main Login Card */}
      <GlassCard className="w-full max-w-md p-8 relative border border-white/10" hoverEffect={false}>
        <div className="mb-6 text-center">
          <h3 className="text-xl font-bold text-white">Welcome Back</h3>
          <p className="text-xs text-white/50 mt-1">Connect your assistant and start your shift.</p>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-white/70 mb-2 uppercase tracking-wider">
              Username or Partner ID
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. partner_john"
                className="w-full pl-11 pr-4 py-3.5 rounded-xl glass-input text-sm"
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-white/70 mb-2 uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3.5 rounded-xl glass-input text-sm"
                disabled={isLoading}
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 rounded-xl bg-brand-orange hover:bg-brand-orange-hover text-white font-bold text-sm tracking-wide shadow-lg shadow-brand-orange/20 transition-all duration-300 flex justify-center items-center gap-2 mt-6 hover:scale-[1.01]"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                Initialize Shift Link
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Demo Fast Login Info */}
        <div className="mt-6 pt-6 border-t border-white/5 flex flex-col items-center gap-3">
          <div className="flex items-start gap-2 p-3 bg-white/5 rounded-xl border border-white/5 w-full text-left">
            <Info className="w-4 h-4 text-brand-orange shrink-0 mt-0.5" />
            <div className="text-[11px] text-white/75 leading-relaxed">
              <span className="font-bold text-brand-orange">Hackathon Tip:</span> Skip typing and click below to load credentials instantly.
            </div>
          </div>
          <button
            type="button"
            onClick={handleQuickLogin}
            className="text-xs font-bold text-brand-orange hover:underline flex items-center gap-1 transition-all"
          >
            Quick-Fill Demo Credentials
          </button>
        </div>
      </GlassCard>

      {/* Back button */}
      <button
        onClick={() => onNavigate('landing')}
        className="mt-6 text-xs text-white/40 hover:text-white transition-colors"
      >
        Back to Home Page
      </button>
    </div>
  );
};
