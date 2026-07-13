import React, { useState, useEffect } from 'react';
import { GlassCard } from '../components/GlassCard';
import { 
  Calendar, 
  Clock, 
  CloudRain, 
  Thermometer, 
  Activity, 
  TrendingUp, 
  DollarSign, 
  Navigation, 
  Coffee, 
  BatteryCharging, 
  Award, 
  Sparkles,
  ChevronRight,
  Shield,
  Lightbulb
} from 'lucide-react';

interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
}

interface DeliveryZone {
  name: string;
  demand: 'Extreme' | 'High' | 'Moderate' | 'Low';
  avgEarnings: number;
  traffic: 'Heavy' | 'Moderate' | 'Low';
  distance: string;
  risk: 'Low' | 'Medium' | 'High';
  eta: string;
}

const DEFAULT_CHECKLIST: ChecklistItem[] = [
  { id: 'phone', label: 'Phone Charged', checked: true },
  { id: 'fuel', label: 'Fuel Filled', checked: false },
  { id: 'vehicle', label: 'Vehicle Check', checked: true },
  { id: 'water', label: 'Water Bottle', checked: false },
  { id: 'powerbank', label: 'Power Bank', checked: false },
  { id: 'raingear', label: 'Rain Gear', checked: true },
  { id: 'documents', label: 'Documents & ID', checked: true },
];

const RECOMMENDED_ZONES: DeliveryZone[] = [
  { name: 'Downtown Core', demand: 'Extreme', avgEarnings: 32.50, traffic: 'Heavy', distance: '1.2 mi', risk: 'Low', eta: '8 mins' },
  { name: 'Tech Park', demand: 'High', avgEarnings: 29.00, traffic: 'Moderate', distance: '2.1 mi', risk: 'Low', eta: '9 mins' },
  { name: 'University District', demand: 'High', avgEarnings: 27.20, traffic: 'Moderate', distance: '1.8 mi', risk: 'Low', eta: '7 mins' },
  { name: 'Westside Suburbs', demand: 'Moderate', avgEarnings: 24.00, traffic: 'Low', distance: '3.5 mi', risk: 'Low', eta: '12 mins' },
  { name: 'North Heights', demand: 'Moderate', avgEarnings: 22.50, traffic: 'Low', distance: '5.2 mi', risk: 'Low', eta: '18 mins' },
  { name: 'Harbor Marina', demand: 'Low', avgEarnings: 19.00, traffic: 'Low', distance: '4.8 mi', risk: 'Medium', eta: '15 mins' }
];

export const ShiftAssistant: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [targetEarnings, setTargetEarnings] = useState<number>(150);
  const [completedEarnings, setCompletedEarnings] = useState<number>(142.80);
  const [notification, setNotification] = useState<string | null>(null);

  // Sync Clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Fetch checklist from localStorage
  useEffect(() => {
    const savedChecklist = localStorage.getItem('deliverai_guardian_checklist_items');
    if (savedChecklist) {
      try {
        setChecklist(JSON.parse(savedChecklist));
      } catch (e) {
        console.error("Failed to load checklist", e);
        setChecklist(DEFAULT_CHECKLIST);
      }
    } else {
      localStorage.setItem('deliverai_guardian_checklist_items', JSON.stringify(DEFAULT_CHECKLIST));
      setChecklist(DEFAULT_CHECKLIST);
    }

    // Try to sync completed earnings from driver profile if it exists
    const savedProfile = localStorage.getItem('deliverai_guardian_driver_profile');
    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile);
        if (parsed.totalEarnings) {
          // Take active shift portion (e.g. modulo 200 or custom fraction for realistic daily target)
          const simulatedDailyProgress = parseFloat((parsed.totalEarnings % 180 + 30).toFixed(2));
          setCompletedEarnings(simulatedDailyProgress);
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleToggleChecklist = (id: string) => {
    const updated = checklist.map(item => 
      item.id === id ? { ...item, checked: !item.checked } : item
    );
    setChecklist(updated);
    localStorage.setItem('deliverai_guardian_checklist_items', JSON.stringify(updated));
    
    const targetItem = checklist.find(item => item.id === id);
    if (targetItem) {
      showToast(`${targetItem.label} marked as ${!targetItem.checked ? 'Completed' : 'Pending'}`);
    }
  };

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleUpdateTarget = (val: string) => {
    const num = parseFloat(val);
    if (!isNaN(num) && num > 0) {
      setTargetEarnings(num);
    }
  };

  const progressPercent = Math.min(100, Math.round((completedEarnings / targetEarnings) * 100));
  const remainingEarnings = Math.max(0, targetEarnings - completedEarnings);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 px-5 py-3.5 bg-brand-orange text-white text-xs font-bold rounded-2xl shadow-xl shadow-brand-orange/20 border border-white/20 animate-bounce flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-white animate-spin" />
          <span>{notification}</span>
        </div>
      )}

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Column 1: Shift Overview & Predictions */}
        <div className="space-y-6 lg:col-span-2">
          
          {/* Shift Overview Widget */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <GlassCard className="flex flex-col justify-between p-5 relative overflow-hidden min-h-[170px]">
              <div className="absolute top-0 right-0 w-20 h-20 bg-brand-orange-alpha rounded-bl-full pointer-events-none opacity-20"></div>
              <div>
                <div className="flex justify-between items-start">
                  <span className="text-[10px] text-white/50 uppercase font-bold tracking-wider block">Today's Schedule</span>
                  <Calendar className="w-4 h-4 text-brand-orange" />
                </div>
                <h3 className="text-2xl font-extrabold text-white mt-2">
                  {currentTime.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
                </h3>
                <div className="flex items-center gap-1.5 text-xs text-white/70 mt-1">
                  <Clock className="w-3.5 h-3.5 text-brand-orange" />
                  <span>Shift Active Clock: {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
              <div className="pt-4 border-t border-white/5 flex gap-4 text-xs">
                <div>
                  <span className="text-[9px] text-white/40 block">WEATHER</span>
                  <span className="font-semibold text-white flex items-center gap-1">
                    <CloudRain className="w-3 h-3 text-blue-400" />
                    Cloudy, Drizzle
                  </span>
                </div>
                <div>
                  <span className="text-[9px] text-white/40 block">TEMPERATURE</span>
                  <span className="font-semibold text-white flex items-center gap-1">
                    <Thermometer className="w-3 h-3 text-brand-orange" />
                    68°F (Feels 65°F)
                  </span>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="flex flex-col justify-between p-5 min-h-[170px]">
              <div>
                <span className="text-[10px] text-white/50 uppercase font-bold tracking-wider block">Live Surrounding Metrics</span>
                <div className="grid grid-cols-2 gap-4 mt-3">
                  <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                    <span className="text-[9px] text-white/40 block">TRAFFIC LEVEL</span>
                    <span className="text-sm font-bold text-amber-400 flex items-center gap-1.5 mt-0.5">
                      <Activity className="w-3.5 h-3.5" />
                      Moderate
                    </span>
                  </div>
                  <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                    <span className="text-[9px] text-white/40 block">SURGE FACTOR</span>
                    <span className="text-sm font-bold text-emerald-400 flex items-center gap-1.5 mt-0.5">
                      <TrendingUp className="w-3.5 h-3.5" />
                      1.5x Boost
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-[10px] text-emerald-400 font-semibold mt-3 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                Peak surge timings active in commercial core zones.
              </div>
            </GlassCard>
          </div>

          {/* AI Shift Predictions Grid */}
          <GlassCard className="space-y-4">
            <h3 className="font-extrabold text-white text-base flex items-center gap-2 border-b border-white/5 pb-3">
              <Sparkles className="w-5 h-5 text-brand-orange animate-float" />
              AI Shift Performance Predictions
            </h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Estimated Earnings', val: '$160.00', sub: 'Target Match', icon: DollarSign, color: 'text-brand-orange' },
                { label: 'Estimated Orders', val: '10–12', sub: 'High Match Rate', icon: Navigation, color: 'text-white' },
                { label: 'Expected Distance', val: '45.2 mi', sub: 'Eco route plan', icon: Activity, color: 'text-white' },
                { label: 'Est. Fuel Costs', val: '$14.50', sub: '$3.45 / gal', icon: Activity, color: 'text-white' },
                { label: 'Est. Battery Use', val: '45%', sub: 'EV Phone health', icon: BatteryCharging, color: 'text-white' },
                { label: 'Expected Duration', val: '6.5 hrs', sub: 'End: 9:30 PM', icon: Clock, color: 'text-white' },
                { label: 'Completion Probability', val: '96%', sub: 'High reliability', icon: Shield, color: 'text-emerald-400' },
                { label: 'Active Multiplier', val: '1.45x', sub: 'Avg boost factor', icon: TrendingUp, color: 'text-brand-orange' },
              ].map((p, idx) => {
                const Icon = p.icon;
                return (
                  <div key={idx} className="bg-white/5 p-3 rounded-xl border border-white/5 flex flex-col justify-between min-h-[90px]">
                    <span className="text-[9px] text-white/40 font-bold uppercase tracking-wider block">{p.label}</span>
                    <div className="mt-1 flex items-baseline justify-between">
                      <span className={`text-base font-extrabold ${p.color}`}>{p.val}</span>
                      <Icon className="w-3.5 h-3.5 text-white/20" />
                    </div>
                    <span className="text-[9px] text-white/30 block mt-0.5">{p.sub}</span>
                  </div>
                );
              })}
            </div>
          </GlassCard>

          {/* Best Working Hours Timeline */}
          <GlassCard className="space-y-4">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <div>
                <h3 className="font-extrabold text-white text-base">Best Working Hours Timeline</h3>
                <p className="text-[10px] text-white/40">Hourly demand index forecast for today</p>
              </div>
              <span className="text-[10px] font-bold text-brand-orange bg-brand-orange-alpha/10 px-2 py-0.5 rounded border border-brand-orange/20">
                Peak Profit Period
              </span>
            </div>

            {/* Timeline Graphic */}
            <div className="pt-6 pb-2">
              <div className="h-5 w-full bg-white/5 rounded-full relative flex overflow-hidden border border-white/10">
                {/* Morning Rush */}
                <div className="h-full bg-amber-500/30 border-r border-amber-500/20" style={{ width: '18.75%' }} title="Morning Rush: 6AM-9AM"></div>
                {/* Midday Standard */}
                <div className="h-full bg-transparent border-r border-white/5" style={{ width: '15.625%' }}></div>
                {/* Lunch Rush */}
                <div className="h-full bg-brand-orange/50 border-r border-brand-orange/25" style={{ width: '15.625%' }} title="Lunch Rush: 11:30AM-2PM"></div>
                {/* Afternoon lull */}
                <div className="h-full bg-transparent border-r border-white/5" style={{ width: '21.875%' }}></div>
                {/* Evening Rush */}
                <div className="h-full bg-red-500/50 border-r border-red-500/25" style={{ width: '15.625%' }} title="Evening Rush: 5:30PM-8PM"></div>
                {/* Night Surge */}
                <div className="h-full bg-emerald-500/40" style={{ width: '12.5%' }} title="Night Surge: 8PM-10PM"></div>
              </div>

              {/* Timeline Label Intervals */}
              <div className="flex justify-between text-[10px] text-white/40 mt-2 font-bold px-1">
                <span>6 AM</span>
                <span>9 AM</span>
                <span>12 PM</span>
                <span>3 PM</span>
                <span>6 PM</span>
                <span>8 PM</span>
                <span>10 PM</span>
              </div>
            </div>

            {/* Timings breakdown highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                <span className="text-[8px] font-bold text-amber-400 block uppercase">Morning Rush (6AM-9AM)</span>
                <span className="text-xs font-semibold text-white">Moderate Surge: +$1.50</span>
              </div>
              <div className="p-2.5 bg-brand-orange-alpha/10 border border-brand-orange/20 rounded-xl">
                <span className="text-[8px] font-bold text-brand-orange block uppercase">Lunch Rush (11:30AM-2PM)</span>
                <span className="text-xs font-semibold text-white">High Surge: +$3.00</span>
              </div>
              <div className="p-2.5 bg-red-500/10 border border-red-500/20 rounded-xl">
                <span className="text-[8px] font-bold text-red-400 block uppercase">Evening Rush (5:30PM-8PM)</span>
                <span className="text-xs font-semibold text-white">Max Surge: +$4.50</span>
              </div>
              <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                <span className="text-[8px] font-bold text-emerald-400 block uppercase">Night Surge (8PM-10PM)</span>
                <span className="text-xs font-semibold text-white">High Demand: +$2.00</span>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Column 2: Motivation Widget & Smart Checklist */}
        <div className="space-y-6">
          
          {/* Motivation Widget */}
          <GlassCard className="p-5 flex flex-col justify-between border border-brand-orange/20 bg-gradient-to-b from-brand-orange-alpha/10 to-brand-dark relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-brand-orange-alpha rounded-bl-full pointer-events-none opacity-20"></div>
            <div>
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Driver Level: Gold Partner</h4>
                <Award className="w-4 h-4 text-brand-orange" />
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-2xl font-extrabold text-white">Level 12</span>
                <span className="text-xs text-white/50">2,450 / 3,000 XP</span>
              </div>
              <div className="h-1.5 w-full bg-white/10 rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-brand-orange" style={{ width: '81.6%' }}></div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-white/5">
                <div>
                  <span className="text-[9px] text-white/40 block font-semibold uppercase">Total Coins</span>
                  <span className="text-sm font-bold text-white">🪙 340 Coins</span>
                </div>
                <div>
                  <span className="text-[9px] text-white/40 block font-semibold uppercase">Active Streak</span>
                  <span className="text-sm font-bold text-brand-orange">🔥 8 Days</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/5 italic text-[11px] text-white/70 leading-relaxed">
              "Every delivery is a step closer to your goal. Stay safe out there!"
            </div>
          </GlassCard>

          {/* Daily Goal Card */}
          <GlassCard className="space-y-4">
            <div>
              <h3 className="font-extrabold text-white text-base">Daily Earnings Goal</h3>
              <p className="text-[10px] text-white/40">Adjust your target to update remaining payouts</p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[9px] text-white/60 block mb-1 font-bold uppercase">Target Earnings ($)</label>
                <input
                  type="number"
                  value={targetEarnings}
                  onChange={(e) => handleUpdateTarget(e.target.value)}
                  className="w-full py-1.5 px-3 rounded-lg glass-input text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs bg-white/[0.02] p-3 rounded-xl border border-white/5">
                <div>
                  <span className="text-white/50 block text-[9px] font-bold uppercase">Completed</span>
                  <span className="text-sm font-bold text-emerald-400">${completedEarnings.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-white/50 block text-[9px] font-bold uppercase">Remaining</span>
                  <span className="text-sm font-bold text-white">${remainingEarnings.toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-white/70">
                  <span>Goal Progress</span>
                  <span>{progressPercent}%</span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-brand-orange" 
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Smart Checklist Card */}
          <GlassCard className="space-y-4">
            <div>
              <h3 className="font-extrabold text-white text-base">Pre-Shift Smart Checklist</h3>
              <p className="text-[10px] text-white/40">Verify checklist items to ensure a secure shift</p>
            </div>

            <div className="space-y-2">
              {checklist.map(item => (
                <label
                  key={item.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors cursor-pointer select-none"
                >
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={() => handleToggleChecklist(item.id)}
                    className="w-4 h-4 rounded text-brand-orange border-white/10 bg-brand-dark/50 accent-brand-orange cursor-pointer"
                  />
                  <span className={`text-xs font-semibold ${item.checked ? 'text-white/40 line-through' : 'text-white/95'}`}>
                    {item.label}
                  </span>
                </label>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Recommendations & Zones Showcase Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recommended Zones */}
        <GlassCard className="lg:col-span-2 space-y-4">
          <div>
            <h3 className="font-extrabold text-white text-base">Recommended Delivery Zones</h3>
            <p className="text-[10px] text-white/40">AI-ranked hot spot recommendations based on live demand data</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[500px]">
              <thead>
                <tr className="border-b border-white/10 text-xs text-white/50 font-bold uppercase">
                  <th className="py-2.5 px-3">Zone</th>
                  <th className="py-2.5 px-3 text-center">Demand</th>
                  <th className="py-2.5 px-3 text-right">Avg Earnings</th>
                  <th className="py-2.5 px-3 text-center">Traffic</th>
                  <th className="py-2.5 px-3 text-center">Distance</th>
                  <th className="py-2.5 px-3 text-center">Risk</th>
                  <th className="py-2.5 px-3 text-center">ETA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs text-white/90">
                {RECOMMENDED_ZONES.map((zone, idx) => (
                  <tr key={idx} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-3 font-semibold text-white flex items-center gap-1.5">
                      <ChevronRight className="w-3.5 h-3.5 text-brand-orange" />
                      {zone.name}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${
                        zone.demand === 'Extreme' ? 'bg-red-500/20 text-red-400' :
                        zone.demand === 'High' ? 'bg-brand-orange-alpha/25 text-brand-orange' :
                        zone.demand === 'Moderate' ? 'bg-amber-400/10 text-amber-400' : 'bg-white/10 text-white/50'
                      }`}>
                        {zone.demand}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-white">${zone.avgEarnings.toFixed(2)}/hr</td>
                    <td className="py-3 px-3 text-center font-medium">
                      <span className={`${zone.traffic === 'Heavy' ? 'text-red-400' : zone.traffic === 'Moderate' ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {zone.traffic}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center text-white/70">{zone.distance}</td>
                    <td className="py-3 px-3 text-center">
                      <span className={`inline-flex px-1.5 py-0.5 rounded text-[9px] font-semibold ${zone.risk === 'Low' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                        {zone.risk} Index
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-brand-orange">{zone.eta}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>

        {/* AI Recommendations & Break Planner */}
        <div className="space-y-6">
          {/* AI Suggestions Card */}
          <GlassCard className="space-y-4">
            <h3 className="font-extrabold text-white text-base flex items-center gap-2 border-b border-white/5 pb-2">
              <Lightbulb className="w-5 h-5 text-brand-orange" />
              Smart Recommendations
            </h3>

            <div className="space-y-3">
              {[
                { text: 'Go online before 11:30 AM to catch lunch surge.', color: 'border-brand-orange/20 bg-brand-orange-alpha/5' },
                { text: 'Avoid Downtown route detours between 5 PM and 6 PM due to gridlock.', color: 'border-amber-500/20 bg-amber-500/5' },
                { text: 'Fuel prices are lower in the northern zone. Shell on 8th is $3.38/gal.', color: 'border-white/5 bg-white/[0.02]' }
              ].map((sug, idx) => (
                <div key={idx} className={`p-3 border rounded-xl flex items-start gap-2.5 text-xs text-white/80 leading-relaxed font-semibold ${sug.color}`}>
                  <Sparkles className="w-4 h-4 text-brand-orange shrink-0 mt-0.5" />
                  <span>{sug.text}</span>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Break Planner Card */}
          <GlassCard className="space-y-4">
            <h3 className="font-extrabold text-white text-base flex items-center gap-2 border-b border-white/5 pb-2">
              <Coffee className="w-5 h-5 text-brand-orange" />
              Shift Break Scheduler
            </h3>

            <div className="space-y-3">
              {[
                { type: 'Best Lunch Break', time: '1:30 PM', spot: 'Central Food Court', note: 'Recommended as surge index slows down.' },
                { type: 'Best Tea Break', time: '4:15 PM', spot: 'Cafe Delight', note: 'Quick recharge window prior to evening rush.' },
                { type: 'Best Fuel Stop', time: '9:00 PM', spot: 'Shell Park Ave', note: 'Lowest fuel rates located on route.' },
              ].map((br, idx) => (
                <div key={idx} className="p-3 bg-white/5 border border-white/5 rounded-xl flex items-start gap-3 text-xs">
                  <div className="p-2 rounded-lg bg-brand-orange-alpha/10 text-brand-orange mt-0.5">
                    <Coffee className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex justify-between items-center w-full">
                      <h4 className="font-extrabold text-white text-xs">{br.type}</h4>
                      <span className="text-[10px] font-bold text-brand-orange">{br.time}</span>
                    </div>
                    <span className="text-[10px] text-white/70 font-semibold block mt-0.5">Location: {br.spot}</span>
                    <p className="text-[9px] text-white/40 mt-1 leading-snug">{br.note}</p>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};
