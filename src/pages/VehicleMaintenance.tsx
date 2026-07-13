import React, { useState, useEffect } from 'react';
import { GlassCard } from '../components/GlassCard';
import { 
  Car, 
  Wrench, 
  Calendar, 
  Sparkles, 
  CheckCircle, 
  AlertTriangle, 
  Trash2, 
  FileText, 
  Plus
} from 'lucide-react';

interface MaintenanceRecord {
  id: string;
  date: string;
  type: string;
  cost: number;
  garage: string;
  notes: string;
}

interface DocumentStatus {
  name: string;
  expiryDate: string;
  remainingDays: number;
  status: 'Good' | 'Warning' | 'Critical';
}

interface ToolkitItem {
  id: string;
  label: string;
  checked: boolean;
}

const DEFAULT_HISTORY: MaintenanceRecord[] = [
  { id: 'm-1', date: '2026-06-15', type: 'Oil Change', cost: 65.00, garage: 'Quick Lube Express', notes: 'Synthetic blend oil, oil filter replaced.' },
  { id: 'm-2', date: '2026-05-10', type: 'Brake Service', cost: 240.00, garage: 'Precision Auto Care', notes: 'Replaced front brake pads and resurfaced rotors.' },
  { id: 'm-3', date: '2026-03-22', type: 'Battery Replacement', cost: 135.00, garage: 'AutoZone Service', notes: 'Installed new 12V lead-acid battery with 3-year warranty.' },
  { id: 'm-4', date: '2026-02-14', type: 'Tire Replacement', cost: 380.00, garage: 'Discount Tires & Alignment', notes: 'Replaced rear tires and completed four-wheel alignment.' },
  { id: 'm-5', date: '2026-01-05', type: 'Chain Lubrication', cost: 25.00, garage: 'Self Maintenance', notes: 'Cleaned and applied chain wax.' },
  { id: 'm-6', date: '2025-11-20', type: 'Engine Inspection', cost: 110.00, garage: 'Precision Auto Care', notes: 'Diagnostic check for check engine light; replaced oxygen sensor.' }
];

const DEFAULT_TOOLKIT: ToolkitItem[] = [
  { id: 'spare', label: 'Spare Tire', checked: true },
  { id: 'jack', label: 'Jack', checked: true },
  { id: 'tools', label: 'Tool Kit', checked: false },
  { id: 'firstaid', label: 'First Aid Kit', checked: false },
  { id: 'flashlight', label: 'Flashlight', checked: true },
  { id: 'charger', label: 'Phone Charger', checked: true }
];

const DEFAULT_DOCUMENTS: DocumentStatus[] = [
  { name: 'Insurance Policy', expiryDate: '2026-08-10', remainingDays: 28, status: 'Warning' },
  { name: 'Registration Certificate (RC Book)', expiryDate: '2034-03-12', remainingDays: 2795, status: 'Good' },
  { name: 'Driving License', expiryDate: '2026-07-25', remainingDays: 12, status: 'Critical' },
  { name: 'Pollution Certificate (Emission Test)', expiryDate: '2026-07-28', remainingDays: 15, status: 'Warning' },
  { name: 'Vehicle Warranty', expiryDate: '2027-01-15', remainingDays: 186, status: 'Good' }
];

export const VehicleMaintenance: React.FC = () => {
  const [history, setHistory] = useState<MaintenanceRecord[]>([]);
  const [toolkit, setToolkit] = useState<ToolkitItem[]>([]);
  const [notification, setNotification] = useState<string | null>(null);

  // Form Fields
  const [serviceType, setServiceType] = useState('Oil Change');
  const [customServiceType, setCustomServiceType] = useState('');
  const [serviceDate, setServiceDate] = useState('2026-07-13');
  const [serviceCost, setServiceCost] = useState('');
  const [serviceGarage, setServiceGarage] = useState('');
  const [serviceNotes, setServiceNotes] = useState('');

  // Initial Load
  useEffect(() => {
    const savedHistory = localStorage.getItem('deliverai_guardian_maintenance_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error(e);
        setHistory(DEFAULT_HISTORY);
      }
    } else {
      localStorage.setItem('deliverai_guardian_maintenance_history', JSON.stringify(DEFAULT_HISTORY));
      setHistory(DEFAULT_HISTORY);
    }

    const savedToolkit = localStorage.getItem('deliverai_guardian_toolkit_items');
    if (savedToolkit) {
      try {
        setToolkit(JSON.parse(savedToolkit));
      } catch (e) {
        console.error(e);
        setToolkit(DEFAULT_TOOLKIT);
      }
    } else {
      localStorage.setItem('deliverai_guardian_toolkit_items', JSON.stringify(DEFAULT_TOOLKIT));
      setToolkit(DEFAULT_TOOLKIT);
    }
  }, []);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleAddMaintenance = (e: React.FormEvent) => {
    e.preventDefault();
    const finalType = serviceType === 'Other' ? customServiceType.trim() : serviceType;
    if (!finalType) {
      alert("Please specify a service type.");
      return;
    }
    const parsedCost = parseFloat(serviceCost);
    if (isNaN(parsedCost) || parsedCost < 0) {
      alert("Please enter a valid cost.");
      return;
    }

    const newRecord: MaintenanceRecord = {
      id: `m-${Date.now()}`,
      date: serviceDate,
      type: finalType,
      cost: parsedCost,
      garage: serviceGarage.trim() || 'Self Maintenance',
      notes: serviceNotes.trim() || 'No additional notes.'
    };

    const updated = [newRecord, ...history];
    setHistory(updated);
    localStorage.setItem('deliverai_guardian_maintenance_history', JSON.stringify(updated));

    // Reset Form
    setServiceCost('');
    setServiceGarage('');
    setServiceNotes('');
    setCustomServiceType('');
    showToast(`🔧 Added ${finalType} record successfully!`);
  };

  const handleDeleteRecord = (id: string) => {
    if (window.confirm("Are you sure you want to delete this maintenance record?")) {
      const updated = history.filter(item => item.id !== id);
      setHistory(updated);
      localStorage.setItem('deliverai_guardian_maintenance_history', JSON.stringify(updated));
      showToast("Service log deleted.");
    }
  };

  const handleToggleToolkit = (id: string) => {
    const updated = toolkit.map(item =>
      item.id === id ? { ...item, checked: !item.checked } : item
    );
    setToolkit(updated);
    localStorage.setItem('deliverai_guardian_toolkit_items', JSON.stringify(updated));
    const targetItem = toolkit.find(t => t.id === id);
    if (targetItem) {
      showToast(`${targetItem.label} status updated.`);
    }
  };

  // Cost Analytics Calculations
  const todayRefDate = '2026-07-13';
  const getCosts = () => {
    let today = 0;
    let monthly = 0;
    let yearly = 0;

    history.forEach(item => {
      if (item.date === todayRefDate) {
        today += item.cost;
      }
      
      const itemDate = new Date(item.date);
      // Monthly (July 2026 - month index 6)
      if (itemDate.getFullYear() === 2026 && itemDate.getMonth() === 6) {
        monthly += item.cost;
      }
      
      // Yearly (2026)
      if (itemDate.getFullYear() === 2026) {
        yearly += item.cost;
      }
    });

    const totalLifetime = history.reduce((sum, item) => sum + item.cost, 0);
    const avgMonthly = totalLifetime / 12; // simulated based on records across months

    return { today, monthly, yearly, avgMonthly, totalLifetime };
  };

  const costs = getCosts();

  // AI Health Score Calculator
  const getAiHealthScore = () => {
    let score = 94; // base
    
    // Deduct for document critical status
    const criticalDocs = DEFAULT_DOCUMENTS.filter(doc => doc.status === 'Critical').length;
    score -= criticalDocs * 8;
    
    // Deduct for document warning status
    const warningDocs = DEFAULT_DOCUMENTS.filter(doc => doc.status === 'Warning').length;
    score -= warningDocs * 3;

    // Deduct for unchecked emergency toolkit items
    const uncheckedToolkit = toolkit.filter(t => !t.checked).length;
    score -= uncheckedToolkit * 2;

    const finalScore = Math.max(0, score);
    let statusLabel: 'Excellent' | 'Good' | 'Needs Attention' | 'Critical' = 'Good';
    
    if (finalScore >= 90) statusLabel = 'Excellent';
    else if (finalScore >= 75) statusLabel = 'Good';
    else if (finalScore >= 50) statusLabel = 'Needs Attention';
    else statusLabel = 'Critical';

    return { score: finalScore, label: statusLabel };
  };

  const healthScore = getAiHealthScore();

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 px-5 py-3.5 bg-brand-orange text-white text-xs font-bold rounded-2xl shadow-xl shadow-brand-orange/20 border border-white/20 animate-bounce flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-white animate-spin" />
          <span>{notification}</span>
        </div>
      )}

      {/* Health Gauge & High-level Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Score circular indicator */}
        <GlassCard className="p-5 flex flex-col items-center justify-center text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-brand-orange-alpha rounded-bl-full pointer-events-none opacity-20"></div>
          
          <h3 className="text-xs font-bold text-white/50 uppercase tracking-wider mb-4">AI Vehicle Health Score</h3>
          
          <div className="relative w-36 h-36 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="72" cy="72" r="54" stroke="rgba(255,255,255,0.05)" strokeWidth="10" fill="transparent" />
              <circle
                cx="72"
                cy="72"
                r="54"
                stroke={
                  healthScore.label === 'Excellent' ? '#10b981' :
                  healthScore.label === 'Good' ? '#f59e0b' : '#ef4444'
                }
                strokeWidth="10"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 54}
                strokeDashoffset={2 * Math.PI * 54 * (1 - healthScore.score / 100)}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute text-center">
              <span className="text-3xl font-extrabold text-white">{healthScore.score}</span>
              <span className="text-[10px] text-white/40 block font-bold uppercase tracking-widest mt-0.5">Points</span>
            </div>
          </div>
          
          <div className="mt-4">
            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-extrabold tracking-wider uppercase ${
              healthScore.label === 'Excellent' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
              healthScore.label === 'Good' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
              'bg-red-500/10 text-red-400 border border-red-500/20'
            }`}>
              {healthScore.label}
            </span>
            <p className="text-[10px] text-white/50 mt-2 font-medium">Calculated reactively from component status & files check.</p>
          </div>
        </GlassCard>

        {/* Primary Health Metrics Grid */}
        <div className="lg:col-span-2 space-y-6">
          <GlassCard className="space-y-4">
            <h3 className="font-extrabold text-white text-base flex items-center gap-2 border-b border-white/5 pb-2">
              <Car className="w-5 h-5 text-brand-orange" />
              Vehicle Component Health
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { name: 'Overall Health', value: '88%', status: 'Good', icon: CheckCircle, desc: 'Vehicle safe to drive' },
                { name: 'Engine Status', value: 'Good', status: 'Good', icon: CheckCircle, desc: 'Coolant & pressure OK' },
                { name: 'Battery health', value: '94%', status: 'Good', icon: CheckCircle, desc: '12.8V Cold Cranking' },
                { name: 'Tire Condition', value: 'Warning', status: 'Warning', icon: AlertTriangle, desc: 'Pressure: 28 PSI (Low)' },
                { name: 'Brake pads', value: '5mm', status: 'Warning', icon: AlertTriangle, desc: 'Estimated 15% life left' },
                { name: 'Fuel efficiency', value: '38 mpg', status: 'Good', icon: CheckCircle, desc: 'Optimal mileage' },
                { name: 'Odometer Reading', value: '24,850 mi', status: 'Good', icon: CheckCircle, desc: 'GPS-synced mileage' },
                { name: 'Last Service', value: '2026-06-15', status: 'Good', icon: CheckCircle, desc: 'Quick Lube Service' }
              ].map((c, idx) => {
                const Icon = c.icon;
                return (
                  <div key={idx} className="bg-white/5 p-3 rounded-xl border border-white/5 flex flex-col justify-between min-h-[95px]">
                    <div className="flex justify-between items-start">
                      <span className="text-[9px] text-white/50 font-bold uppercase tracking-wider block">{c.name}</span>
                      <Icon className={`w-3.5 h-3.5 ${
                        c.status === 'Good' ? 'text-emerald-400' :
                        c.status === 'Warning' ? 'text-amber-400' : 'text-red-400'
                      }`} />
                    </div>
                    <span className="text-sm font-extrabold text-white mt-1.5">{c.value}</span>
                    <span className="text-[9px] text-white/30 block leading-snug mt-0.5">{c.desc}</span>
                  </div>
                );
              })}
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Reminders & Calendar Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Service Reminders List */}
        <div className="lg:col-span-2 space-y-6">
          <GlassCard className="space-y-4">
            <h3 className="font-extrabold text-white text-base flex items-center gap-2 border-b border-white/5 pb-2">
              <Wrench className="w-5 h-5 text-brand-orange" />
              Upcoming Service Reminders
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { type: 'Oil Change', due: '2026-07-28', remaining: 15, cost: 65, status: 'Warning' },
                { type: 'Tire Rotation', due: '2026-08-27', remaining: 45, cost: 40, status: 'Good' },
                { type: 'Brake Inspection', due: '2026-07-18', remaining: 5, cost: 120, status: 'Critical' },
                { type: 'Air Filter Change', due: '2026-09-11', remaining: 60, cost: 25, status: 'Good' },
                { type: 'Chain/Belt Check', due: '2026-08-12', remaining: 30, cost: 35, status: 'Warning' },
                { type: 'Coolant Flush', due: '2026-08-07', remaining: 25, cost: 45, status: 'Warning' },
              ].map((s, idx) => (
                <div key={idx} className="bg-white/5 border border-white/5 p-3.5 rounded-xl flex justify-between items-center gap-3">
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-white">{s.type}</h4>
                    <p className="text-[10px] text-white/50">Due Date: {s.due}</p>
                    <span className={`inline-flex px-1.5 py-0.5 text-[8px] font-bold rounded mt-1.5 uppercase ${
                      s.status === 'Critical' ? 'bg-red-500/20 text-red-400' :
                      s.status === 'Warning' ? 'bg-amber-500/25 text-amber-400' :
                      'bg-emerald-500/10 text-emerald-400'
                    }`}>
                      {s.remaining} Days Remaining
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] text-white/40 block">EST. FEE</span>
                    <span className="text-sm font-extrabold text-brand-orange">${s.cost}</span>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Dynamic Service Calendar Mockup */}
        <GlassCard className="space-y-4">
          <h3 className="font-extrabold text-white text-base flex items-center gap-2 border-b border-white/5 pb-2">
            <Calendar className="w-5 h-5 text-brand-orange" />
            Service Calendar
          </h3>

          <div className="bg-white/5 p-3 rounded-xl border border-white/5">
            {/* Calendar header */}
            <div className="flex justify-between items-center text-xs font-bold text-white/80 pb-2 mb-2 border-b border-white/5">
              <span>July 2026</span>
              <span className="text-[9px] font-medium text-white/40">2 Services Scheduled</span>
            </div>
            
            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-white/60">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                <div key={i} className="font-extrabold text-brand-orange pb-1">{d}</div>
              ))}
              
              {/* Dummy cells before July 1 (July 1st is Wednesday) */}
              <div className="py-1.5 opacity-20">28</div>
              <div className="py-1.5 opacity-20">29</div>
              <div className="py-1.5 opacity-20">30</div>
              
              {/* Actual Month Days */}
              {Array.from({ length: 31 }, (_, idx) => {
                const day = idx + 1;
                const isUpcomingReminder = day === 18 || day === 28;
                const isToday = day === 13;
                return (
                  <div 
                    key={idx} 
                    className={`py-1.5 rounded relative ${
                      isToday ? 'bg-brand-orange text-white font-extrabold shadow shadow-brand-orange/30' : 
                      isUpcomingReminder ? 'bg-amber-500/10 border border-amber-500/30 font-bold text-amber-400' :
                      'hover:bg-white/5'
                    }`}
                  >
                    {day}
                    {isUpcomingReminder && (
                      <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-amber-400 animate-ping"></span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="space-y-1.5 text-[10px] text-white/60 pt-1">
            <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-brand-orange"></span> Current Date (July 13)</div>
            <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-amber-400/20 border border-amber-400/40"></span> Upcoming Service Inspection (Brakes: 18th, Oil: 28th)</div>
          </div>
        </GlassCard>
      </div>

      {/* Cost Analytics & Fuel Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Cost summary */}
        <GlassCard className="space-y-4">
          <h3 className="font-extrabold text-white text-base border-b border-white/5 pb-2">Maintenance Cost Analytics</h3>
          
          <div className="space-y-3">
            {[
              { label: "Today's Service cost", val: `$${costs.today.toFixed(2)}`, color: 'text-white' },
              { label: 'Monthly Maintenance Cost (July)', val: `$${costs.monthly.toFixed(2)}`, color: 'text-brand-orange' },
              { label: 'Yearly Total Cost (2026)', val: `$${costs.yearly.toFixed(2)}`, color: 'text-white' },
              { label: 'Average Monthly Cost', val: `$${costs.avgMonthly.toFixed(2)}`, color: 'text-white/70' },
              { label: 'Total Lifetime Maintenance Payouts', val: `$${costs.totalLifetime.toFixed(2)}`, color: 'text-emerald-400' }
            ].map((c, i) => (
              <div key={i} className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
                <span className="text-xs text-white/60 font-semibold">{c.label}</span>
                <span className={`text-sm font-extrabold ${c.color}`}>{c.val}</span>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Fuel Efficiency Widget */}
        <GlassCard className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center border-b border-white/5 pb-2">
            <div>
              <h3 className="font-extrabold text-white text-base">Fuel Efficiency Trend</h3>
              <p className="text-[10px] text-white/40">Average mileage & operational cost index</p>
            </div>
            
            <div className="flex gap-4 text-xs font-bold text-emerald-400">
              <span>Avg: 38 mpg</span>
              <span>$0.09 / mi</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white/5 p-3 rounded-xl border border-white/5">
              <span className="text-[9px] text-white/40 block font-bold uppercase">Avg Mileage</span>
              <span className="text-sm font-extrabold text-white">38.2 mpg</span>
              <span className="text-[9px] text-white/30 block mt-1 font-semibold">Standard highway logs</span>
            </div>
            <div className="bg-white/5 p-3 rounded-xl border border-white/5">
              <span className="text-[9px] text-white/40 block font-bold uppercase">Fuel Consumed</span>
              <span className="text-sm font-extrabold text-white">12.5 gal</span>
              <span className="text-[9px] text-white/30 block mt-1 font-semibold">This active shift week</span>
            </div>
            <div className="bg-white/5 p-3 rounded-xl border border-white/5">
              <span className="text-[9px] text-white/40 block font-bold uppercase">Cost Per Mile</span>
              <span className="text-sm font-extrabold text-brand-orange">$0.091</span>
              <span className="text-[9px] text-white/30 block mt-1 font-semibold">Taxes & toll included</span>
            </div>
          </div>

          {/* SVG Trend Graph */}
          <div className="h-28 w-full pt-2">
            <svg viewBox="0 0 500 100" className="w-full h-full overflow-visible">
              <linearGradient id="fuelGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ff6b00" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#ff6b00" stopOpacity="0.0" />
              </linearGradient>
              <line x1="10" y1="80" x2="490" y2="80" stroke="rgba(255,255,255,0.1)" />
              <path 
                d="M 10 70 L 100 65 L 190 75 L 280 50 L 370 58 L 490 35 L 490 80 L 10 80 Z" 
                fill="url(#fuelGrad)"
              />
              <path 
                d="M 10 70 L 100 65 L 190 75 L 280 50 L 370 58 L 490 35" 
                fill="none" 
                stroke="#ff6b00" 
                strokeWidth="2.5" 
                strokeLinecap="round"
              />
              {[70, 65, 75, 50, 58, 35].map((y, idx) => (
                <circle key={idx} cx={10 + idx * 96} cy={y} r="3.5" fill="#ff6b00" />
              ))}
              {['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'].map((label, idx) => (
                <text key={idx} x={10 + idx * 96} y="95" fill="rgba(255,255,255,0.4)" fontSize="9" fontWeight="bold" textAnchor="middle">
                  {label}
                </text>
              ))}
            </svg>
          </div>
        </GlassCard>
      </div>

      {/* Main Records Log & Forms Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Quick Add Form */}
        <GlassCard className="space-y-4 h-full">
          <div>
            <h3 className="font-extrabold text-white text-base">Quick Add Maintenance</h3>
            <p className="text-[10px] text-white/40">Log vehicle maintenance events to update analytics</p>
          </div>

          <form onSubmit={handleAddMaintenance} className="space-y-4">
            <div>
              <label className="text-[9px] text-white/60 block mb-1 font-bold uppercase">Service Type</label>
              <select
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value)}
                className="w-full py-2 px-3 rounded-xl glass-input text-xs bg-brand-dark"
              >
                <option value="Oil Change">Oil Change</option>
                <option value="Brake Service">Brake Service</option>
                <option value="Battery Replacement">Battery Replacement</option>
                <option value="Tire Replacement">Tire Replacement</option>
                <option value="Chain Lubrication">Chain Lubrication</option>
                <option value="Engine Inspection">Engine Inspection</option>
                <option value="Other">Other (Type Below)</option>
              </select>
            </div>

            {serviceType === 'Other' && (
              <div>
                <label className="text-[9px] text-white/60 block mb-1 font-bold uppercase">Custom Service Name</label>
                <input
                  type="text"
                  required
                  value={customServiceType}
                  onChange={(e) => setCustomServiceType(e.target.value)}
                  placeholder="e.g. Spark Plug Change"
                  className="w-full py-2 px-3 rounded-xl glass-input text-xs"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[9px] text-white/60 block mb-1 font-bold uppercase">Date</label>
                <input
                  type="date"
                  required
                  value={serviceDate}
                  onChange={(e) => setServiceDate(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl glass-input text-xs bg-brand-dark text-white"
                />
              </div>
              
              <div>
                <label className="text-[9px] text-white/60 block mb-1 font-bold uppercase">Cost ($)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={serviceCost}
                  onChange={(e) => setServiceCost(e.target.value)}
                  placeholder="e.g. 50.00"
                  className="w-full py-2 px-3 rounded-xl glass-input text-xs"
                />
              </div>
            </div>

            <div>
              <label className="text-[9px] text-white/60 block mb-1 font-bold uppercase">Garage Name</label>
              <input
                type="text"
                value={serviceGarage}
                onChange={(e) => setServiceGarage(e.target.value)}
                placeholder="e.g. Precision Auto Care"
                className="w-full py-2 px-3 rounded-xl glass-input text-xs"
              />
            </div>

            <div>
              <label className="text-[9px] text-white/60 block mb-1 font-bold uppercase">Service Notes</label>
              <textarea
                value={serviceNotes}
                onChange={(e) => setServiceNotes(e.target.value)}
                placeholder="Details of replacements, diagnostic findings..."
                rows={3}
                className="w-full py-2 px-3 rounded-xl glass-input text-xs bg-brand-dark/50"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-brand-orange hover:bg-brand-orange-hover text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-brand-orange/20 active:scale-95 flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Add Maintenance Record
            </button>
          </form>
        </GlassCard>

        {/* History Table */}
        <GlassCard className="lg:col-span-2 space-y-4">
          <div>
            <h3 className="font-extrabold text-white text-base">Service History Logs</h3>
            <p className="text-[10px] text-white/40">Historical log of recorded services</p>
          </div>

          <div className="overflow-x-auto max-h-[440px] overflow-y-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-xs text-white/50 font-bold uppercase">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Service Type</th>
                  <th className="py-2.5 px-3 text-right">Cost</th>
                  <th className="py-2.5 px-3">Garage / Provider</th>
                  <th className="py-2.5 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs text-white/90">
                {history.map((record) => (
                  <tr key={record.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-3 font-semibold text-white">{record.date}</td>
                    <td className="py-3 px-3">
                      <div>
                        <span className="font-bold text-white">{record.type}</span>
                        <span className="text-[10px] text-white/50 block mt-0.5">{record.notes}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right font-extrabold text-brand-orange">${record.cost.toFixed(2)}</td>
                    <td className="py-3 px-3 text-white/70 font-semibold">{record.garage}</td>
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => handleDeleteRecord(record.id)}
                        className="p-1.5 text-white/40 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                        title="Delete Record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
                {history.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-white/40">
                      No service logs added yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>

      {/* Warranty Documents & Checklist Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Expiry documents */}
        <GlassCard className="lg:col-span-2 space-y-4">
          <div>
            <h3 className="font-extrabold text-white text-base">Warranty & Driver Documents</h3>
            <p className="text-[10px] text-white/40">Regulatory documents and validation certificates</p>
          </div>

          <div className="space-y-3">
            {DEFAULT_DOCUMENTS.map((doc, idx) => (
              <div key={idx} className="p-3 bg-white/5 border border-white/5 rounded-xl flex justify-between items-center gap-3">
                <div className="flex items-center gap-3">
                  <FileText className={`w-5 h-5 ${
                    doc.status === 'Critical' ? 'text-red-400' :
                    doc.status === 'Warning' ? 'text-amber-400' : 'text-white/40'
                  }`} />
                  <div>
                    <h4 className="text-xs font-bold text-white">{doc.name}</h4>
                    <p className="text-[10px] text-white/50">Expires: {doc.expiryDate}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-bold ${
                    doc.status === 'Critical' ? 'bg-red-500/10 text-red-400' :
                    doc.status === 'Warning' ? 'bg-amber-500/10 text-amber-400' :
                    'bg-emerald-500/10 text-emerald-400'
                  }`}>
                    {doc.status === 'Critical' ? `CRITICAL EXPIRY: ${doc.remainingDays} days` :
                     doc.status === 'Warning' ? `Expires in ${doc.remainingDays} days` :
                     'Active / Good'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* AI Recommendations & Emergency Checklist */}
        <div className="space-y-6">
          {/* AI Suggestions Card */}
          <GlassCard className="space-y-4">
            <h3 className="font-extrabold text-white text-base flex items-center gap-2 border-b border-white/5 pb-2">
              <Sparkles className="w-5 h-5 text-brand-orange" />
              AI Maintenance Advisor
            </h3>

            <div className="space-y-3">
              {[
                { text: 'Brake pads appear worn (5mm) and should be inspected within the next 5 days.', color: 'border-red-500/20 bg-red-500/5' },
                { text: 'Fuel efficiency has decreased by 8% this week. Run an air filter check.', color: 'border-amber-500/20 bg-amber-500/5' },
                { text: 'Tire pressure appears low on rear tires. Inflate to 32 PSI.', color: 'border-amber-500/20 bg-amber-500/5' },
                { text: 'Battery health is excellent (94%). Auto-start voltages are stable.', color: 'border-emerald-500/10 bg-emerald-500/5' },
                { text: 'Schedule an oil change in the next 15 days.', color: 'border-white/5 bg-white/[0.02]' }
              ].map((sug, idx) => (
                <div key={idx} className={`p-3 border rounded-xl flex items-start gap-2.5 text-xs text-white/80 leading-relaxed font-semibold ${sug.color}`}>
                  <Sparkles className="w-4 h-4 text-brand-orange shrink-0 mt-0.5" />
                  <span>{sug.text}</span>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Emergency Toolkit Checklist */}
          <GlassCard className="space-y-4">
            <div>
              <h3 className="font-extrabold text-white text-base">Emergency Safety Toolkit</h3>
              <p className="text-[10px] text-white/40">Verify backup gear for shift emergencies</p>
            </div>

            <div className="space-y-2">
              {toolkit.map(item => (
                <label
                  key={item.id}
                  className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors cursor-pointer select-none"
                >
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={() => handleToggleToolkit(item.id)}
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
    </div>
  );
};
