import React from 'react';
import { 
  Shield, 
  TrendingUp, 
  Navigation, 
  CloudSun, 
  MessageSquareCode, 
  ArrowRight,
  Sparkles,
  CheckCircle,
  Clock
} from 'lucide-react';
import { GlassCard } from '../components/GlassCard';

interface LandingPageProps {
  onNavigate: (page: 'landing' | 'login' | 'dashboard') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-brand-dark overflow-hidden flex flex-col">
      {/* Background Blobs for Atmosphere */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-brand-orange-alpha rounded-full blur-[160px] pointer-events-none -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[180px] pointer-events-none translate-y-1/3"></div>

      {/* Header / Navbar */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex justify-between items-center z-10">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-brand-orange animate-pulse-subtle" />
          <div>
            <span className="text-xl font-extrabold text-white tracking-tight">DeliverAI</span>
            <span className="text-[10px] block uppercase font-bold text-brand-orange tracking-widest leading-none">Guardian</span>
          </div>
        </div>
        <button
          onClick={() => onNavigate('login')}
          className="px-5 py-2 rounded-xl text-sm font-semibold border border-white/10 hover:border-brand-orange hover:bg-brand-orange-alpha text-white transition-all duration-300"
        >
          Sign In
        </button>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto px-6 flex flex-col items-center justify-center text-center py-16 md:py-24 z-10">
        {/* Tag Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-orange-alpha border border-brand-orange/35 text-brand-orange text-xs font-bold uppercase tracking-wider mb-8 animate-pulse-subtle shadow-sm shadow-brand-orange/5">
          <Sparkles className="w-4 h-4 text-brand-orange" />
          Hackathon Winner MVP
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl md:text-7xl font-extrabold text-white tracking-tight leading-tight max-w-5xl">
          One AI Assistant for Every <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-orange to-amber-500">Delivery Partner</span>
        </h1>

        <p className="mt-8 text-lg md:text-xl text-white/70 max-w-3xl leading-relaxed">
          Navigate smarter, boost your hourly earnings, and stay safe with real-time AI weather guards, instant local advice, and route optimization.
        </p>

        {/* Hero CTA Button */}
        <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center items-center w-full max-w-md mx-auto">
          <button
            onClick={() => onNavigate('login')}
            className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-brand-orange hover:bg-brand-orange-hover text-white font-extrabold text-lg shadow-xl shadow-brand-orange/30 hover:shadow-brand-orange/50 transition-all duration-300 hover:scale-[1.03] active:scale-95 cursor-pointer"
          >
            Launch Assistant
            <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
          </button>
          <button
            onClick={() => {
              const element = document.getElementById('features');
              element?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="w-full sm:w-auto px-8 py-4 rounded-xl text-white/80 hover:text-white hover:bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-300 font-semibold cursor-pointer"
          >
            Learn Features
          </button>
        </div>

        {/* Mockup Dashboard Preview Card */}
        <div className="mt-16 w-full max-w-4xl relative animate-float">
          {/* Glass Card Mockup */}
          <div className="glass-panel rounded-2xl border border-white/10 p-2 shadow-2xl">
            <div className="rounded-xl overflow-hidden bg-brand-dark border border-white/5 flex flex-col md:flex-row h-[350px]">
              {/* Sidebar Mock */}
              <div className="hidden md:flex flex-col w-48 border-r border-white/5 p-4 justify-between bg-black/10">
                <div className="space-y-4">
                  <div className="w-8 h-8 rounded-full bg-brand-orange-alpha flex items-center justify-center">
                    <Shield className="w-4 h-4 text-brand-orange" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 w-28 bg-brand-orange rounded-full"></div>
                    <div className="h-3 w-20 bg-white/10 rounded-full"></div>
                    <div className="h-3 w-24 bg-white/10 rounded-full"></div>
                  </div>
                </div>
                <div className="h-6 w-full bg-white/5 rounded-md"></div>
              </div>
              
              {/* Content Mock */}
              <div className="flex-1 p-6 flex flex-col justify-between text-left">
                <div className="flex justify-between items-start border-b border-white/5 pb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      Guardian Dashboard
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                    </h3>
                    <p className="text-xs text-white/50">Optimal Route Plan Active</p>
                  </div>
                  <div className="px-3 py-1 bg-brand-orange-alpha border border-brand-orange/30 text-brand-orange rounded-full text-xs font-semibold">
                    +$42.50 Est. Earnings
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-4">
                  <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                    <span className="text-[10px] text-white/50 block">ACTIVE DELIVERY</span>
                    <p className="text-sm font-bold text-white mt-1">Order #204 - Grill House</p>
                  </div>
                  <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                    <span className="text-[10px] text-white/50 block">AI RECOMMENDATION</span>
                    <p className="text-xs text-brand-orange mt-1">Take 4th Ave to avoid detour</p>
                  </div>
                  <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                    <span className="text-[10px] text-white/50 block">WEATHER THREAT</span>
                    <p className="text-xs text-emerald-400 mt-1">Clear path for next 20m</p>
                  </div>
                </div>

                <div className="h-12 bg-white/5 rounded-xl border border-white/5 flex items-center justify-between px-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-brand-orange"></div>
                    <span className="text-xs text-white/80">AI Assistant: "Rain in 15 mins. Prepare jacket."</span>
                  </div>
                  <button className="text-xs text-brand-orange font-bold flex items-center gap-1 hover:underline">
                    Open Chat <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Decorative absolute components floating around */}
          <div className="hidden lg:block absolute -left-12 top-1/3 bg-black/40 backdrop-blur-md p-4 rounded-xl border border-white/10 shadow-lg text-left w-48">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-brand-orange" />
              <span className="text-xs font-bold">12m Saved Today</span>
            </div>
          </div>
          <div className="hidden lg:block absolute -right-12 bottom-1/3 bg-black/40 backdrop-blur-md p-4 rounded-xl border border-white/10 shadow-lg text-left w-52">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold">Safe & Optimal Route</span>
            </div>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section id="features" className="w-full bg-black/30 py-20 border-t border-white/5 z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-extrabold text-white">
              Supercharge Your Shift
            </h2>
            <p className="text-white/60 mt-4">
              AI companion tools built for high-performance delivery pros.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <GlassCard className="flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-brand-orange-alpha border border-brand-orange/30 flex items-center justify-center text-brand-orange mb-6">
                  <Navigation className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Smart AI Routes</h3>
                <p className="text-white/60 text-sm leading-relaxed">
                  Real-time dynamic traffic bypass suggestions that help you complete orders up to 20% faster.
                </p>
              </div>
            </GlassCard>

            <GlassCard className="flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-6">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Earnings Tracker</h3>
                <p className="text-white/60 text-sm leading-relaxed">
                  Predict your best delivery times, track targets, and compare platform orders instantly in one panel.
                </p>
              </div>
            </GlassCard>

            <GlassCard className="flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-6">
                  <CloudSun className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Weather & Road Alerts</h3>
                <p className="text-white/60 text-sm leading-relaxed">
                  Sudden rain, wind, or slick roads detected ahead? Get instant warning sounds to stay safe and dry.
                </p>
              </div>
            </GlassCard>

            <GlassCard className="flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-6">
                  <MessageSquareCode className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Voice AI Chatbot</h3>
                <p className="text-white/60 text-sm leading-relaxed">
                  Need restaurant pickup details, parking tips, or help during drops? Just ask our voice assistant hands-free.
                </p>
              </div>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-8 border-t border-white/5 text-center text-xs text-white/40 mt-auto">
        &copy; {new Date().getFullYear()} DeliverAI Guardian. Built for Hackathons. All rights reserved.
      </footer>
    </div>
  );
};
