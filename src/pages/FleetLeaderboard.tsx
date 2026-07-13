import React, { useState, useEffect } from 'react';
import { GlassCard } from '../components/GlassCard';
import { 
  Trophy, 
  TrendingUp, 
  TrendingDown,
  Search, 
  Award, 
  Sparkles, 
  RefreshCw, 
  Flame, 
  Target
} from 'lucide-react';

interface LeaderboardDriver {
  id: string;
  avatar: string;
  name: string;
  platform: 'DoorDash' | 'Uber Eats' | 'Grubhub';
  rating: number;
  deliveries: number;
  weeklyEarnings: number;
  streak: number;
  rankChange: 'up' | 'down' | 'same';
  isCurrentUser?: boolean;
}

const DEFAULT_COMPETITORS: LeaderboardDriver[] = [
  {
    id: 'comp-1',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=128',
    name: 'Marcus K.',
    platform: 'Uber Eats',
    rating: 4.96,
    deliveries: 124,
    weeklyEarnings: 1285.50,
    streak: 15,
    rankChange: 'up'
  },
  {
    id: 'comp-2',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=128',
    name: 'Sophia M.',
    platform: 'DoorDash',
    rating: 4.91,
    deliveries: 112,
    weeklyEarnings: 1140.20,
    streak: 12,
    rankChange: 'same'
  },
  {
    id: 'comp-3',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=128',
    name: 'Alex D.',
    platform: 'DoorDash',
    rating: 4.88,
    deliveries: 98,
    weeklyEarnings: 990.80,
    streak: 9,
    rankChange: 'down'
  },
  {
    id: 'comp-4',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=128',
    name: 'Elena R.',
    platform: 'Grubhub',
    rating: 4.85,
    deliveries: 88,
    weeklyEarnings: 840.40,
    streak: 5,
    rankChange: 'up'
  },
  {
    id: 'comp-5',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=128',
    name: 'David L.',
    platform: 'Uber Eats',
    rating: 4.79,
    deliveries: 84,
    weeklyEarnings: 790.60,
    streak: 6,
    rankChange: 'down'
  },
  {
    id: 'comp-6',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=128',
    name: 'Chloe W.',
    platform: 'Grubhub',
    rating: 4.89,
    deliveries: 76,
    weeklyEarnings: 742.00,
    streak: 7,
    rankChange: 'same'
  },
  {
    id: 'comp-7',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=128',
    name: 'Ryan P.',
    platform: 'DoorDash',
    rating: 4.76,
    deliveries: 72,
    weeklyEarnings: 685.20,
    streak: 4,
    rankChange: 'up'
  },
  {
    id: 'comp-8',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=128',
    name: 'Tyler J.',
    platform: 'Uber Eats',
    rating: 4.82,
    deliveries: 68,
    weeklyEarnings: 615.00,
    streak: 3,
    rankChange: 'down'
  },
  {
    id: 'comp-9',
    avatar: 'https://images.unsplash.com/photo-1534751516642-a131ffd473fd?auto=format&fit=crop&q=80&w=128',
    name: 'Maya S.',
    platform: 'Grubhub',
    rating: 4.73,
    deliveries: 62,
    weeklyEarnings: 550.40,
    streak: 2,
    rankChange: 'same'
  }
];

export const FleetLeaderboard: React.FC = () => {
  const [drivers, setDrivers] = useState<LeaderboardDriver[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'deliveries' | 'weeklyEarnings' | 'rating' | 'streak'>('weeklyEarnings');
  const [notification, setNotification] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  // Fetch current user from localStorage
  const getCurrentUserDriver = (): LeaderboardDriver => {
    const savedProfile = localStorage.getItem('deliverai_guardian_driver_profile');
    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile);
        return {
          id: 'current-user',
          avatar: parsed.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
          name: parsed.name || 'Karthik S. (You)',
          platform: parsed.platform || 'DoorDash',
          rating: parsed.customerRating || 4.82,
          deliveries: parsed.totalDeliveries || 95,
          weeklyEarnings: parsed.totalEarnings || 935.40,
          streak: parsed.currentStreak || 8,
          rankChange: 'same',
          isCurrentUser: true
        };
      } catch (e) {
        console.error("Failed to parse driver profile", e);
      }
    }
    return {
      id: 'current-user',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
      name: 'Karthik S. (You)',
      platform: 'DoorDash',
      rating: 4.82,
      deliveries: 95,
      weeklyEarnings: 935.40,
      streak: 8,
      rankChange: 'same',
      isCurrentUser: true
    };
  };

  // Initialize and merge drivers list
  useEffect(() => {
    const savedCompetitors = localStorage.getItem('deliverai_guardian_leaderboard_competitors');
    let competitors = DEFAULT_COMPETITORS;
    
    if (savedCompetitors) {
      try {
        competitors = JSON.parse(savedCompetitors);
      } catch (e) {
        console.error("Failed to parse saved competitors", e);
      }
    } else {
      localStorage.setItem('deliverai_guardian_leaderboard_competitors', JSON.stringify(DEFAULT_COMPETITORS));
    }

    const currentUser = getCurrentUserDriver();
    
    // Merge competitors + current user, remove duplicate user if exists
    const mergedList = [...competitors.filter(c => c.id !== 'current-user'), currentUser];
    
    // Sort initially by the chosen metric
    const sorted = sortDriversList(mergedList, sortBy);
    setDrivers(sorted);
  }, [sortBy]);

  const sortDriversList = (list: LeaderboardDriver[], sortKey: typeof sortBy) => {
    return [...list].sort((a, b) => {
      if (sortKey === 'weeklyEarnings') return b.weeklyEarnings - a.weeklyEarnings;
      if (sortKey === 'deliveries') return b.deliveries - a.deliveries;
      if (sortKey === 'rating') return b.rating - a.rating;
      if (sortKey === 'streak') return b.streak - a.streak;
      return 0;
    });
  };

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Simulator Handler: Updates simulated competitors slightly
  const handleSimulateHour = () => {
    setIsSimulating(true);
    setTimeout(() => {
      const savedCompetitors = localStorage.getItem('deliverai_guardian_leaderboard_competitors');
      let competitors = DEFAULT_COMPETITORS;
      
      if (savedCompetitors) {
        try {
          competitors = JSON.parse(savedCompetitors);
        } catch (e) {
          console.error(e);
        }
      }

      // Track order of top drivers prior to simulation for shift announcements
      const oldSorted = sortDriversList([...competitors, getCurrentUserDriver()], sortBy);
      const oldTopDriverName = oldSorted[0]?.name;

      // Update mock competitors with random increments
      const updatedCompetitors = competitors.map(driver => {
        const addedDeliveries = Math.random() > 0.4 ? Math.floor(Math.random() * 3) + 1 : 0;
        const addedEarnings = addedDeliveries * (parseFloat((Math.random() * 8 + 12).toFixed(2)));
        const ratingShift = parseFloat((Math.random() * 0.06 - 0.03).toFixed(2));
        
        let newStreak = driver.streak;
        if (addedDeliveries > 0) {
          newStreak += 1;
        } else if (Math.random() > 0.8) {
          newStreak = Math.max(0, newStreak - 1);
        }

        return {
          ...driver,
          deliveries: driver.deliveries + addedDeliveries,
          weeklyEarnings: parseFloat((driver.weeklyEarnings + addedEarnings).toFixed(2)),
          rating: Math.min(5.0, Math.max(4.20, parseFloat((driver.rating + ratingShift).toFixed(2)))),
          streak: newStreak
        };
      });

      localStorage.setItem('deliverai_guardian_leaderboard_competitors', JSON.stringify(updatedCompetitors));
      
      const currentUser = getCurrentUserDriver();
      const newSorted = sortDriversList([...updatedCompetitors, currentUser], sortBy);
      
      // Calculate rank changes (up, down, same) relative to previous positions
      const finalWithRankChanges = newSorted.map((d, index) => {
        const prevIndex = oldSorted.findIndex(oldD => oldD.name === d.name);
        let rankChange: 'up' | 'down' | 'same' = 'same';
        if (prevIndex !== -1) {
          if (index < prevIndex) rankChange = 'up';
          else if (index > prevIndex) rankChange = 'down';
        }
        return { ...d, rankChange };
      });

      setDrivers(finalWithRankChanges);
      setIsSimulating(false);

      const newTopDriverName = finalWithRankChanges[0]?.name;
      if (newTopDriverName !== oldTopDriverName) {
        showToast(`🏆 ${newTopDriverName} overtook ${oldTopDriverName} for 1st place!`);
      } else {
        const randomCompetitor = updatedCompetitors[Math.floor(Math.random() * updatedCompetitors.length)];
        showToast(`⚡ Shift simulation finished. ${randomCompetitor.name} completed new deliveries!`);
      }
    }, 1000);
  };

  // Filtered drivers based on Search and Platform selectors
  const filteredDrivers = drivers.filter(driver => {
    const matchesSearch = driver.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPlatform = selectedPlatform === 'All' || driver.platform === selectedPlatform;
    return matchesSearch && matchesPlatform;
  });

  // Podium Positions (1st, 2nd, 3rd)
  // Find where they are positioned globally
  const firstPlace = filteredDrivers[0];
  const secondPlace = filteredDrivers[1];
  const thirdPlace = filteredDrivers[2];
  
  // Find current user's current ranking index
  const currentUserGlobalRankIndex = drivers.findIndex(d => d.isCurrentUser);
  const currentUserGlobalRank = currentUserGlobalRankIndex !== -1 ? currentUserGlobalRankIndex + 1 : 10;
  
  // Weekly Challenge values based on current user stats
  const currentUserProfile = getCurrentUserDriver();
  const challenge1Progress = Math.min(100, Math.round((currentUserProfile.deliveries / 120) * 100));
  const challenge2Progress = Math.min(100, Math.round((currentUserProfile.weeklyEarnings / 1200) * 100));

  return (
    <div className="space-y-6">
      {/* Toast Notification alert */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 px-5 py-3.5 bg-brand-orange text-white text-xs font-bold rounded-2xl shadow-xl shadow-brand-orange/20 border border-white/20 animate-bounce flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-white animate-spin" />
          <span>{notification}</span>
        </div>
      )}

      {/* Simulator Quick Action Header Card */}
      <GlassCard className="border border-brand-orange/30 bg-brand-orange-alpha/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-1 bg-brand-orange/10 border-b border-l border-brand-orange/20 rounded-bl-xl text-[9px] uppercase font-bold text-brand-orange tracking-widest">
          Active Competition Arena
        </div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <h3 className="font-extrabold text-white text-base flex items-center gap-2">
              <Trophy className="w-5 h-5 text-brand-orange animate-bounce" />
              Live Fleet Competitor Dashboard
            </h3>
            <p className="text-xs text-white/70">
              Simulate next-hour delivery logs for surrounding drivers to see real-time ranking modifications and leaderboard shakeups.
            </p>
          </div>
          <button
            onClick={handleSimulateHour}
            disabled={isSimulating}
            className="w-full md:w-auto px-5 py-3 bg-brand-orange hover:bg-brand-orange-hover text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-brand-orange/25 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 text-white ${isSimulating ? 'animate-spin' : ''}`} />
            {isSimulating ? 'Simulating Shifts...' : 'Simulate Next Hour'}
          </button>
        </div>
      </GlassCard>

      {/* Podium Showcase Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-end pt-4">
        {/* 2nd Place Podium */}
        {secondPlace && (
          <GlassCard className="flex flex-col items-center justify-center p-6 text-center order-2 lg:order-1 border-t-2 border-slate-400/40 relative">
            <div className="absolute top-4 left-4 bg-slate-400/20 text-slate-300 w-8 h-8 rounded-full flex items-center justify-center font-extrabold text-sm border border-slate-400/30">
              2
            </div>
            <div className="relative mb-3">
              <img src={secondPlace.avatar} alt={secondPlace.name} className="w-20 h-20 rounded-full object-cover border-2 border-slate-400/50" />
              <span className="absolute -bottom-1 -right-1 px-2 py-0.5 bg-slate-500 rounded text-[9px] font-bold text-white uppercase">{secondPlace.platform}</span>
            </div>
            <h4 className="text-base font-bold text-white flex items-center gap-1.5">
              {secondPlace.name}
              {secondPlace.isCurrentUser && <span className="text-[10px] bg-brand-orange/20 text-brand-orange px-1.5 py-0.5 rounded">You</span>}
            </h4>
            <div className="mt-2 space-y-0.5 text-xs text-white/60">
              <p className="font-extrabold text-white text-base">${secondPlace.weeklyEarnings.toFixed(2)}</p>
              <p>{secondPlace.deliveries} Deliveries • {secondPlace.rating} ⭐</p>
            </div>
          </GlassCard>
        )}

        {/* 1st Place Podium */}
        {firstPlace && (
          <GlassCard className="flex flex-col items-center justify-center p-8 text-center order-1 lg:order-2 border-t-4 border-amber-400/60 relative scale-[1.03] shadow-xl shadow-amber-400/5 bg-gradient-to-b from-amber-950/10 to-brand-dark">
            <div className="absolute -top-5 bg-amber-400 text-brand-dark w-10 h-10 rounded-full flex items-center justify-center font-extrabold text-lg border-2 border-white shadow-lg animate-float">
              👑
            </div>
            <div className="relative mb-3">
              <img src={firstPlace.avatar} alt={firstPlace.name} className="w-24 h-24 rounded-full object-cover border-4 border-amber-400/70" />
              <span className="absolute -bottom-1 -right-1 px-2 py-0.5 bg-amber-500 rounded text-[9px] font-bold text-brand-dark uppercase">{firstPlace.platform}</span>
            </div>
            <h4 className="text-lg font-extrabold text-white flex items-center gap-1.5">
              {firstPlace.name}
              {firstPlace.isCurrentUser && <span className="text-[10px] bg-brand-orange/20 text-brand-orange px-1.5 py-0.5 rounded">You</span>}
            </h4>
            <div className="mt-2 space-y-0.5 text-xs text-white/70">
              <p className="font-extrabold text-amber-400 text-lg">${firstPlace.weeklyEarnings.toFixed(2)}</p>
              <p className="font-semibold text-white/90">{firstPlace.deliveries} Deliveries • {firstPlace.rating} ⭐</p>
              <div className="mt-1 flex items-center gap-1.5 text-amber-400 font-bold bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20 text-[10px]">
                <Flame className="w-3.5 h-3.5" />
                Active Streak: {firstPlace.streak} shifts
              </div>
            </div>
          </GlassCard>
        )}

        {/* 3rd Place Podium */}
        {thirdPlace && (
          <GlassCard className="flex flex-col items-center justify-center p-6 text-center order-3 lg:order-3 border-t-2 border-amber-700/40 relative">
            <div className="absolute top-4 right-4 bg-amber-700/20 text-amber-600 w-8 h-8 rounded-full flex items-center justify-center font-extrabold text-sm border border-amber-700/30">
              3
            </div>
            <div className="relative mb-3">
              <img src={thirdPlace.avatar} alt={thirdPlace.name} className="w-20 h-20 rounded-full object-cover border-2 border-amber-700/50" />
              <span className="absolute -bottom-1 -right-1 px-2 py-0.5 bg-amber-700 rounded text-[9px] font-bold text-white uppercase">{thirdPlace.platform}</span>
            </div>
            <h4 className="text-base font-bold text-white flex items-center gap-1.5">
              {thirdPlace.name}
              {thirdPlace.isCurrentUser && <span className="text-[10px] bg-brand-orange/20 text-brand-orange px-1.5 py-0.5 rounded">You</span>}
            </h4>
            <div className="mt-2 space-y-0.5 text-xs text-white/60">
              <p className="font-extrabold text-white text-base">${thirdPlace.weeklyEarnings.toFixed(2)}</p>
              <p>{thirdPlace.deliveries} Deliveries • {thirdPlace.rating} ⭐</p>
            </div>
          </GlassCard>
        )}
      </div>

      {/* Main Rankings & Challenges Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Rankings Table Card */}
        <GlassCard className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-white/5 pb-4">
            <div>
              <h3 className="font-extrabold text-white text-base">Driver Rankings List</h3>
              <p className="text-[10px] text-white/40">Active local shift ratings & weekly payouts</p>
            </div>

            {/* Platform & Sort Filters */}
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <select
                value={selectedPlatform}
                onChange={(e) => setSelectedPlatform(e.target.value)}
                className="py-1 px-2 text-xs rounded-lg glass-input bg-brand-dark border-white/10 text-white flex-1 sm:flex-none"
              >
                <option value="All">All Platforms</option>
                <option value="DoorDash">DoorDash</option>
                <option value="Uber Eats">Uber Eats</option>
                <option value="Grubhub">Grubhub</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="py-1 px-2 text-xs rounded-lg glass-input bg-brand-dark border-white/10 text-white flex-1 sm:flex-none"
              >
                <option value="weeklyEarnings">Earnings</option>
                <option value="deliveries">Deliveries</option>
                <option value="rating">Rating</option>
                <option value="streak">Streak</option>
              </select>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-white/40" />
            <input
              type="text"
              placeholder="Search driver by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl glass-input border-white/5"
            />
          </div>

          {/* Table list */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[500px]">
              <thead>
                <tr className="border-b border-white/10 text-xs text-white/50 font-bold uppercase">
                  <th className="py-3 px-4 text-center w-12">Rank</th>
                  <th className="py-3 px-4">Driver</th>
                  <th className="py-3 px-4 text-center">Platform</th>
                  <th className="py-3 px-4 text-center">Rating</th>
                  <th className="py-3 px-4 text-center">Deliveries</th>
                  <th className="py-3 px-4 text-right">Weekly Earnings</th>
                  <th className="py-3 px-4 text-center">Streak</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm text-white/90">
                {filteredDrivers.map((driver) => {
                  const absoluteRank = drivers.findIndex(d => d.id === driver.id) + 1;
                  return (
                    <tr 
                      key={driver.id} 
                      className={`hover:bg-white/5 transition-all duration-150 ${driver.isCurrentUser ? 'bg-brand-orange-alpha/10 border-y border-brand-orange/20 font-semibold' : ''}`}
                    >
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {absoluteRank === 1 && <span className="text-amber-400">🥇</span>}
                          {absoluteRank === 2 && <span className="text-slate-300">🥈</span>}
                          {absoluteRank === 3 && <span className="text-amber-700">🥉</span>}
                          {absoluteRank > 3 && <span className="text-xs font-bold text-white/40">{absoluteRank}</span>}
                          
                          {/* Rank Shift Indicator */}
                          {driver.rankChange === 'up' && <TrendingUp className="w-3 h-3 text-emerald-400" />}
                          {driver.rankChange === 'down' && <TrendingDown className="w-3 h-3 text-red-400" />}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img src={driver.avatar} alt={driver.name} className="w-8 h-8 rounded-full object-cover border border-white/10" />
                          <div>
                            <span className="text-sm font-bold text-white block">
                              {driver.name} 
                              {driver.isCurrentUser && <span className="ml-1.5 text-[9px] bg-brand-orange text-white px-1.5 py-0.5 rounded font-extrabold uppercase">You</span>}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/5 border border-white/10 text-white/80">
                          {driver.platform}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-amber-400">{driver.rating.toFixed(2)} ⭐</td>
                      <td className="py-3.5 px-4 text-center font-bold">{driver.deliveries}</td>
                      <td className="py-3.5 px-4 text-right font-extrabold text-brand-orange">${driver.weeklyEarnings.toFixed(2)}</td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center gap-1 font-bold text-xs text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                          <Flame className="w-3.5 h-3.5" />
                          {driver.streak}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredDrivers.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-white/40">
                      No drivers match the search query or platform filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </GlassCard>

        {/* Motivational Analytics & Active Challenges */}
        <div className="space-y-6">
          {/* Rank Summary Card */}
          <GlassCard className="space-y-4 border border-brand-orange/20 bg-brand-orange-alpha/5">
            <h3 className="font-extrabold text-white text-base flex items-center gap-2">
              <Award className="w-5 h-5 text-brand-orange" />
              Competition Standing
            </h3>
            
            <div className="p-4 bg-white/5 rounded-xl border border-white/5 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs text-white/60">Your Global Rank</span>
                <span className="text-lg font-extrabold text-brand-orange">#{currentUserGlobalRank} of {drivers.length + 1}</span>
              </div>
              <div className="flex justify-between items-center border-t border-white/5 pt-3">
                <span className="text-xs text-white/60">Current Standing</span>
                <span className="text-xs font-bold text-emerald-400">Top 12% in local Area</span>
              </div>
              <div className="flex justify-between items-center border-t border-white/5 pt-3">
                <span className="text-xs text-white/60">Peak Daily Payout</span>
                <span className="text-xs font-semibold text-white">${currentUserProfile.weeklyEarnings.toFixed(2)}</span>
              </div>
            </div>

            <div className="text-[11px] text-white/70 bg-brand-orange-alpha/10 border border-brand-orange/20 p-3 rounded-xl leading-relaxed">
              💡 <strong>AI Tip:</strong> You are only <strong>$55.00</strong> away from overtaking <strong>Alex D.</strong> and securing the 3rd podium place. Drive during tomorrow's lunch surge to lock in the bonus payout!
            </div>
          </GlassCard>

          {/* Active Weekly Challenges */}
          <GlassCard className="space-y-4">
            <h3 className="font-extrabold text-white text-base flex items-center gap-2">
              <Target className="w-5 h-5 text-brand-orange" />
              Weekly Active Challenges
            </h3>

            <div className="space-y-4">
              {/* Challenge 1 */}
              <div className="p-3 bg-white/5 border border-white/5 rounded-xl space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-xs font-bold text-white">Weekend Surge Warrior</h4>
                    <p className="text-[10px] text-white/50 mt-0.5">Complete 120 total weekly deliveries</p>
                  </div>
                  <span className="px-2 py-0.5 text-[8px] font-bold bg-amber-400/20 text-amber-400 rounded border border-amber-400/20 uppercase">
                    Badge Reward
                  </span>
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-white/70">
                    <span>{currentUserProfile.deliveries} / 120 Deliveries</span>
                    <span>{challenge1Progress}% Completed</span>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-brand-orange rounded-full" 
                      style={{ width: `${challenge1Progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Challenge 2 */}
              <div className="p-3 bg-white/5 border border-white/5 rounded-xl space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-xs font-bold text-white">Earnings Magnet</h4>
                    <p className="text-[10px] text-white/50 mt-0.5">Reach $1,200.00 weekly payouts</p>
                  </div>
                  <span className="px-2 py-0.5 text-[8px] font-bold bg-emerald-400/20 text-emerald-400 rounded border border-emerald-400/20 uppercase">
                    $50 Surge Bonus
                  </span>
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-white/70">
                    <span>${currentUserProfile.weeklyEarnings.toFixed(2)} / $1,200.00</span>
                    <span>{challenge2Progress}% Completed</span>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-400 rounded-full" 
                      style={{ width: `${challenge2Progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};
