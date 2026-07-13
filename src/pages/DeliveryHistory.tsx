import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Clock, 
  CheckCircle, 
  MapPin, 
  Star, 
  Printer, 
  Download, 
  ChevronRight, 
  X, 
  ArrowUpDown, 
  Sparkles
} from 'lucide-react';
import { GlassCard } from '../components/GlassCard';

export interface DeliveryRecord {
  id: string;
  customerName: string;
  platform: 'DoorDash' | 'Uber Eats' | 'Grubhub';
  pickupAddress: string;
  deliveryAddress: string;
  earnings: number;
  earningsBreakdown: {
    base: number;
    tip: number;
    bonus: number;
  };
  distance: number; // in miles
  deliveryTime: number; // in minutes
  rating: number; // 1-5 stars
  feedback: string;
  status: 'Delivered' | 'Cancelled' | 'Delayed';
  date: string; // YYYY-MM-DD
  notes: string;
}

const PLATFORMS: ('DoorDash' | 'Uber Eats' | 'Grubhub')[] = ['DoorDash', 'Uber Eats', 'Grubhub'];

const CUSTOMERS = [
  'Michael Scott', 'Dwight Schrute', 'Jim Halpert', 'Pam Beesly', 'Angela Martin',
  'Kevin Malone', 'Oscar Martinez', 'Stanley Hudson', 'Phyllis Vance', 'Ryan Howard',
  'Kelly Kapoor', 'Toby Flenderson', 'Creed Bratton', 'Meredith Palmer', 'Andy Bernard',
  'Erin Hannon', 'Jan Levinson', 'Roy Anderson', 'David Wallace', 'Karen Filippelli'
];

const RESTAURANTS = [
  'Grill House Burgers', 'Sushi Zen', 'Taco Express', 'Bella Italia Pasta', 'Golden Dragon',
  'Green Garden Salad', 'Pizza Hut Express', 'Subway Station', 'Starbucks Café', 'Waffle Kingdom'
];

const STREETS = [
  'Pine St', 'Oak Ave', 'Maple Dr', 'Cedar Rd', 'Elm Blvd', 'Broadway', 'Park Ln',
  'Washington St', 'Second Ave', 'Market Rd', 'Alleyway 4', 'Lakeview Terrace'
];

const FEEDBACK_GOOD = [
  'Fast delivery!', 'Super friendly driver, food was piping hot!', 'Brilliant service.',
  'Left food exactly where requested.', 'Quick and polite!', 'Thank you so much!', 'Excellent timing.'
];

const FEEDBACK_BAD = [
  'A bit late, but food was okay.', 'Driver was lost for a minute.',
  'Drinks were slightly spilled.', 'Food could have been warmer.', 'Okay experience.'
];

// Helper to generate mock data
const generateMockDeliveries = (): DeliveryRecord[] => {
  const list: DeliveryRecord[] = [];
  const today = new Date();
  
  for (let i = 0; i < 50; i++) {
    const dateObj = new Date();
    dateObj.setDate(today.getDate() - Math.floor(Math.random() * 30));
    const dateString = dateObj.toISOString().split('T')[0];

    const platform = PLATFORMS[Math.floor(Math.random() * PLATFORMS.length)];
    
    // Status probability: 90% Delivered, 6% Delayed, 4% Cancelled
    const randStatus = Math.random();
    const status = randStatus < 0.90 ? 'Delivered' : randStatus < 0.96 ? 'Delayed' : 'Cancelled';

    const base = Math.round((3 + Math.random() * 6) * 100) / 100;
    // Cancelled orders have no tips or bonuses usually
    const tip = status === 'Cancelled' ? 0 : Math.round((2 + Math.random() * 18) * 100) / 100;
    const bonus = status === 'Cancelled' ? 0 : Math.random() > 0.6 ? Math.round((1.5 + Math.random() * 4) * 100) / 100 : 0;
    const earnings = Math.round((base + tip + bonus) * 100) / 100;

    const rating = status === 'Cancelled' ? 0 : Math.random() > 0.9 ? Math.floor(Math.random() * 2) + 2 : Math.floor(Math.random() * 2) + 4;
    
    let feedback = '—';
    if (status === 'Delivered') {
      feedback = rating >= 4 
        ? FEEDBACK_GOOD[Math.floor(Math.random() * FEEDBACK_GOOD.length)]
        : FEEDBACK_BAD[Math.floor(Math.random() * FEEDBACK_BAD.length)];
    } else if (status === 'Cancelled') {
      feedback = 'Order cancelled by customer before dispatch.';
    } else {
      feedback = 'Delayed due to restaurant rush.';
    }

    const distance = Math.round((1 + Math.random() * 9.5) * 10) / 10;
    const deliveryTime = status === 'Cancelled' ? 0 : Math.floor(distance * (8 + Math.random() * 5)) + 4;

    list.push({
      id: `DEL-${10000 + i}`,
      customerName: CUSTOMERS[Math.floor(Math.random() * CUSTOMERS.length)],
      platform,
      pickupAddress: `${RESTAURANTS[Math.floor(Math.random() * RESTAURANTS.length)]}, ${100 + Math.floor(Math.random() * 800)} Broadway`,
      deliveryAddress: `${100 + Math.floor(Math.random() * 900)} ${STREETS[Math.floor(Math.random() * STREETS.length)]}, Apt ${1 + Math.floor(Math.random() * 12)}`,
      earnings,
      earningsBreakdown: { base, tip, bonus },
      distance,
      deliveryTime,
      rating,
      feedback,
      status,
      date: dateString,
      notes: status === 'Cancelled' 
        ? 'Customer cancelled. Received base pay compensation.' 
        : status === 'Delayed'
        ? 'Heavy construction on 5th Ave caused routing delays.'
        : 'Smooth delivery, handed directly to customer.'
    });
  }

  // Sort by date descending
  return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const DeliveryHistory: React.FC = () => {
  const [deliveries, setDeliveries] = useState<DeliveryRecord[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<DeliveryRecord | null>(null);
  
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [sortBy, setSortBy] = useState<string>('date-desc');

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('deliverai_delivery_history');
    if (saved) {
      try {
        setDeliveries(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse delivery history from localStorage', e);
        const fresh = generateMockDeliveries();
        setDeliveries(fresh);
        localStorage.setItem('deliverai_delivery_history', JSON.stringify(fresh));
      }
    } else {
      const fresh = generateMockDeliveries();
      setDeliveries(fresh);
      localStorage.setItem('deliverai_delivery_history', JSON.stringify(fresh));
    }
  }, []);

  // Filtered and Sorted deliveries
  const filteredDeliveries = useMemo(() => {
    return deliveries
      .filter(item => {
        const matchesSearch = 
          item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.customerName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesPlatform = selectedPlatform === 'All' || item.platform === selectedPlatform;
        const matchesStatus = selectedStatus === 'All' || item.status === selectedStatus;
        return matchesSearch && matchesPlatform && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'date-desc') return new Date(b.date).getTime() - new Date(a.date).getTime();
        if (sortBy === 'date-asc') return new Date(a.date).getTime() - new Date(b.date).getTime();
        if (sortBy === 'earnings-desc') return b.earnings - a.earnings;
        if (sortBy === 'time-desc') return b.deliveryTime - a.deliveryTime;
        return 0;
      });
  }, [deliveries, searchQuery, selectedPlatform, selectedStatus, sortBy]);

  // Overall Statistics
  const stats = useMemo(() => {
    const activeDeliveries = deliveries.filter(d => d.status === 'Delivered' || d.status === 'Delayed');
    const totalEarnings = deliveries.reduce((sum, item) => sum + item.earnings, 0);
    const totalDeliveries = deliveries.length;
    
    // Today's Date representation in sync with main system local time format
    const todayStr = '2026-07-13';
    const todayCount = deliveries.filter(d => d.date === todayStr).length;

    // Weekly (last 7 days from 2026-07-13)
    const todayRef = new Date(2026, 6, 13); // July 13 2026
    const weeklyCount = deliveries.filter(d => {
      const dDate = new Date(d.date);
      const diffTime = todayRef.getTime() - dDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays < 7;
    }).length;

    const totalTime = activeDeliveries.reduce((sum, item) => sum + item.deliveryTime, 0);
    const avgTime = activeDeliveries.length > 0 ? Math.round(totalTime / activeDeliveries.length) : 0;
    const successRate = totalDeliveries > 0 
      ? Math.round((deliveries.filter(d => d.status === 'Delivered').length / totalDeliveries) * 100) 
      : 100;

    return {
      totalDeliveries,
      todayCount,
      weeklyCount,
      totalEarnings,
      avgTime,
      successRate
    };
  }, [deliveries]);

  // Analytics helper metrics
  const analytics = useMemo(() => {
    // Platform stats
    const platformEarnings = { DoorDash: 0, 'Uber Eats': 0, Grubhub: 0 };
    const platformCounts = { DoorDash: 0, 'Uber Eats': 0, Grubhub: 0 };
    
    // Daily earnings for last 7 days
    const dailyData: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(2026, 6, 13);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      dailyData[dateStr] = 0;
    }

    let totalMiles = 0;
    const dateEarnings: Record<string, number> = {};

    deliveries.forEach(d => {
      if (d.status !== 'Cancelled') {
        platformEarnings[d.platform] += d.earnings;
        platformCounts[d.platform]++;
        totalMiles += d.distance;
      }
      
      if (dailyData[d.date] !== undefined) {
        dailyData[d.date] += d.earnings;
      }

      dateEarnings[d.date] = (dateEarnings[d.date] || 0) + d.earnings;
    });

    let highestEarningDay = '—';
    let highestAmt = 0;
    Object.keys(dateEarnings).forEach(date => {
      if (dateEarnings[date] > highestAmt) {
        highestAmt = dateEarnings[date];
        highestEarningDay = `${date} ($${dateEarnings[date].toFixed(2)})`;
      }
    });

    // Best Platform
    let bestPlatform: 'DoorDash' | 'Uber Eats' | 'Grubhub' = 'DoorDash';
    let bestAvg = 0;
    PLATFORMS.forEach(p => {
      const avg = platformCounts[p] > 0 ? platformEarnings[p] / platformCounts[p] : 0;
      if (avg > bestAvg) {
        bestAvg = avg;
        bestPlatform = p;
      }
    });

    // Cancellation rate
    const cancelledCount = deliveries.filter(d => d.status === 'Cancelled').length;
    const cancelRate = deliveries.length > 0 ? ((cancelledCount / deliveries.length) * 100).toFixed(1) : '0.0';

    return {
      highestEarningDay,
      totalMiles: totalMiles.toFixed(1),
      totalHours: (totalMiles * 0.15 + (deliveries.length * 0.4)).toFixed(1), // Estimate hours active
      bestPlatform,
      cancelRate,
      dailyChartData: Object.entries(dailyData).map(([date, val]) => ({ date, amount: val })),
      platformShare: Object.entries(platformEarnings).map(([name, value]) => ({ name, value }))
    };
  }, [deliveries]);

  // Export functions
  const handleExportCSV = () => {
    const headers = ['Order ID', 'Customer', 'Platform', 'Pickup Address', 'Delivery Address', 'Base Pay ($)', 'Tip ($)', 'Bonus ($)', 'Total Earnings ($)', 'Distance (mi)', 'Time (mins)', 'Rating', 'Status', 'Date', 'Notes'];
    const csvRows = [
      headers.join(','),
      ...deliveries.map(d => [
        d.id,
        `"${d.customerName}"`,
        d.platform,
        `"${d.pickupAddress.replace(/"/g, '""')}"`,
        `"${d.deliveryAddress.replace(/"/g, '""')}"`,
        d.earningsBreakdown.base,
        d.earningsBreakdown.tip,
        d.earningsBreakdown.bonus,
        d.earnings,
        d.distance,
        d.deliveryTime,
        d.rating,
        d.status,
        d.date,
        `"${d.notes.replace(/"/g, '""')}"`
      ].join(','))
    ];

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `deliverai_delivery_history_${Date.now()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <GlassCard className="p-4 flex flex-col justify-between">
          <span className="text-[10px] font-semibold text-white/50 uppercase">Total Deliveries</span>
          <div className="text-xl md:text-2xl font-extrabold text-white mt-1">{stats.totalDeliveries}</div>
        </GlassCard>

        <GlassCard className="p-4 flex flex-col justify-between">
          <span className="text-[10px] font-semibold text-white/50 uppercase">Today's Deliveries</span>
          <div className="text-xl md:text-2xl font-extrabold text-brand-orange mt-1">{stats.todayCount}</div>
        </GlassCard>

        <GlassCard className="p-4 flex flex-col justify-between">
          <span className="text-[10px] font-semibold text-white/50 uppercase">Weekly Deliveries</span>
          <div className="text-xl md:text-2xl font-extrabold text-white mt-1">{stats.weeklyCount}</div>
        </GlassCard>

        <GlassCard className="p-4 flex flex-col justify-between border border-emerald-500/20 bg-emerald-500/5">
          <span className="text-[10px] font-semibold text-white/50 uppercase">Total Earnings</span>
          <div className="text-xl md:text-2xl font-extrabold text-emerald-400 mt-1">${stats.totalEarnings.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
        </GlassCard>

        <GlassCard className="p-4 flex flex-col justify-between">
          <span className="text-[10px] font-semibold text-white/50 uppercase">Avg Delivery Time</span>
          <div className="text-xl md:text-2xl font-extrabold text-white mt-1 flex items-center gap-1">
            <Clock className="w-4 h-4 text-brand-orange" />
            {stats.avgTime} mins
          </div>
        </GlassCard>

        <GlassCard className="p-4 flex flex-col justify-between">
          <span className="text-[10px] font-semibold text-white/50 uppercase">Success Rate</span>
          <div className="text-xl md:text-2xl font-extrabold text-white mt-1 flex items-center gap-1">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            {stats.successRate}%
          </div>
        </GlassCard>
      </div>

      {/* 2. Search & Filters */}
      <GlassCard className="p-4 flex flex-col md:flex-row gap-4 justify-between items-center">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder="Search by Order ID or Driver..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-white placeholder-white/40 focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange transition-all"
          />
        </div>

        {/* Filters Group */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          {/* Platform */}
          <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl text-xs text-white/70">
            <Filter className="w-3.5 h-3.5" />
            <select
              value={selectedPlatform}
              onChange={e => setSelectedPlatform(e.target.value)}
              className="bg-transparent border-none text-white focus:outline-none cursor-pointer"
            >
              <option value="All" className="bg-brand-dark">All Platforms</option>
              <option value="DoorDash" className="bg-brand-dark">DoorDash</option>
              <option value="Uber Eats" className="bg-brand-dark">Uber Eats</option>
              <option value="Grubhub" className="bg-brand-dark">Grubhub</option>
            </select>
          </div>

          {/* Status */}
          <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl text-xs text-white/70">
            <CheckCircle className="w-3.5 h-3.5" />
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="bg-transparent border-none text-white focus:outline-none cursor-pointer"
            >
              <option value="All" className="bg-brand-dark">All Statuses</option>
              <option value="Delivered" className="bg-brand-dark">Delivered</option>
              <option value="Cancelled" className="bg-brand-dark">Cancelled</option>
              <option value="Delayed" className="bg-brand-dark">Delayed</option>
            </select>
          </div>

          {/* Sorting */}
          <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl text-xs text-white/70">
            <ArrowUpDown className="w-3.5 h-3.5" />
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="bg-transparent border-none text-white focus:outline-none cursor-pointer"
            >
              <option value="date-desc" className="bg-brand-dark">Newest First</option>
              <option value="date-asc" className="bg-brand-dark">Oldest First</option>
              <option value="earnings-desc" className="bg-brand-dark">Highest Earnings</option>
              <option value="time-desc" className="bg-brand-dark">Longest Delivery Time</option>
            </select>
          </div>
        </div>
      </GlassCard>

      {/* Main Content Layout (Table & Analytics) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 3. Delivery History Table */}
        <div className="lg:col-span-2 space-y-4">
          <GlassCard className="p-0 overflow-hidden border border-white/10 shadow-lg">
            <div className="p-4 border-b border-white/5 flex justify-between items-center bg-black/20">
              <h3 className="font-bold text-white text-base">Delivery History Logs</h3>
              <span className="text-xs text-white/40">{filteredDeliveries.length} orders match</span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-white/5 bg-white/5 text-white/50 uppercase font-semibold">
                    <th className="py-3 px-4">Order ID</th>
                    <th className="py-3 px-4">Platform</th>
                    <th className="py-3 px-4">Earnings</th>
                    <th className="py-3 px-4">Distance</th>
                    <th className="py-3 px-4">Time</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredDeliveries.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-white/40">
                        No delivery logs found matching the filter options.
                      </td>
                    </tr>
                  ) : (
                    filteredDeliveries.map((item) => (
                      <tr 
                        key={item.id}
                        onClick={() => setSelectedOrder(item)}
                        className="hover:bg-white/5 transition-all cursor-pointer group"
                      >
                        <td className="py-3.5 px-4 font-semibold text-white tracking-wider">
                          {item.id}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] tracking-wide ${
                            item.platform === 'DoorDash' ? 'bg-orange-600/20 text-orange-400 border border-orange-600/30' :
                            item.platform === 'Uber Eats' ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-600/30' :
                            'bg-red-600/20 text-red-400 border border-red-600/30'
                          }`}>
                            {item.platform}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-emerald-400 text-sm">
                          ${item.earnings.toFixed(2)}
                        </td>
                        <td className="py-3.5 px-4 text-white/80">
                          {item.distance} mi
                        </td>
                        <td className="py-3.5 px-4 text-white/80">
                          {item.status === 'Cancelled' ? '—' : `${item.deliveryTime} mins`}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center gap-1 font-semibold ${
                            item.status === 'Delivered' ? 'text-emerald-400' :
                            item.status === 'Cancelled' ? 'text-red-400' :
                            'text-amber-400'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              item.status === 'Delivered' ? 'bg-emerald-400' :
                              item.status === 'Cancelled' ? 'bg-red-400' :
                              'bg-amber-400'
                            }`} />
                            {item.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-white/60">
                          {item.date}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <button className="p-1 rounded bg-white/5 text-white/60 hover:text-white hover:bg-brand-orange/20 transition-all">
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>

        {/* 5. Analytics Section */}
        <div className="space-y-6">
          <GlassCard className="p-4 space-y-4">
            <h3 className="font-bold text-white text-base flex items-center gap-2 border-b border-white/5 pb-2">
              <Sparkles className="w-4 h-4 text-brand-orange" />
              Efficiency Analytics
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                <span className="text-[10px] text-white/40 block">Highest Earning Day</span>
                <span className="text-xs font-bold text-white truncate block mt-0.5">{analytics.highestEarningDay}</span>
              </div>
              <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                <span className="text-[10px] text-white/40 block">Total Miles Driven</span>
                <span className="text-sm font-bold text-white block mt-0.5">{analytics.totalMiles} mi</span>
              </div>
              <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                <span className="text-[10px] text-white/40 block">Total Hours Active</span>
                <span className="text-sm font-bold text-white block mt-0.5">{analytics.totalHours} hrs</span>
              </div>
              <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                <span className="text-[10px] text-white/40 block">Best Platform</span>
                <span className="text-sm font-bold text-emerald-400 block mt-0.5">{analytics.bestPlatform}</span>
              </div>
            </div>

            {/* SVG Charts */}
            <div className="space-y-4 pt-2">
              <div>
                <span className="text-xs font-bold text-white/70 block mb-2">Earnings Last 7 Days ($)</span>
                {/* SVG Area chart */}
                <div className="h-32 w-full bg-white/5 rounded-xl border border-white/5 p-2 flex flex-col justify-between">
                  <div className="flex-1 flex items-end justify-between gap-1 pt-4">
                    {analytics.dailyChartData.map((d, i) => {
                      const maxVal = Math.max(...analytics.dailyChartData.map(item => item.amount), 1);
                      const pctHeight = (d.amount / maxVal) * 80;
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center group relative">
                          {/* Tooltip */}
                          <div className="absolute bottom-full mb-1 scale-0 group-hover:scale-100 bg-brand-dark/95 border border-brand-orange text-white text-[9px] py-0.5 px-1.5 rounded transition-all z-20 whitespace-nowrap shadow-xl">
                            ${d.amount.toFixed(2)}
                          </div>
                          {/* Bar */}
                          <div 
                            className="w-full bg-brand-orange/60 group-hover:bg-brand-orange rounded-t transition-all"
                            style={{ height: `${pctHeight}%` }}
                          />
                          <span className="text-[8px] text-white/40 mt-1">{d.date.split('-')[2]}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div>
                <span className="text-xs font-bold text-white/70 block mb-2">Platform Share</span>
                {/* SVG Pizza chart breakdown */}
                <div className="bg-white/5 rounded-xl border border-white/5 p-3 flex items-center justify-around">
                  <svg className="w-20 h-20" viewBox="0 0 100 100">
                    {/* Simplified Ring chart breakdown representation */}
                    <circle cx="50" cy="50" r="30" fill="transparent" stroke="#e0e0e0" strokeWidth="10" strokeOpacity="0.1" />
                    <circle cx="50" cy="50" r="30" fill="transparent" stroke="#f97316" strokeWidth="10" strokeDasharray="188" strokeDashoffset="50" />
                    <circle cx="50" cy="50" r="30" fill="transparent" stroke="#10b981" strokeWidth="10" strokeDasharray="188" strokeDashoffset="120" />
                    <circle cx="50" cy="50" r="30" fill="transparent" stroke="#ef4444" strokeWidth="10" strokeDasharray="188" strokeDashoffset="160" />
                  </svg>
                  <div className="space-y-1.5 text-[10px]">
                    <div className="flex items-center gap-1.5 text-white/80">
                      <span className="w-2 h-2 rounded-full bg-brand-orange"></span>
                      <span>DoorDash</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-white/80">
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                      <span>Uber Eats</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-white/80">
                      <span className="w-2 h-2 rounded-full bg-red-500"></span>
                      <span>Grubhub</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* 6. AI Insights */}
          <GlassCard className="p-4 border border-brand-orange/20 bg-brand-orange-alpha/5 space-y-3">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-orange animate-bounce" />
              AI Performance Insights
            </h3>
            <ul className="space-y-2 text-xs text-white/80">
              <li className="flex items-start gap-1.5">
                <span className="text-brand-orange shrink-0 mt-0.5">•</span>
                <span>Friday evenings between 5 PM and 8 PM generated the highest surge multipliers.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-brand-orange shrink-0 mt-0.5">•</span>
                <span>Average delivery time improved by 12% relative to last week due to construction bypass.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-brand-orange shrink-0 mt-0.5">•</span>
                <span>{analytics.bestPlatform} currently provides the highest average payout ($18.40/order).</span>
              </li>
            </ul>
          </GlassCard>

          {/* 7. Export Actions */}
          <GlassCard className="p-4 flex gap-2">
            <button 
              onClick={handleExportCSV}
              className="flex-1 flex items-center justify-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl py-2.5 text-xs font-semibold transition-all"
            >
              <Download className="w-3.5 h-3.5 text-brand-orange" />
              Export CSV
            </button>
            <button 
              onClick={handlePrint}
              className="flex-1 flex items-center justify-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl py-2.5 text-xs font-semibold transition-all"
            >
              <Printer className="w-3.5 h-3.5 text-brand-orange" />
              Print / PDF
            </button>
          </GlassCard>
        </div>
      </div>

      {/* 4. Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <GlassCard className="w-full max-w-2xl overflow-hidden border border-white/10 shadow-2xl flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-4 border-b border-white/5 flex justify-between items-center bg-black/40">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-white">Order Details: {selectedOrder.id}</span>
                  <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] tracking-wider uppercase ${
                    selectedOrder.platform === 'DoorDash' ? 'bg-orange-600/20 text-orange-400 border border-orange-600/30' :
                    selectedOrder.platform === 'Uber Eats' ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-600/30' :
                    'bg-red-600/20 text-red-400 border border-red-600/30'
                  }`}>
                    {selectedOrder.platform}
                  </span>
                </div>
                <p className="text-[10px] text-white/50 mt-0.5">Completed on {selectedOrder.date}</p>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="p-1 rounded bg-white/5 text-white/60 hover:text-white hover:bg-white/10 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              
              {/* Route SVG Preview */}
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-white/40 block">Route Path Preview</span>
                <div className="h-32 w-full bg-brand-dark/95 border border-white/10 rounded-xl relative overflow-hidden flex items-center justify-center p-4">
                  <svg className="absolute inset-0 w-full h-full opacity-30" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                  </svg>
                  
                  {/* Visualizing Route Map */}
                  <svg className="w-full h-full relative z-10" viewBox="0 0 300 80">
                    {/* Path */}
                    <path 
                      d="M 30 40 Q 150 10 270 40" 
                      fill="none" 
                      stroke="#f97316" 
                      strokeWidth="3.5" 
                      strokeLinecap="round" 
                      strokeDasharray="6 3" 
                      className="animate-pulse" 
                    />
                    
                    {/* Start Marker A */}
                    <circle cx="30" cy="40" r="5" fill="#f97316" />
                    <text x="30" y="58" fontSize="8" fill="#fff" textAnchor="middle" fontWeight="bold">Store (A)</text>
                    
                    {/* End Marker B */}
                    <circle cx="270" cy="40" r="5" fill="#10b981" />
                    <text x="270" y="58" fontSize="8" fill="#fff" textAnchor="middle" fontWeight="bold">Customer (B)</text>

                    {/* Midpoint helper HUD */}
                    <rect x="110" y="45" width="80" height="15" rx="4" fill="rgba(0,0,0,0.8)" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
                    <text x="150" y="55" fontSize="8" fill="#f97316" textAnchor="middle" fontWeight="semibold">Est. {selectedOrder.distance} mi</text>
                  </svg>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Delivery Information */}
                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-white/40 block">Customer Information</span>
                    <span className="text-sm font-semibold text-white block mt-0.5">{selectedOrder.customerName}</span>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-white/40 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-brand-orange" /> Pickup Address
                      </span>
                      <p className="text-xs text-white/80 leading-relaxed mt-0.5">{selectedOrder.pickupAddress}</p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-white/40 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-emerald-400" /> Delivery Address
                      </span>
                      <p className="text-xs text-white/80 leading-relaxed mt-0.5">{selectedOrder.deliveryAddress}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-1">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-white/40 block">Distance Route</span>
                      <span className="text-sm font-semibold text-white block mt-0.5">{selectedOrder.distance} mi</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-white/40 block">Duration Taken</span>
                      <span className="text-sm font-semibold text-white block mt-0.5">{selectedOrder.deliveryTime} mins</span>
                    </div>
                  </div>
                </div>

                {/* Earnings Breakdown & Ratings */}
                <div className="space-y-4">
                  
                  {/* Detailed Earnings */}
                  <div className="bg-white/5 border border-white/5 p-4 rounded-xl space-y-2.5">
                    <span className="text-[10px] uppercase font-bold text-white/40 block border-b border-white/5 pb-1">Earnings Breakdown</span>
                    <div className="space-y-1.5 text-xs text-white/80">
                      <div className="flex justify-between">
                        <span>Base Payout</span>
                        <span>${selectedOrder.earningsBreakdown.base.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Customer Tip</span>
                        <span className="text-emerald-400">+ ${selectedOrder.earningsBreakdown.tip.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Surge / Promo Bonus</span>
                        <span className="text-brand-orange">+ ${selectedOrder.earningsBreakdown.bonus.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-white border-t border-white/5 pt-2 text-sm">
                        <span>Total Earnings</span>
                        <span className="text-emerald-400">${selectedOrder.earnings.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Customer Rating & Textual Feedback */}
                  {selectedOrder.status !== 'Cancelled' && (
                    <div className="bg-white/5 border border-white/5 p-4 rounded-xl space-y-2.5">
                      <span className="text-[10px] uppercase font-bold text-white/40 block border-b border-white/5 pb-1">Rating & Feedback</span>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, idx) => (
                          <Star 
                            key={idx}
                            className={`w-4 h-4 ${idx < selectedOrder.rating ? 'text-amber-400 fill-amber-400' : 'text-white/20'}`}
                          />
                        ))}
                        <span className="text-xs font-bold text-white/90 ml-1.5">({selectedOrder.rating} / 5 stars)</span>
                      </div>
                      <p className="text-xs italic text-white/70">"{selectedOrder.feedback}"</p>
                    </div>
                  )}

                  {/* Driver Shift Notes */}
                  <div>
                    <span className="text-[10px] uppercase font-bold text-white/40 block">Shift Notes</span>
                    <p className="text-xs text-white/60 leading-relaxed italic mt-0.5">"{selectedOrder.notes}"</p>
                  </div>

                </div>

              </div>

              {/* Repeat Similar Route AI Box */}
              <div className="p-3.5 rounded-xl bg-brand-orange-alpha/10 border border-brand-orange/30 flex justify-between items-center gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-brand-orange uppercase flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-brand-orange" />
                    AI Guard Route Tip
                  </span>
                  <p className="text-xs text-white/80">
                    We noticed that completing deliveries around this area on Friday evenings yields a 24% higher average tip rate. Would you like to repeat this route?
                  </p>
                </div>
                <button 
                  onClick={() => {
                    alert('Route added to preferred scheduler!');
                    setSelectedOrder(null);
                  }}
                  className="px-4 py-2 bg-brand-orange hover:bg-brand-orange-light text-white font-bold text-xs rounded-lg transition-all shadow-md shrink-0"
                >
                  Repeat Similar Route
                </button>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-white/5 bg-black/40 flex justify-end gap-2">
              <button 
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-xs rounded-xl transition-all"
              >
                Close Details
              </button>
            </div>

          </GlassCard>
        </div>
      )}

    </div>
  );
};
