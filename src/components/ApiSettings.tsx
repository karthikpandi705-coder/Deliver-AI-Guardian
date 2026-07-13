import React, { useState, useEffect } from 'react';
import { Shield, Eye, EyeOff, Save, X, Sparkles, Map } from 'lucide-react';
import { GlassCard } from './GlassCard';

interface ApiSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (geminiKey: string, mapsKey: string) => void;
}

export const ApiSettings: React.FC<ApiSettingsProps> = ({ isOpen, onClose, onSave }) => {
  const [geminiKey, setGeminiKey] = useState('');
  const [mapsKey, setMapsKey] = useState('');
  const [showGemini, setShowGemini] = useState(false);
  const [showMaps, setShowMaps] = useState(false);

  useEffect(() => {
    // Load keys from localStorage on open
    if (isOpen) {
      setGeminiKey(localStorage.getItem('gemini_api_key') || '');
      setMapsKey(localStorage.getItem('google_maps_api_key') || '');
    }
  }, [isOpen]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('gemini_api_key', geminiKey.trim());
    localStorage.setItem('google_maps_api_key', mapsKey.trim());
    onSave(geminiKey.trim(), mapsKey.trim());
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <div 
        className="absolute inset-0" 
        onClick={onClose}
      />
      <GlassCard className="relative w-full max-w-md p-6 overflow-hidden z-10 border border-white/10 shadow-2xl">
        <div className="flex justify-between items-center border-b border-white/10 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-brand-orange" />
            <h3 className="text-lg font-bold text-white">API Credentials</h3>
          </div>
          <button 
            onClick={onClose} 
            className="text-white/50 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-white/60 mb-6 leading-relaxed">
          Configure your API keys to enable real-time features. Keys are saved securely in your local browser storage. If left blank, the app will run in <strong>Demo Mode</strong> with smart simulations.
        </p>

        <form onSubmit={handleSave} className="space-y-5">
          {/* Gemini API Key */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-white/80 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-brand-orange" />
              Gemini API Key
            </label>
            <div className="relative">
              <input
                type={showGemini ? "text" : "password"}
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                placeholder="Enter Gemini API Key (e.g. AIzaSy...)"
                className="w-full py-2.5 pl-4 pr-10 rounded-xl glass-input text-xs"
              />
              <button
                type="button"
                onClick={() => setShowGemini(!showGemini)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
              >
                {showGemini ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <span className="text-[10px] text-white/40 block">Used for the Hands-Free AI Companion.</span>
          </div>

          {/* Google Maps API Key */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-white/80 flex items-center gap-1.5">
              <Map className="w-3.5 h-3.5 text-brand-orange" />
              Google Maps API Key
            </label>
            <div className="relative">
              <input
                type={showMaps ? "text" : "password"}
                value={mapsKey}
                onChange={(e) => setMapsKey(e.target.value)}
                placeholder="Enter Google Maps API Key"
                className="w-full py-2.5 pl-4 pr-10 rounded-xl glass-input text-xs"
              />
              <button
                type="button"
                onClick={() => setShowMaps(!showMaps)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
              >
                {showMaps ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <span className="text-[10px] text-white/40 block">Used to render the Smart Route Map.</span>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 justify-end pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-white/80 hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-brand-orange hover:bg-brand-orange-hover text-white rounded-xl text-xs font-semibold shadow-md shadow-brand-orange/20 flex items-center gap-1.5 transition-colors"
            >
              <Save className="w-4 h-4" />
              Save Keys
            </button>
          </div>
        </form>
      </GlassCard>
    </div>
  );
};
