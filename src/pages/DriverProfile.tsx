import React, { useState, useEffect } from 'react';
import { GlassCard } from '../components/GlassCard';
import { 
  User, 
  Award, 
  TrendingUp, 
  Clock, 
  Map, 
  DollarSign, 
  Activity, 
  ShieldAlert, 
  Sparkles, 
  Plus, 
  Edit3, 
  Save, 
  Briefcase, 
  Calendar, 
  Wifi, 
  WifiOff, 
  RotateCcw,
  Zap,
  Star,
  Milestone,
  Flame
} from 'lucide-react';

interface DriverProfileData {
  avatar: string;
  name: string;
  driverId: string;
  platform: 'DoorDash' | 'Uber Eats' | 'Grubhub';
  isOnline: boolean;
  memberSince: string;
  
  // Performance
  totalDeliveries: number;
  totalEarnings: number;
  totalDistance: number;
  avgDeliveryTime: number; // in mins
  customerRating: number;
  acceptanceRate: number; // percentage
  completionRate: number; // percentage
  onTimeRate: number; // percentage
  
  // Statistics
  totalHoursOnline: number;
  currentStreak: number;
  longestStreak: number;
  bestEarningsDay: string;
  bestEarningsAmount: number;
  avgDailyProfit: number;
}

const DEFAULT_PROFILE: DriverProfileData = {
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
  name: 'Karthik S.',
  driverId: 'DAG-98421',
  platform: 'DoorDash',
  isOnline: true,
  memberSince: '2024-03-12',
  
  totalDeliveries: 95,
  totalEarnings: 935.40,
  totalDistance: 292.8,
  avgDeliveryTime: 18.2,
  customerRating: 4.82,
  acceptanceRate: 84,
  completionRate: 98,
  onTimeRate: 93,
  
  totalHoursOnline: 48,
  currentStreak: 8,
  longestStreak: 18,
  bestEarningsDay: '2026-07-11',
  bestEarningsAmount: 184.20,
  avgDailyProfit: 68.50,
};

const ACHIEVEMENTS = [
  {
    id: 'safe_driver',
    name: 'Safe Driver',
    description: 'Maintain a rating above 4.80 and completion rate above 95%',
    icon: ShieldAlert,
    check: (data: DriverProfileData) => data.customerRating >= 4.8 && data.completionRate >= 95,
  },
  {
    id: 'hundred_deliveries',
    name: '100 Deliveries',
    description: 'Complete 100 total deliveries across all platforms',
    icon: Milestone,
    check: (data: DriverProfileData) => data.totalDeliveries >= 100,
  },
  {
    id: 'night_hero',
    name: 'Night Hero',
    description: 'Log 50+ total active hours in delivery operations',
    icon: Flame,
    check: (data: DriverProfileData) => data.totalHoursOnline >= 50,
  },
  {
    id: 'rain_warrior',
    name: 'Rain Warrior',
    description: 'Cover over 300 total delivery route miles',
    icon: Map,
    check: (data: DriverProfileData) => data.totalDistance >= 300,
  },
  {
    id: 'top_performer',
    name: 'Top Performer',
    description: 'Achieve acceptance rate >= 85% and rating >= 4.90',
    icon: Award,
    check: (data: DriverProfileData) => data.acceptanceRate >= 85 && data.customerRating >= 4.9,
  },
  {
    id: 'profit_master',
    name: 'Profit Master',
    description: 'Earn $1,000+ in total platform delivery payouts',
    icon: DollarSign,
    check: (data: DriverProfileData) => data.totalEarnings >= 1000,
  },
];

export const DriverProfile: React.FC = () => {
  const [profile, setProfile] = useState<DriverProfileData>(DEFAULT_PROFILE);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [editPlatform, setEditPlatform] = useState<'DoorDash' | 'Uber Eats' | 'Grubhub'>('DoorDash');
  const [editMemberSince, setEditMemberSince] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  // Initialize from LocalStorage or Default
  useEffect(() => {
    const saved = localStorage.getItem('deliverai_guardian_driver_profile');
    if (saved) {
      try {
        setProfile(JSON.parse(saved));
      } catch (e) {
        console.error("Error reading driver profile from localStorage", e);
        setProfile(DEFAULT_PROFILE);
      }
    } else {
      localStorage.setItem('deliverai_guardian_driver_profile', JSON.stringify(DEFAULT_PROFILE));
      setProfile(DEFAULT_PROFILE);
    }
  }, []);

  const saveToStorage = (updated: DriverProfileData) => {
    setProfile(updated);
    localStorage.setItem('deliverai_guardian_driver_profile', JSON.stringify(updated));
  };

  const handleStartEdit = () => {
    setEditName(profile.name);
    setEditAvatar(profile.avatar);
    setEditPlatform(profile.platform);
    setEditMemberSince(profile.memberSince);
    setIsEditing(true);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = {
      ...profile,
      name: editName.trim() || profile.name,
      avatar: editAvatar.trim() || profile.avatar,
      platform: editPlatform,
      memberSince: editMemberSince || profile.memberSince,
    };
    saveToStorage(updated);
    setIsEditing(false);
    showToast("Profile information updated!");
  };

  const handleToggleOnline = () => {
    const updated = {
      ...profile,
      isOnline: !profile.isOnline,
    };
    saveToStorage(updated);
    showToast(`Driver is now ${updated.isOnline ? 'Online' : 'Offline'}`);
  };

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Deliveries simulation
  const handleSimulateDelivery = () => {
    const deliveryPayout = parseFloat((Math.random() * 15 + 8.5).toFixed(2));
    const deliveryDist = parseFloat((Math.random() * 4.5 + 1.2).toFixed(1));
    const deliveryTime = Math.floor(Math.random() * 10 + 12); // minutes
    
    const newDeliveries = profile.totalDeliveries + 1;
    const newEarnings = parseFloat((profile.totalEarnings + deliveryPayout).toFixed(2));
    const newDistance = parseFloat((profile.totalDistance + deliveryDist).toFixed(1));
    const newStreak = profile.currentStreak + 1;
    const newLongestStreak = Math.max(profile.longestStreak, newStreak);
    const newHours = parseFloat((profile.totalHoursOnline + 0.4).toFixed(1));

    // Slight dynamic fluctuations to metrics
    const newRating = Math.min(5.0, parseFloat((profile.customerRating + (Math.random() * 0.04 - 0.01)).toFixed(2)));
    const newAcceptance = Math.min(100, Math.max(50, profile.acceptanceRate + (Math.random() > 0.3 ? 1 : -1)));
    const newCompletion = Math.min(100, Math.max(90, profile.completionRate + (Math.random() > 0.8 ? 1 : 0)));
    const newOnTime = Math.min(100, Math.max(80, profile.onTimeRate + (Math.random() > 0.5 ? 1 : -1)));

    const updated: DriverProfileData = {
      ...profile,
      totalDeliveries: newDeliveries,
      totalEarnings: newEarnings,
      totalDistance: newDistance,
      currentStreak: newStreak,
      longestStreak: newLongestStreak,
      totalHoursOnline: newHours,
      customerRating: newRating,
      acceptanceRate: newAcceptance,
      completionRate: newCompletion,
      onTimeRate: newOnTime,
      avgDeliveryTime: parseFloat(((profile.avgDeliveryTime * 9 + deliveryTime) / 10).toFixed(1)),
    };

    // Check for newly unlocked achievements
    ACHIEVEMENTS.forEach(ach => {
      const wasUnlockedBefore = ach.check(profile);
      const isUnlockedNow = ach.check(updated);
      if (isUnlockedNow && !wasUnlockedBefore) {
        showToast(`🎉 Achievement Unlocked: ${ach.name}!`);
      }
    });

    saveToStorage(updated);
    showToast(`Delivery completed! +$${deliveryPayout.toFixed(2)} (${deliveryDist} mi)`);
  };

  const handleResetData = () => {
    if (window.confirm("Are you sure you want to reset your driver profile to default mock data?")) {
      saveToStorage(DEFAULT_PROFILE);
      showToast("Profile statistics reset to default.");
    }
  };

  // Filter recommendations based on active data
  const getAiRecommendations = () => {
    const recs = [];
    if (profile.acceptanceRate < 85) {
      recs.push("Your acceptance rate is slightly low. Target 85% to lock in Top Performer perks.");
    } else {
      recs.push("Excellent acceptance rate! You are unlocking premium delivery allocations.");
    }
    
    if (profile.avgDeliveryTime > 20) {
      recs.push("Taking shorter routes and pre-planning parking spots can improve your average delivery time.");
    } else {
      recs.push("You complete deliveries faster than the neighborhood average. Outstanding work!");
    }

    if (profile.isOnline) {
      recs.push("Peak local platform earnings are forecasted between 6:00 PM and 9:30 PM. Stay online!");
    } else {
      recs.push("Shift is offline. Log in during lunch/dinner surges for maximum efficiency.");
    }

    return recs;
  };

  // Preset default weekly mock dataset
  const weeklyEarningsData = [120, 145, 110, 165, 135, profile.totalEarnings % 200 + 40, profile.totalEarnings % 220 + 20];
  const weeklyDeliveriesData = [6, 8, 5, 9, 7, Math.max(1, Math.round(profile.totalDeliveries / 15)), Math.max(2, Math.round(profile.totalDeliveries / 13))];

  return (
    <div className="space-y-6">
      {/* Toast Notification overlay */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 px-5 py-3.5 bg-brand-orange text-white text-xs font-bold rounded-2xl shadow-xl shadow-brand-orange/20 border border-white/20 animate-bounce flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-white animate-spin" />
          <span>{notification}</span>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Profile Card & Info */}
        <GlassCard className="lg:col-span-1 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-brand-orange-alpha rounded-bl-full pointer-events-none opacity-20"></div>
          
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-extrabold text-white text-lg flex items-center gap-2">
                <User className="w-5 h-5 text-brand-orange" />
                Driver Credentials
              </h3>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={handleToggleOnline}
                  className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase flex items-center gap-1.5 transition-all ${
                    profile.isOnline 
                      ? 'bg-emerald-500/10 border border-emerald-500/25 text-emerald-400' 
                      : 'bg-red-500/10 border border-red-500/25 text-red-400'
                  }`}
                >
                  {profile.isOnline ? (
                    <>
                      <Wifi className="w-3.5 h-3.5" />
                      Online
                    </>
                  ) : (
                    <>
                      <WifiOff className="w-3.5 h-3.5" />
                      Offline
                    </>
                  )}
                </button>
              </div>
            </div>

            {!isEditing ? (
              <div className="space-y-5 text-center flex flex-col items-center">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-brand-orange to-amber-500 rounded-full blur opacity-40 group-hover:opacity-70 transition duration-1000 group-hover:duration-200"></div>
                  <img
                    src={profile.avatar}
                    alt={profile.name}
                    className="relative w-28 h-28 rounded-full object-cover border-2 border-white/20"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256';
                    }}
                  />
                </div>

                <div className="space-y-1">
                  <h4 className="text-xl font-bold text-white tracking-wide">{profile.name}</h4>
                  <p className="text-xs text-white/50 font-semibold tracking-wider uppercase">ID: {profile.driverId}</p>
                </div>

                <div className="w-full grid grid-cols-2 gap-3 pt-3">
                  <div className="bg-white/5 p-3 rounded-xl border border-white/5 text-left">
                    <span className="text-[10px] text-white/40 block font-bold uppercase">Platform</span>
                    <span className="text-sm font-bold text-brand-orange flex items-center gap-1.5 mt-0.5">
                      <Briefcase className="w-3.5 h-3.5" />
                      {profile.platform}
                    </span>
                  </div>
                  <div className="bg-white/5 p-3 rounded-xl border border-white/5 text-left">
                    <span className="text-[10px] text-white/40 block font-bold uppercase">Member Since</span>
                    <span className="text-sm font-bold text-white flex items-center gap-1.5 mt-0.5">
                      <Calendar className="w-3.5 h-3.5 text-white/50" />
                      {profile.memberSince}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                  <label className="text-[10px] text-white/60 block mb-1 font-bold uppercase">Driver Name</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full py-2 px-3 rounded-xl glass-input text-xs"
                    placeholder="Enter full name"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-white/60 block mb-1 font-bold uppercase">Avatar Image URL</label>
                  <input
                    type="url"
                    required
                    value={editAvatar}
                    onChange={(e) => setEditAvatar(e.target.value)}
                    className="w-full py-2 px-3 rounded-xl glass-input text-xs"
                    placeholder="Enter image URL"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-white/60 block mb-1 font-bold uppercase">Primary Platform</label>
                  <select
                    value={editPlatform}
                    onChange={(e) => setEditPlatform(e.target.value as any)}
                    className="w-full py-2 px-3 rounded-xl glass-input text-xs bg-brand-dark"
                  >
                    <option value="DoorDash" className="bg-brand-dark">DoorDash</option>
                    <option value="Uber Eats" className="bg-brand-dark">Uber Eats</option>
                    <option value="Grubhub" className="bg-brand-dark">Grubhub</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-white/60 block mb-1 font-bold uppercase">Registration Date</label>
                  <input
                    type="date"
                    required
                    value={editMemberSince}
                    onChange={(e) => setEditMemberSince(e.target.value)}
                    className="w-full py-2 px-3 rounded-xl glass-input text-xs bg-brand-dark text-white"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="flex-1 py-2 bg-white/5 hover:bg-white/10 text-white font-semibold text-xs rounded-xl transition-all border border-white/10"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className="pt-6 border-t border-white/5 mt-6 flex flex-col gap-2">
            {!isEditing && (
              <button
                onClick={handleStartEdit}
                className="w-full py-2 bg-white/5 hover:bg-white/10 text-white border border-white/15 hover:border-brand-orange/40 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5 text-brand-orange" />
                Edit Profile Info
              </button>
            )}
            <button
              onClick={handleResetData}
              className="w-full py-2 bg-red-950/20 hover:bg-red-950/40 text-red-400 border border-red-500/10 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Statistics
            </button>
          </div>
        </GlassCard>

        {/* Simulation and AI Recommendations Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Simulation Panel */}
          <GlassCard className="border border-brand-orange/30 bg-brand-orange-alpha/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-1 bg-brand-orange/10 border-b border-l border-brand-orange/20 rounded-bl-xl text-[9px] uppercase font-bold text-brand-orange tracking-widest animate-pulse">
              Demo Shift Module
            </div>
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="space-y-1">
                <h3 className="font-extrabold text-white text-base flex items-center gap-2">
                  <Zap className="w-5 h-5 text-brand-orange animate-bounce" />
                  Interactive Shift Simulator
                </h3>
                <p className="text-xs text-white/70">
                  DeliverAI operates in demo mode. Complete active shifts to dynamically increment statistics and achievements.
                </p>
              </div>

              <button
                onClick={handleSimulateDelivery}
                className="w-full md:w-auto px-5 py-3 bg-brand-orange hover:bg-brand-orange-hover text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-brand-orange/25 active:scale-95 flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4 text-white" />
                Simulate Shift Delivery
              </button>
            </div>
          </GlassCard>

          {/* AI Advisor Panel */}
          <GlassCard className="border border-brand-orange/10">
            <h3 className="font-extrabold text-white text-base flex items-center gap-2 border-b border-white/5 pb-3">
              <Sparkles className="w-5 h-5 text-brand-orange" />
              AI Performance Advisor
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              {getAiRecommendations().map((rec, idx) => (
                <div key={idx} className="p-3 bg-white/5 border border-white/5 rounded-xl flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-brand-orange shrink-0 mt-0.5" />
                  <p className="text-[11px] text-white/80 leading-relaxed font-medium">{rec}</p>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Performance Summary Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Deliveries', val: profile.totalDeliveries, sub: '+4 this shift', color: 'text-white' },
          { label: 'Total Earnings', val: `$${profile.totalEarnings.toFixed(2)}`, sub: 'Avg $32.40/hr', color: 'text-brand-orange' },
          { label: 'Distance Driven', val: `${profile.totalDistance} mi`, sub: 'Active GPS tracked', color: 'text-white' },
          { label: 'Avg Delivery Time', val: `${profile.avgDeliveryTime}m`, sub: 'Elite performance', color: 'text-white' },
          { label: 'Customer Rating', val: `${profile.customerRating} ⭐`, sub: 'Top Tier Rating', color: 'text-amber-400 font-bold' },
          { label: 'Acceptance Rate', val: `${profile.acceptanceRate}%`, sub: 'Target: 85%+', color: 'text-emerald-400' },
          { label: 'Completion Rate', val: `${profile.completionRate}%`, sub: 'Excellent status', color: 'text-white' },
          { label: 'On-Time Rate', val: `${profile.onTimeRate}%`, sub: '92% local avg', color: 'text-white' },
        ].map((c, i) => (
          <GlassCard key={i} className="p-4 flex flex-col justify-between min-h-[110px]">
            <span className="text-[10px] font-bold text-white/50 uppercase tracking-wider">{c.label}</span>
            <div className="mt-2">
              <span className={`text-xl md:text-2xl font-extrabold ${c.color}`}>{c.val}</span>
              <span className="text-[9px] text-white/40 block mt-1 font-semibold">{c.sub}</span>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* SVG Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Weekly Earnings Area Chart */}
        <GlassCard className="space-y-4">
          <div className="flex justify-between items-center border-b border-white/5 pb-2">
            <div>
              <h3 className="font-extrabold text-white text-base">Weekly Earnings Trend</h3>
              <p className="text-[10px] text-white/40">Daily profile payouts tracker</p>
            </div>
            <span className="text-xs font-bold text-brand-orange flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              +$${(weeklyEarningsData.reduce((a, b) => a + b, 0)).toFixed(0)} total
            </span>
          </div>

          <div className="h-56 w-full flex items-center justify-center relative">
            <svg viewBox="0 0 500 200" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="earningsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ff6b00" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#ff6b00" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              {/* Gridlines */}
              <line x1="40" y1="20" x2="480" y2="20" stroke="rgba(255,255,255,0.05)" strokeDasharray="3" />
              <line x1="40" y1="70" x2="480" y2="70" stroke="rgba(255,255,255,0.05)" strokeDasharray="3" />
              <line x1="40" y1="120" x2="480" y2="120" stroke="rgba(255,255,255,0.05)" strokeDasharray="3" />
              <line x1="40" y1="170" x2="480" y2="170" stroke="rgba(255,255,255,0.1)" />

              {/* Area path */}
              <path
                d={`M 40 170 
                    L 40 ${170 - (weeklyEarningsData[0] / 200) * 150} 
                    L 113 ${170 - (weeklyEarningsData[1] / 200) * 150} 
                    L 186 ${170 - (weeklyEarningsData[2] / 200) * 150} 
                    L 259 ${170 - (weeklyEarningsData[3] / 200) * 150} 
                    L 332 ${170 - (weeklyEarningsData[4] / 200) * 150} 
                    L 405 ${170 - (weeklyEarningsData[5] / 200) * 150} 
                    L 478 ${170 - (weeklyEarningsData[6] / 200) * 150} 
                    L 478 170 Z`}
                fill="url(#earningsGrad)"
              />

              {/* Line path */}
              <path
                d={`M 40 ${170 - (weeklyEarningsData[0] / 200) * 150} 
                    L 113 ${170 - (weeklyEarningsData[1] / 200) * 150} 
                    L 186 ${170 - (weeklyEarningsData[2] / 200) * 150} 
                    L 259 ${170 - (weeklyEarningsData[3] / 200) * 150} 
                    L 332 ${170 - (weeklyEarningsData[4] / 200) * 150} 
                    L 405 ${170 - (weeklyEarningsData[5] / 200) * 150} 
                    L 478 ${170 - (weeklyEarningsData[6] / 200) * 150}`}
                fill="none"
                stroke="#ff6b00"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Data points */}
              {weeklyEarningsData.map((val, idx) => {
                const cx = 40 + idx * 73;
                const cy = 170 - (val / 200) * 150;
                return (
                  <g key={idx} className="group cursor-pointer">
                    <circle cx={cx} cy={cy} r="6" fill="#ff6b00" stroke="#0f172a" strokeWidth="2" />
                    <circle cx={cx} cy={cy} r="10" fill="#ff6b00" opacity="0" className="hover:opacity-30 transition-opacity" />
                    <text x={cx} y={cy - 12} fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle" opacity="0.8">
                      ${val.toFixed(0)}
                    </text>
                  </g>
                );
              })}

              {/* X Labels */}
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => (
                <text key={idx} x={40 + idx * 73} y="190" fill="rgba(255,255,255,0.4)" fontSize="9" fontWeight="bold" textAnchor="middle">
                  {day}
                </text>
              ))}
            </svg>
          </div>
        </GlassCard>

        {/* Weekly Deliveries Bar Chart */}
        <GlassCard className="space-y-4">
          <div className="flex justify-between items-center border-b border-white/5 pb-2">
            <div>
              <h3 className="font-extrabold text-white text-base">Weekly Deliveries Count</h3>
              <p className="text-[10px] text-white/40">Fulfillment analytics across active days</p>
            </div>
            <span className="text-xs font-bold text-emerald-400">
              {weeklyDeliveriesData.reduce((a, b) => a + b, 0)} Shift Orders
            </span>
          </div>

          <div className="h-56 w-full flex items-center justify-center">
            <svg viewBox="0 0 500 200" className="w-full h-full overflow-visible">
              <line x1="40" y1="20" x2="480" y2="20" stroke="rgba(255,255,255,0.05)" strokeDasharray="3" />
              <line x1="40" y1="70" x2="480" y2="70" stroke="rgba(255,255,255,0.05)" strokeDasharray="3" />
              <line x1="40" y1="120" x2="480" y2="120" stroke="rgba(255,255,255,0.05)" strokeDasharray="3" />
              <line x1="40" y1="170" x2="480" y2="170" stroke="rgba(255,255,255,0.1)" />

              {weeklyDeliveriesData.map((val, idx) => {
                const barWidth = 32;
                const x = 40 + idx * 68 - barWidth / 2;
                const barHeight = (val / 12) * 150;
                const y = 170 - barHeight;
                return (
                  <g key={idx} className="group cursor-pointer">
                    <rect
                      x={x}
                      y={y}
                      width={barWidth}
                      height={barHeight}
                      rx="6"
                      fill={idx === 6 ? '#ff6b00' : 'rgba(255, 107, 0, 0.4)'}
                      className="hover:fill-brand-orange transition-colors"
                    />
                    <text x={40 + idx * 68} y={y - 8} fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">
                      {val}
                    </text>
                  </g>
                );
              })}

              {/* X Labels */}
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => (
                <text key={idx} x={40 + idx * 68} y="190" fill="rgba(255,255,255,0.4)" fontSize="9" fontWeight="bold" textAnchor="middle">
                  {day}
                </text>
              ))}
            </svg>
          </div>
        </GlassCard>

        {/* Circular Gauge Metrics (Success rates) */}
        <GlassCard className="space-y-4">
          <h3 className="font-extrabold text-white text-base border-b border-white/5 pb-2">Shift Delivery Success Metrics</h3>
          <div className="grid grid-cols-2 gap-4 h-48 py-2">
            
            {/* Completion Rate Ring */}
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="relative w-28 h-28 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="56" cy="56" r="42" stroke="rgba(255,255,255,0.05)" strokeWidth="8" fill="transparent" />
                  <circle
                    cx="56"
                    cy="56"
                    r="42"
                    stroke="#ff6b00"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 42}
                    strokeDashoffset={2 * Math.PI * 42 * (1 - profile.completionRate / 100)}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute text-center">
                  <span className="text-xl font-extrabold text-white">{profile.completionRate}%</span>
                  <span className="text-[8px] text-white/40 block font-bold uppercase tracking-wider">Completion</span>
                </div>
              </div>
            </div>

            {/* On-Time Rate Ring */}
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="relative w-28 h-28 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="56" cy="56" r="42" stroke="rgba(255,255,255,0.05)" strokeWidth="8" fill="transparent" />
                  <circle
                    cx="56"
                    cy="56"
                    r="42"
                    stroke="#ff6b00"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 42}
                    strokeDashoffset={2 * Math.PI * 42 * (1 - profile.onTimeRate / 100)}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute text-center">
                  <span className="text-xl font-extrabold text-white">{profile.onTimeRate}%</span>
                  <span className="text-[8px] text-white/40 block font-bold uppercase tracking-wider">On-Time</span>
                </div>
              </div>
            </div>

          </div>
        </GlassCard>

        {/* Customer Rating Trend Line Chart */}
        <GlassCard className="space-y-4">
          <div className="flex justify-between items-center border-b border-white/5 pb-2">
            <div>
              <h3 className="font-extrabold text-white text-base">Customer Rating Trend</h3>
              <p className="text-[10px] text-white/40">Last 5 active delivery shifts</p>
            </div>
            <span className="text-xs font-bold text-amber-400 flex items-center gap-0.5">
              <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400" />
              {profile.customerRating} Average
            </span>
          </div>

          <div className="h-48 w-full flex items-center justify-center">
            <svg viewBox="0 0 500 200" className="w-full h-full overflow-visible">
              <line x1="40" y1="20" x2="480" y2="20" stroke="rgba(255,255,255,0.05)" strokeDasharray="3" />
              <line x1="40" y1="95" x2="480" y2="95" stroke="rgba(255,255,255,0.05)" strokeDasharray="3" />
              <line x1="40" y1="170" x2="480" y2="170" stroke="rgba(255,255,255,0.1)" />

              {/* Dynamic Sparkline rating path */}
              <path
                d="M 50 140 L 150 110 L 250 80 L 350 120 L 450 50"
                fill="none"
                stroke="#ff6b00"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {[4.72, 4.78, 4.85, 4.81, profile.customerRating].map((val, idx) => {
                const cx = 50 + idx * 100;
                const points = [140, 110, 80, 120, 50];
                const cy = points[idx];
                return (
                  <g key={idx}>
                    <circle cx={cx} cy={cy} r="5" fill="#ff6b00" stroke="#0f172a" strokeWidth="2" />
                    <text x={cx} y={cy - 10} fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">
                      {val.toFixed(2)} ⭐
                    </text>
                  </g>
                );
              })}

              {/* X Labels */}
              {['Shift 1', 'Shift 2', 'Shift 3', 'Shift 4', 'Current Shift'].map((label, idx) => (
                <text key={idx} x={50 + idx * 100} y="190" fill="rgba(255,255,255,0.4)" fontSize="9" fontWeight="bold" textAnchor="middle">
                  {label}
                </text>
              ))}
            </svg>
          </div>
        </GlassCard>
      </div>

      {/* Achievements Section */}
      <GlassCard className="space-y-4">
        <h3 className="font-extrabold text-white text-base flex items-center gap-2 border-b border-white/5 pb-3">
          <Award className="w-5 h-5 text-brand-orange" />
          Achievements & Badges
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ACHIEVEMENTS.map(ach => {
            const Icon = ach.icon;
            const isUnlocked = ach.check(profile);
            return (
              <div
                key={ach.id}
                className={`p-4 rounded-xl border flex gap-3 transition-all duration-300 ${
                  isUnlocked
                    ? 'bg-brand-orange-alpha/5 border-brand-orange/30 shadow-md shadow-brand-orange/5'
                    : 'bg-white/[0.02] border-white/5 opacity-40'
                }`}
              >
                <div className={`p-3 rounded-lg flex items-center justify-center shrink-0 ${
                  isUnlocked ? 'bg-brand-orange text-white' : 'bg-white/5 text-white/40'
                }`}>
                  <Icon className="w-6 h-6" />
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-white leading-none">{ach.name}</h4>
                    {isUnlocked ? (
                      <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-emerald-500/20 text-emerald-400 tracking-wider uppercase">Unlocked</span>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-white/10 text-white/50 tracking-wider uppercase">Locked</span>
                    )}
                  </div>
                  <p className="text-[10px] text-white/60 leading-normal">{ach.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </GlassCard>

      {/* Driver Statistics Grid */}
      <GlassCard className="space-y-4">
        <h3 className="font-extrabold text-white text-base flex items-center gap-2 border-b border-white/5 pb-3">
          <Activity className="w-5 h-5 text-brand-orange" />
          Platform Operating Statistics
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { label: 'Total Hours Online', val: `${profile.totalHoursOnline} hrs`, icon: Clock },
            { label: 'Current Streak', val: `${profile.currentStreak} orders`, icon: Flame },
            { label: 'Longest Streak', val: `${profile.longestStreak} orders`, icon: Star },
            { label: 'Best Earnings Day', val: `$${profile.bestEarningsAmount.toFixed(2)}`, icon: DollarSign, date: profile.bestEarningsDay },
            { label: 'Avg Daily Profit', val: `$${profile.avgDailyProfit.toFixed(2)}`, icon: TrendingUp },
          ].map((s, idx) => {
            const Icon = s.icon;
            return (
              <div key={idx} className="bg-white/5 p-4 rounded-xl border border-white/5 flex flex-col justify-between">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[9px] font-bold text-white/40 uppercase tracking-wider">{s.label}</span>
                  <Icon className="w-4 h-4 text-brand-orange shrink-0" />
                </div>
                <div className="mt-2">
                  <span className="text-base font-extrabold text-white block leading-tight">{s.val}</span>
                  {s.date && <span className="text-[8px] text-white/30 font-semibold">{s.date}</span>}
                </div>
              </div>
            );
          })}
        </div>
      </GlassCard>
    </div>
  );
};
