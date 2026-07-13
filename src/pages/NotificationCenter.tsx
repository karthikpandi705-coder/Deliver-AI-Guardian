import React, { useState, useEffect } from 'react';
import { GlassCard } from '../components/GlassCard';
import { 
  Bell, 
  BellOff, 
  CheckCheck, 
  Trash2, 
  Sparkles, 
  Settings2, 
  Navigation, 
  CloudRain, 
  DollarSign, 
  AlertOctagon, 
  Fuel, 
  Zap, 
  MapPin, 
  Volume2, 
  VolumeX,
  ShieldAlert
} from 'lucide-react';

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  category: 'traffic' | 'weather' | 'earnings' | 'ai' | 'emergency' | 'fuel' | 'battery' | 'parking';
  priority: 'low' | 'medium' | 'high' | 'critical';
  time: string;
  timestamp: number;
  read: boolean;
}

export interface NotificationSettings {
  weather: boolean;
  traffic: boolean;
  earnings: boolean;
  ai: boolean;
  emergency: boolean;
  fuel: boolean;
  battery: boolean;
  parking: boolean;
  sound: boolean;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  weather: true,
  traffic: true,
  earnings: true,
  ai: true,
  emergency: true,
  fuel: true,
  battery: true,
  parking: true,
  sound: true,
};

export const INITIAL_MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Heavy traffic detected on Downtown Road',
    description: 'Avoid Downtown Road due to a minor fender bender. Gridlock estimated for the next 20 mins. Re-routing recommended.',
    category: 'traffic',
    priority: 'medium',
    time: '5 mins ago',
    timestamp: Date.now() - 5 * 60 * 1000,
    read: false,
  },
  {
    id: 'notif-2',
    title: 'Rain expected in 20 minutes',
    description: 'AI Guard warning: Local precipitation forecast shows 85% rain probability starting soon. Slow down on curves and prepare wet gear.',
    category: 'weather',
    priority: 'high',
    time: '12 mins ago',
    timestamp: Date.now() - 12 * 60 * 1000,
    read: false,
  },
  {
    id: 'notif-3',
    title: 'AI recommends moving toward the city center',
    description: 'Downtown currently has higher delivery demand. Surge pricing (+ $3.50/delivery) active for the next hour.',
    category: 'ai',
    priority: 'low',
    time: '25 mins ago',
    timestamp: Date.now() - 25 * 60 * 1000,
    read: true,
  },
  {
    id: 'notif-4',
    title: 'Daily earnings goal is almost complete!',
    description: 'You are just $14.20 away from achieving your daily target of $150. One more short delivery should do it.',
    category: 'earnings',
    priority: 'low',
    time: '45 mins ago',
    timestamp: Date.now() - 45 * 60 * 1000,
    read: true,
  },
  {
    id: 'notif-5',
    title: 'Emergency SOS ready',
    description: 'Guardian SOS mode is armed. Your real-time location and dispatcher channels are ready in case of any incidents.',
    category: 'emergency',
    priority: 'critical',
    time: '1 hour ago',
    timestamp: Date.now() - 60 * 60 * 1000,
    read: false,
  },
  {
    id: 'notif-6',
    title: 'Battery level is normal, but watch drain',
    description: 'Active GPS and screen brightness may accelerate battery usage. Keep phone plugged into dashboard charger.',
    category: 'battery',
    priority: 'low',
    time: '2 hours ago',
    timestamp: Date.now() - 120 * 60 * 1000,
    read: true,
  }
];

export const MOCK_POOL = [
  {
    title: '⛽ Fuel level is getting low',
    description: 'Your fuel level is below 20%. Chevron fuel station is located 0.4 miles away with regular at $3.45/gal.',
    category: 'fuel' as const,
    priority: 'high' as const,
  },
  {
    title: '🔋 Battery below 25%',
    description: 'Guardian Alert: Battery level is at 23%. Connect to power or switch to battery-saver mode to avoid losing navigation.',
    category: 'battery' as const,
    priority: 'high' as const,
  },
  {
    title: '🚦 Traffic block on 4th Avenue',
    description: 'Double parking and delivery dropoffs have stalled traffic. Route via Market St to save 4 minutes.',
    category: 'traffic' as const,
    priority: 'medium' as const,
  },
  {
    title: '💰 High surge pricing available nearby',
    description: 'Earnings Surge: Payouts near Central Plaza have increased by $4.00 per delivery. High demand expected for the next 30 mins.',
    category: 'earnings' as const,
    priority: 'medium' as const,
  },
  {
    title: '🌧 Heavy storm warning issued',
    description: 'Flash rain storm expected in 10 minutes. Visibility will be significantly reduced. Guardian recommends seeking brief shelter or driving with extreme caution.',
    category: 'weather' as const,
    priority: 'critical' as const,
  },
  {
    title: '🅿 Parking is easier on Market Street',
    description: 'AI Tip: High turnover of parking spaces reported near Market Street loading zone. Prefer this zone for restaurant pick-ups.',
    category: 'parking' as const,
    priority: 'low' as const,
  },
  {
    title: '🤖 Wait 10 minutes before accepting orders',
    description: 'AI analysis suggests a short break. Restrooms and hydration refilling are available nearby at Starbucks on 3rd Ave.',
    category: 'ai' as const,
    priority: 'low' as const,
  },
  {
    title: '🚨 Extreme Weather Alert',
    description: 'Severe weather advisory. Nearby dispatch zones report heavy delays. Ensure emergency contacts are up-to-date in your Driver Profile.',
    category: 'emergency' as const,
    priority: 'critical' as const,
  }
];

interface NotificationCenterProps {
  notifications: NotificationItem[];
  setNotifications: React.Dispatch<React.SetStateAction<NotificationItem[]>>;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications,
  setNotifications
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [settings, setSettings] = useState<NotificationSettings>(() => {
    const saved = localStorage.getItem('deliverai_notification_settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return DEFAULT_SETTINGS;
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('deliverai_notification_settings', JSON.stringify(settings));
  }, [settings]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
    // Play subtle audio beep if enabled
    if (settings.sound) {
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
        gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.15);
      } catch (e) {
        // AudioContext browser restrictions
      }
    }
  };

  // Category list
  const categories = [
    { name: 'All', id: 'All' },
    { name: 'Traffic', id: 'traffic' },
    { name: 'Weather', id: 'weather' },
    { name: 'Earnings', id: 'earnings' },
    { name: 'AI Recommendations', id: 'ai' },
    { name: 'Emergency', id: 'emergency' },
    { name: 'Fuel Alert', id: 'fuel' },
    { name: 'Battery Alert', id: 'battery' },
    { name: 'Parking', id: 'parking' },
  ];

  // Helper functions
  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => prev.map(notif => {
      if (notif.id === id) {
        const nextState = !notif.read;
        if (nextState) showToast('Marked as read');
        return { ...notif, read: nextState };
      }
      return notif;
    }));
  };

  const handleDelete = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
    showToast('Notification deleted');
  };

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
    showToast('All notifications marked as read');
  };

  const handleClearAll = () => {
    setNotifications([]);
    showToast('All notifications cleared');
  };

  // Toggle settings
  const handleToggleSetting = (key: keyof NotificationSettings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Filter notifications based on Category & User settings
  const filteredNotifications = notifications.filter(notif => {
    // 1. Filter by category click
    if (activeCategory !== 'All' && notif.category !== activeCategory) {
      return false;
    }
    // 2. Filter by user settings toggles
    return settings[notif.category as keyof NotificationSettings] !== false;
  });

  // Stats calculation
  const totalNotifsCount = notifications.length;
  const unreadCount = notifications.filter(n => !n.read).length;
  const highPriorityCount = notifications.filter(n => !n.read && (n.priority === 'high' || n.priority === 'critical')).length;
  const aiRecommendationCount = notifications.filter(n => n.category === 'ai' || n.category === 'parking').length;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'traffic': return <Navigation className="w-4 h-4 text-amber-400" />;
      case 'weather': return <CloudRain className="w-4 h-4 text-blue-400 animate-pulse" />;
      case 'earnings': return <DollarSign className="w-4 h-4 text-emerald-400" />;
      case 'ai': return <Sparkles className="w-4 h-4 text-brand-orange animate-float" />;
      case 'emergency': return <AlertOctagon className="w-4 h-4 text-red-500 animate-pulse" />;
      case 'fuel': return <Fuel className="w-4 h-4 text-amber-500" />;
      case 'battery': return <Zap className="w-4 h-4 text-yellow-400" />;
      case 'parking': return <MapPin className="w-4 h-4 text-purple-400" />;
      default: return <Bell className="w-4 h-4 text-white" />;
    }
  };

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500/20 text-red-400 border border-red-500/30 font-extrabold';
      case 'high': return 'bg-orange-500/20 text-orange-400 border border-orange-500/30';
      case 'medium': return 'bg-amber-500/20 text-amber-400 border border-amber-500/25';
      default: return 'bg-blue-500/20 text-blue-400 border border-blue-500/25';
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 bg-brand-dark-light text-white text-xs font-semibold rounded-xl shadow-xl border border-white/10 flex items-center gap-2 animate-fade-in">
          <Bell className="w-4 h-4 text-brand-orange" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Grid: Left is main flow, Right is settings/AI Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left main notification cards */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Summary Grid Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <GlassCard className="p-4 flex flex-col justify-between min-h-[90px]">
              <span className="text-[10px] font-bold text-white/50 uppercase tracking-wider">Total</span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-2xl font-extrabold text-white">{totalNotifsCount}</span>
                <Bell className="w-4 h-4 text-white/30" />
              </div>
            </GlassCard>

            <GlassCard className="p-4 flex flex-col justify-between min-h-[90px] relative overflow-hidden">
              <span className="text-[10px] font-bold text-white/50 uppercase tracking-wider">Unread</span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-2xl font-extrabold text-brand-orange">{unreadCount}</span>
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-brand-orange animate-ping"></span>
                )}
                <Bell className="w-4 h-4 text-brand-orange/45" />
              </div>
            </GlassCard>

            <GlassCard className="p-4 flex flex-col justify-between min-h-[90px]">
              <span className="text-[10px] font-bold text-white/50 uppercase tracking-wider">High & Critical</span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-2xl font-extrabold text-red-400">{highPriorityCount}</span>
                <ShieldAlert className="w-4 h-4 text-red-500/50" />
              </div>
            </GlassCard>

            <GlassCard className="p-4 flex flex-col justify-between min-h-[90px]">
              <span className="text-[10px] font-bold text-white/50 uppercase tracking-wider">AI Suggestions</span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-2xl font-extrabold text-emerald-400">{aiRecommendationCount}</span>
                <Sparkles className="w-4 h-4 text-emerald-400/50" />
              </div>
            </GlassCard>
          </div>

          {/* Quick Category Filters & Bulk Actions */}
          <GlassCard className="p-4 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex flex-wrap gap-2">
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      activeCategory === cat.id
                        ? 'bg-brand-orange text-white'
                        : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>

              {/* Bulk operations */}
              <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                <button
                  onClick={handleMarkAllRead}
                  disabled={unreadCount === 0}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 disabled:opacity-40 disabled:hover:bg-white/5 border border-white/8 text-white/80 hover:text-white text-xs font-semibold rounded-xl transition-colors"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Mark All Read</span>
                </button>
                <button
                  onClick={handleClearAll}
                  disabled={totalNotifsCount === 0}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 bg-red-950/20 hover:bg-red-950/40 disabled:opacity-40 disabled:hover:bg-red-950/20 border border-red-500/15 hover:border-red-500/25 text-red-400 text-xs font-semibold rounded-xl transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear All</span>
                </button>
              </div>
            </div>
          </GlassCard>

          {/* Notifications Card List Container */}
          <div className="space-y-3">
            {filteredNotifications.length === 0 ? (
              <GlassCard className="p-8 text-center text-white/40 flex flex-col items-center justify-center space-y-3">
                <BellOff className="w-8 h-8 text-white/20" />
                <div>
                  <p className="text-sm font-semibold">No notifications match your current filters.</p>
                  <p className="text-xs text-white/30 mt-1">If alerts are disabled, check your settings in the sidebar panel.</p>
                </div>
              </GlassCard>
            ) : (
              filteredNotifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-4 rounded-2xl border transition-all duration-300 flex items-start gap-4 relative overflow-hidden group ${
                    notif.read 
                      ? 'bg-brand-dark-card border-white/5 opacity-75' 
                      : 'bg-gradient-to-r from-brand-orange-alpha/5 to-white/[0.03] border-brand-orange/20 shadow-md shadow-brand-orange/5'
                  }`}
                >
                  {/* Glowing unread indicator bar */}
                  {!notif.read && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-orange shadow-[0_0_8px_#ff6b00]"></div>
                  )}

                  {/* Icon */}
                  <div className={`p-2.5 rounded-xl shrink-0 ${
                    notif.read ? 'bg-white/5 text-white/50' : 'bg-brand-orange-alpha text-brand-orange'
                  }`}>
                    {getCategoryIcon(notif.category)}
                  </div>

                  {/* Content details */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-sm font-bold text-white truncate max-w-[280px] sm:max-w-md">{notif.title}</h4>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wider ${getPriorityBadgeColor(notif.priority)}`}>
                        {notif.priority}
                      </span>
                      {!notif.read && (
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-orange animate-ping"></span>
                      )}
                    </div>
                    <p className="text-xs text-white/70 leading-relaxed font-medium">{notif.description}</p>
                    <span className="text-[10px] text-white/40 block font-medium">{notif.time}</span>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-1 opacity-80 lg:opacity-0 group-hover:opacity-100 transition-opacity shrink-0 self-center">
                    <button
                      onClick={() => handleMarkAsRead(notif.id)}
                      className={`p-1.5 rounded-lg border transition-all ${
                        notif.read
                          ? 'bg-white/5 border-white/10 text-white/50 hover:text-white'
                          : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/25'
                      }`}
                      title={notif.read ? 'Mark as Unread' : 'Mark as Read'}
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(notif.id)}
                      className="p-1.5 bg-red-950/20 border border-red-500/20 text-red-400 hover:bg-red-500/20 rounded-lg transition-all"
                      title="Delete Notification"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>

        {/* Right Columns: AI recommendation panel & Settings panel */}
        <div className="space-y-6">
          
          {/* AI Guardian Advisor Insights */}
          <GlassCard className="space-y-4 border border-brand-orange/20 bg-brand-orange-alpha/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-1 bg-brand-orange/10 border-b border-l border-brand-orange/20 rounded-bl-xl text-[9px] uppercase font-bold text-brand-orange tracking-widest">
              Live AI
            </div>
            
            <h3 className="font-extrabold text-white text-base flex items-center gap-2 border-b border-white/5 pb-3">
              <Sparkles className="w-5 h-5 text-brand-orange animate-float" />
              AI Recommendation Advisor
            </h3>

            <div className="space-y-3">
              {[
                { text: "Downtown currently has higher delivery demand.", type: "demand" },
                { text: "Wait 10 minutes before accepting another order due to heavy traffic.", type: "delay" },
                { text: "Parking is easier on Market Street.", type: "parking" }
              ].map((item, idx) => (
                <div key={idx} className="p-3 bg-brand-dark-card border border-white/5 rounded-xl flex items-start gap-2.5 hover:border-brand-orange/30 transition-all">
                  <Sparkles className="w-4 h-4 text-brand-orange shrink-0 mt-0.5 animate-pulse" />
                  <p className="text-xs text-white/80 leading-relaxed font-semibold">{item.text}</p>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Notification Alert Settings Panel */}
          <GlassCard className="space-y-4">
            <h3 className="font-extrabold text-white text-base flex items-center justify-between border-b border-white/5 pb-3">
              <span className="flex items-center gap-2">
                <Settings2 className="w-5 h-5 text-brand-orange" />
                Alert Subscriptions
              </span>
              <button 
                onClick={() => setSettings(DEFAULT_SETTINGS)} 
                className="text-[10px] text-white/50 hover:text-brand-orange font-bold uppercase transition-colors"
              >
                Reset
              </button>
            </h3>

            <div className="space-y-3">
              {[
                { name: 'Weather Alerts', key: 'weather' as const, desc: 'Severe storm, rain, wind condition warning warnings.' },
                { name: 'Traffic Alerts', key: 'traffic' as const, desc: 'Real-time bottleneck detours and road blocker tips.' },
                { name: 'Earnings Alerts', key: 'earnings' as const, desc: 'Surge availability and target goals updates.' },
                { name: 'AI Recommendation Alerts', key: 'ai' as const, desc: 'Intelligent breaks and demand hotspots guidance.' },
                { name: 'Emergency Alerts', key: 'emergency' as const, desc: 'SOS system monitoring and hospital routes.' },
                { name: 'Fuel Alerts', key: 'fuel' as const, desc: 'Smart gas station location recommendations.' },
                { name: 'Battery Alerts', key: 'battery' as const, desc: 'High discharge and charge notifications.' },
                { name: 'Parking Alerts', key: 'parking' as const, desc: 'Loading zones and free spot locator tips.' },
              ].map(opt => (
                <div key={opt.key} className="flex items-start justify-between gap-4 p-2 hover:bg-white/[0.02] rounded-xl transition-all">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-white block">{opt.name}</span>
                    <span className="text-[10px] text-white/40 block leading-tight">{opt.desc}</span>
                  </div>

                  <button
                    onClick={() => handleToggleSetting(opt.key)}
                    className={`w-10 h-6 rounded-full p-1 transition-colors duration-300 relative shrink-0 ${
                      settings[opt.key] ? 'bg-brand-orange' : 'bg-white/10'
                    }`}
                  >
                    <span className={`block w-4 h-4 rounded-full bg-white transition-transform duration-300 ${
                      settings[opt.key] ? 'translate-x-4' : 'translate-x-0'
                    }`}></span>
                  </button>
                </div>
              ))}

              <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-4 p-2">
                <div className="flex items-center gap-2">
                  {settings.sound ? (
                    <Volume2 className="w-4 h-4 text-brand-orange" />
                  ) : (
                    <VolumeX className="w-4 h-4 text-white/45" />
                  )}
                  <span className="text-xs font-bold text-white">Audio Chime Beeps</span>
                </div>
                <button
                  onClick={() => handleToggleSetting('sound')}
                  className={`w-10 h-6 rounded-full p-1 transition-colors duration-300 relative shrink-0 ${
                    settings.sound ? 'bg-brand-orange' : 'bg-white/10'
                  }`}
                >
                  <span className={`block w-4 h-4 rounded-full bg-white transition-transform duration-300 ${
                    settings.sound ? 'translate-x-4' : 'translate-x-0'
                  }`}></span>
                </button>
              </div>
            </div>
          </GlassCard>

        </div>

      </div>
    </div>
  );
};
