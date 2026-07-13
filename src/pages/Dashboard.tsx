import React, { useState, useEffect, useRef } from 'react';
import { 
  MapPin, 
  ChevronRight, 
  CloudRain, 
  Navigation,
  AlertTriangle,
  Send,
  Sparkles,
  Zap,
  Mic,
  MicOff,
  Settings,
  Loader2,
  AlertOctagon,
  Phone,
  ShieldAlert,
  Clock,
  Activity,
  Heart,
  Receipt,
  Plus,
  Trash2,
  TrendingDown
} from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { askGuardianAI, getMockResponse } from '../services/geminiService';
import type { ChatMessage } from '../services/geminiService';
import { ApiSettings } from '../components/ApiSettings';
import { MapContainer } from '../components/MapContainer';
import { DriverProfile } from './DriverProfile';
import { NotificationCenter } from './NotificationCenter';
import type { NotificationItem } from './NotificationCenter';

export interface Expense {
  id: string;
  date: string;
  category: 'Fuel' | 'Parking' | 'Food' | 'Toll' | 'Vehicle Maintenance' | 'Other';
  amount: number;
  note?: string;
}

const INITIAL_EXPENSES: Expense[] = [
  { id: 'exp-1', date: '2026-07-13', category: 'Fuel', amount: 25.00, note: 'Chevron gas station fill up' },
  { id: 'exp-2', date: '2026-07-13', category: 'Parking', amount: 4.50, note: 'Meter parking near Downtown Grill' },
  { id: 'exp-3', date: '2026-07-12', category: 'Food', amount: 12.80, note: 'Lunch during shift' },
  { id: 'exp-4', date: '2026-07-11', category: 'Toll', amount: 6.00, note: 'Expressway toll fee' },
  { id: 'exp-5', date: '2026-07-08', category: 'Vehicle Maintenance', amount: 85.00, note: 'Oil change and tire pressure check' },
  { id: 'exp-6', date: '2026-07-05', category: 'Other', amount: 15.00, note: 'Phone mount for dashboard' },
  { id: 'exp-7', date: '2026-07-02', category: 'Fuel', amount: 28.50, note: 'Shell gas fill up' },
];

interface DashboardProps {
  activeTab: string;
  setActiveTab?: (tab: string) => void;
  notifications?: NotificationItem[];
  setNotifications?: React.Dispatch<React.SetStateAction<NotificationItem[]>>;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  activeTab, 
  setActiveTab,
  notifications,
  setNotifications
}) => {
  // Expenses State
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem('deliverai_expenses');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse expenses from local storage", e);
      }
    }
    // Set default initial data
    localStorage.setItem('deliverai_expenses', JSON.stringify(INITIAL_EXPENSES));
    return INITIAL_EXPENSES;
  });

  // Save expenses to localStorage when updated
  useEffect(() => {
    localStorage.setItem('deliverai_expenses', JSON.stringify(expenses));
  }, [expenses]);

  // Form State
  const [newExpenseCategory, setNewExpenseCategory] = useState<Expense['category']>('Fuel');
  const [newExpenseAmount, setNewExpenseAmount] = useState<string>('');
  const [newExpenseNote, setNewExpenseNote] = useState<string>('');
  const [newExpenseDate, setNewExpenseDate] = useState<string>(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  });

  // Helper calculation inputs
  const earningsToday = 142.80;
  const earningsWeekly = 850.00;
  const earningsMonthly = 3400.00;

  // Emergency states
  const [sosState, setSosState] = useState<'idle' | 'countdown' | 'active'>('idle');
  const [countdown, setCountdown] = useState(5);
  const [countdownTimer, setCountdownTimer] = useState<any>(null);

  const startSosCountdown = () => {
    if (sosState !== 'idle') return;
    setSosState('countdown');
    setCountdown(5);
    
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setSosState('active');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    setCountdownTimer(timer);
  };

  const cancelSosCountdown = () => {
    if (countdownTimer) {
      clearInterval(countdownTimer);
      setCountdownTimer(null);
    }
    setSosState('idle');
    setCountdown(5);
  };

  const deactivateSos = () => {
    setSosState('idle');
    setCountdown(5);
  };

  useEffect(() => {
    return () => {
      if (countdownTimer) {
        clearInterval(countdownTimer);
      }
    };
  }, [countdownTimer]);

  // Credentials settings state
  const [geminiApiKey, setGeminiApiKey] = useState<string | null>(localStorage.getItem('gemini_api_key'));
  const [googleMapsApiKey, setGoogleMapsApiKey] = useState<string | null>(localStorage.getItem('google_maps_api_key'));
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(!localStorage.getItem('gemini_api_key'));

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const initialMsgs: ChatMessage[] = [];
    const hasKey = localStorage.getItem('gemini_api_key');
    if (!hasKey) {
      initialMsgs.push({
        sender: 'system',
        text: 'Guardian AI is running in Smart Demo Mode.',
        time: '19:40'
      });
    }
    initialMsgs.push({ 
      sender: 'ai', 
      text: 'Hello Karthik! I am your Guardian AI assistant. I have mapped your shift today. Currently, demand is high near the Downtown Grill House. Rain expected in 15 mins. Let me know if you need route help or parking tips!', 
      time: '19:40' 
    });
    return initialMsgs;
  });
  const [chatInput, setChatInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Voice Input (Speech Recognition) state
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Geolocation & POI states
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [pois, setPois] = useState<any[]>([]);
  const [selectedPoi, setSelectedPoi] = useState<any | null>(null);
  const [activeFilters, setActiveFilters] = useState({
    restroom: true,
    fuel: true,
    parking: true,
    water: true,
  });

  // Map Animation simulation properties
  const [currentRouteStep, setCurrentRouteStep] = useState(0);

  const routePoints = [
    { x: 120, y: 150, label: 'Grill House (Pickup)' },
    { x: 220, y: 150, label: 'Main Crossing' },
    { x: 220, y: 280, label: 'Avoided Construction' },
    { x: 380, y: 280, label: 'Park Ave Turn' },
    { x: 380, y: 110, label: 'Customer Dropoff (Active)' },
  ];

  // Geolocation API loader
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(loc);
        },
        (error) => {
          console.warn("Geolocation denied or failed. Defaulting to San Francisco.", error);
          setUserLocation({ lat: 37.7749, lng: -122.4194 }); // SF
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      setUserLocation({ lat: 37.7749, lng: -122.4194 });
    }
  }, []);

  const getNearestHospital = () => {
    if (!userLocation) {
      return {
        name: "City General Emergency Hospital (Demo)",
        distance: "0.8 mi",
        address: "740 Main St, Downtown",
        responseTime: "4 mins"
      };
    }
    
    const lat = userLocation.lat;
    const lng = userLocation.lng;
    
    const hospitals = [
      { name: "St. Francis Memorial Hospital", lat: 37.7895, lng: -122.4167, address: "900 Hyde St, San Francisco, CA", responseTime: "5 mins" },
      { name: "Zuckerberg San Francisco General Hospital", lat: 37.7568, lng: -122.4056, address: "1001 Potrero Ave, San Francisco, CA", responseTime: "7 mins" },
      { name: "UCSF Medical Center", lat: 37.7628, lng: -122.4582, address: "505 Parnassus Ave, San Francisco, CA", responseTime: "9 mins" },
      { name: "Mercy General Hospital", lat: 38.5631, lng: -121.4646, address: "4001 J St, Sacramento, CA", responseTime: "6 mins" },
      { name: "Valley Medical Center", lat: 37.3131, lng: -121.9317, address: "751 S Bascom Ave, San Jose, CA", responseTime: "8 mins" }
    ];
    
    let closest = hospitals[0];
    let minDistance = Infinity;
    
    hospitals.forEach(h => {
      const dist = Math.sqrt(Math.pow(h.lat - lat, 2) + Math.pow(h.lng - lng, 2));
      if (dist < minDistance) {
        minDistance = dist;
        closest = h;
      }
    });
    
    if (minDistance > 0.5) {
      return {
        name: "Community Emergency Center (Demo)",
        distance: `${(Math.random() * 1.5 + 0.4).toFixed(1)} mi`,
        address: `${Math.floor(lat * 10) + 120} Medical Plaza Dr`,
        responseTime: `${Math.floor(Math.random() * 5 + 4)} mins`
      };
    }
    
    const distanceMiles = (minDistance * 69).toFixed(1);
    
    return {
      name: closest.name,
      distance: `${distanceMiles} mi`,
      address: closest.address,
      responseTime: closest.responseTime
    };
  };

  // Update POIs dynamically when location changes
  useEffect(() => {
    if (userLocation) {
      const mockPois = [
        {
          id: 'r1',
          name: 'Starbucks Restroom',
          type: 'restroom',
          lat: userLocation.lat + 0.002,
          lng: userLocation.lng - 0.003,
          details: 'Passcode: 4412#. Driver-friendly, clean.'
        },
        {
          id: 'r2',
          name: 'Shell Restroom',
          type: 'restroom',
          lat: userLocation.lat - 0.003,
          lng: userLocation.lng + 0.004,
          details: 'Open 24/7. Key at register.'
        },
        {
          id: 'f1',
          name: 'Shell Gas Station',
          type: 'fuel',
          lat: userLocation.lat - 0.003,
          lng: userLocation.lng + 0.004,
          details: 'Regular: $3.45/gal. EV Charging available.'
        },
        {
          id: 'f2',
          name: 'Chevron Station',
          type: 'fuel',
          lat: userLocation.lat + 0.004,
          lng: userLocation.lng - 0.004,
          details: 'Regular: $3.51/gal. Free air pump.'
        },
        {
          id: 'p1',
          name: 'Zone B Loading Parking',
          type: 'parking',
          lat: userLocation.lat + 0.001,
          lng: userLocation.lng + 0.001,
          details: '10 min delivery grace period. Near Grill House.'
        },
        {
          id: 'p2',
          name: 'Rear Alley Parking Space',
          type: 'parking',
          lat: userLocation.lat - 0.002,
          lng: userLocation.lng - 0.001,
          details: 'Safe spot. Behind main street shops.'
        },
        {
          id: 'w1',
          name: 'Grill House Water Refill',
          type: 'water',
          lat: userLocation.lat + 0.0015,
          lng: userLocation.lng + 0.001,
          details: 'Free cups & ice for delivery partners.'
        },
        {
          id: 'w2',
          name: 'Central Plaza Fountain',
          type: 'water',
          lat: userLocation.lat + 0.005,
          lng: userLocation.lng + 0.003,
          details: 'Public purified drinking fountain.'
        }
      ];
      setPois(mockPois);
    }
  }, [userLocation]);

  // Speech Recognition API setup
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech Recognition Error:", event.error);
        setIsListening(false);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setChatInput((prev) => (prev ? prev + ' ' + transcript : transcript));
        }
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const handleToggleListen = () => {
    if (!recognitionRef.current) {
      alert("Speech Recognition API is not supported in this browser. Please try Google Chrome or Microsoft Edge.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  // Keep route pointer animation loop running in background
  useEffect(() => {
    if (activeTab === 'map') {
      const interval = setInterval(() => {
        setCurrentRouteStep((prev) => {
          return (prev + 1) % routePoints.length;
        });
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [activeTab]);

  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isAiLoading]);

  // Save Credentials from Settings modal
  const handleSaveKeys = (geminiKey: string, mapsKey: string) => {
    setGeminiApiKey(geminiKey);
    setGoogleMapsApiKey(mapsKey);
    setIsDemoMode(!geminiKey);
  };

  // Expense Handlers
  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(newExpenseAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      alert("Please enter a valid amount greater than 0");
      return;
    }
    const newExp: Expense = {
      id: `exp-${Date.now()}`,
      category: newExpenseCategory,
      amount: amountNum,
      note: newExpenseNote.trim() || undefined,
      date: newExpenseDate
    };
    setExpenses(prev => [newExp, ...prev]);
    setNewExpenseAmount('');
    setNewExpenseNote('');
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  // AI Chat Submission
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isAiLoading) return;

    const userMsg = chatInput;
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Add user message
    const updatedMessages: ChatMessage[] = [...messages, { sender: 'user', text: userMsg, time: timeStr }];
    setMessages(updatedMessages);
    setChatInput('');
    setIsAiLoading(true);

    let botResponse = '';
    let failedToConnect = false;

    if (!geminiApiKey || isDemoMode) {
      await new Promise((resolve) => setTimeout(resolve, 800));
      botResponse = getMockResponse(userMsg);
    } else {
      try {
        botResponse = await askGuardianAI(updatedMessages, geminiApiKey);
      } catch (err) {
        console.warn("Gemini API is unavailable. Silently falling back to Demo Mode.", err);
        failedToConnect = true;
        botResponse = getMockResponse(userMsg);
      }
    }

    if (failedToConnect) {
      setIsDemoMode(true);
      setMessages((prev) => [
        ...prev,
        { sender: 'system', text: "Guardian AI is running in Smart Demo Mode.", time: timeStr },
        { sender: 'ai', text: botResponse, time: timeStr }
      ]);
    } else {
      setMessages((prev) => [...prev, { sender: 'ai', text: botResponse, time: timeStr }]);
    }
    setIsAiLoading(false);
  };

  const toggleFilter = (filterKey: 'restroom' | 'fuel' | 'parking' | 'water') => {
    setActiveFilters(prev => ({
      ...prev,
      [filterKey]: !prev[filterKey]
    }));
  };

  // Expense calculation helpers
  const parseDate = (dStr: string) => {
    const [y, m, d] = dStr.split('-').map(Number);
    return new Date(y, m - 1, d);
  };
  const todayRef = parseDate('2026-07-13');

  const todayExpensesTotal = expenses
    .filter(e => e.date === '2026-07-13')
    .reduce((sum, e) => sum + e.amount, 0);

  const weeklyExpensesTotal = expenses
    .filter(e => {
      const expDate = parseDate(e.date);
      const diffTime = todayRef.getTime() - expDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays < 7;
    })
    .reduce((sum, e) => sum + e.amount, 0);

  const monthlyExpensesTotal = expenses
    .filter(e => {
      const expDate = parseDate(e.date);
      const diffTime = todayRef.getTime() - expDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays < 30;
    })
    .reduce((sum, e) => sum + e.amount, 0);

  const netProfitToday = earningsToday - todayExpensesTotal;
  const netProfitWeekly = earningsWeekly - weeklyExpensesTotal;
  const netProfitMonthly = earningsMonthly - monthlyExpensesTotal;

  const monthlyProfitMargin = earningsMonthly > 0 
    ? ((netProfitMonthly / earningsMonthly) * 100).toFixed(1)
    : '0.0';

  const categories: Expense['category'][] = ['Fuel', 'Parking', 'Food', 'Toll', 'Vehicle Maintenance', 'Other'];
  const categoryTotals = categories.reduce((acc, cat) => {
    acc[cat] = expenses.filter(e => e.category === cat).reduce((sum, e) => sum + e.amount, 0);
    return acc;
  }, {} as Record<Expense['category'], number>);

  const totalExpensesAllTime = expenses.reduce((sum, e) => sum + e.amount, 0);

  // Dynamic AI Recommendations
  const getAiRecommendations = () => {
    const recs = [];
    const fuelTotal = categoryTotals['Fuel'] || 0;
    const parkingTotal = categoryTotals['Parking'] || 0;

    if (fuelTotal > 40) {
      recs.push("Fuel expenses are higher than average. Consider matching deliveries in similar directions.");
    } else {
      recs.push("Fuel efficiency is currently stable. Maintain steady driving to keep it optimal.");
    }

    if (parkingTotal > 10) {
      recs.push("Parking costs increased this week. Utilize free loading zones where possible.");
    }

    recs.push("Reduce idle time during stops to minimize overall fuel waste.");
    recs.push("You can increase your daily profit by 8% by optimizing routes using the Smart Route Map.");
    return recs;
  };

  return (
    <div className="flex-1 p-4 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
      {/* Settings Modal */}
      <ApiSettings 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        onSave={handleSaveKeys} 
      />

      {/* Tab Switcher Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            {activeTab === 'overview' && 'Shift Overview'}
            {activeTab === 'driver_profile' && 'Driver Profile & Performance'}
            {activeTab === 'map' && 'Guardian AI Live Routing'}
            {activeTab === 'notifications' && 'Notification Center'}
            {activeTab === 'earnings' && 'Shift Earnings Hub'}
            {activeTab === 'expenses' && 'Smart Expense Tracker'}
            {activeTab === 'chat' && (
              <span className="flex items-center gap-2">
                Hands-Free AI Companion
                {isDemoMode && (
                  <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-bold bg-blue-500/10 border border-blue-500/25 text-blue-400 rounded-md tracking-wide uppercase">
                    Demo Mode
                  </span>
                )}
              </span>
            )}
            {activeTab === 'emergency' && 'Emergency SOS Center'}
          </h2>
          <p className="text-xs text-white/50">
            {activeTab === 'overview' && 'Real-time performance & active alerts.'}
            {activeTab === 'driver_profile' && 'View and manage credentials, interactive metrics, and badges.'}
            {activeTab === 'map' && 'Dynamic weather overlay & smart navigation.'}
            {activeTab === 'notifications' && 'Interactive alerts feed, priority logs, and configuration.'}
            {activeTab === 'earnings' && 'Detailed income stats & platform compare.'}
            {activeTab === 'expenses' && 'Track dynamic delivery costs, profit margins & category analytics.'}
            {activeTab === 'chat' && 'Ask parking, traffic status, or restaurant tips.'}
            {activeTab === 'emergency' && 'Instant dispatcher notification & hospital tracking.'}
          </p>
        </div>

        {/* Sync indicator & Settings button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/8 text-white/80 text-xs font-semibold transition-colors"
          >
            <Settings className="w-3.5 h-3.5 text-brand-orange" />
            <span>API Credentials</span>
          </button>
          
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-ping"></span>
            Live Sync
          </div>
        </div>
      </div>

      {/* DRIVER PROFILE TAB */}
      {activeTab === 'driver_profile' && (
        <DriverProfile />
      )}

      {/* NOTIFICATION CENTER TAB */}
      {activeTab === 'notifications' && (
        <NotificationCenter 
          notifications={notifications || []} 
          setNotifications={setNotifications || (() => {})} 
        />
      )}

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Quick Metrics grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <GlassCard className="p-4 flex flex-col justify-between">
              <span className="text-xs font-semibold text-white/50 uppercase">Today's Earnings</span>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-2xl md:text-3xl font-extrabold text-white">$142.80</span>
                <span className="text-xs text-emerald-400 font-semibold flex items-center">+18% vs target</span>
              </div>
            </GlassCard>

            <GlassCard className="p-4 flex flex-col justify-between">
              <span className="text-xs font-semibold text-white/50 uppercase">Distance Covered</span>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-2xl md:text-3xl font-extrabold text-white">48.3 mi</span>
                <span className="text-xs text-brand-orange font-semibold">Fuel Econ: Excellent</span>
              </div>
            </GlassCard>

            <GlassCard className="p-4 flex flex-col justify-between">
              <span className="text-xs font-semibold text-white/50 uppercase">Hours Active</span>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-2xl md:text-3xl font-extrabold text-white">4.5h</span>
                <span className="text-xs text-white/50">Avg $31.70/hr</span>
              </div>
            </GlassCard>

            <GlassCard className="p-4 flex flex-col justify-between">
              <span className="text-xs font-semibold text-white/50 uppercase">Partner Rating</span>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-2xl md:text-3xl font-extrabold text-white">4.95 ⭐</span>
                <span className="text-xs text-amber-400 font-semibold flex items-center">Elite Badge</span>
              </div>
            </GlassCard>
          </div>

          {/* Active Job & AI Tip Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <GlassCard className="lg:col-span-2 space-y-4">
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <Zap className="w-5 h-5 text-brand-orange animate-pulse" />
                  Active Deliveries
                </h3>
                <span className="text-xs font-semibold bg-brand-orange-alpha text-brand-orange px-2 py-0.5 rounded-full">
                  1 Order In Transit
                </span>
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/5">
                <div className="space-y-1">
                  <span className="text-[10px] text-white/40 block">DELIVERY PARTNER IN-APP ROUTE</span>
                  <div className="text-sm font-bold text-white">Order #20938 - Double Bacon Combo</div>
                  <div className="text-xs text-white/70 flex items-center gap-1.5 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-brand-orange" />
                    Grill House ➔ 1422 Park Road
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-white/40 block">EST. PAYOUT</span>
                  <div className="text-lg font-bold text-brand-orange">$14.50</div>
                  <span className="text-[10px] text-emerald-400 font-medium">+$2.00 surge tip</span>
                </div>
              </div>

              {/* Progress Tracker */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold text-white/60">
                  <span>Picked up order</span>
                  <span>En-route (3 mins left)</span>
                  <span>Dropoff</span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full w-2/3 bg-brand-orange rounded-full animate-pulse-subtle"></div>
                </div>
              </div>
            </GlassCard>

            {/* AI Guardian Alert Center */}
            <GlassCard className="space-y-4 border border-brand-orange/20 bg-brand-orange-alpha/5">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-brand-orange animate-float" />
                Guardian Alerts
              </h3>
              
              <div className="space-y-3">
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-2.5">
                  <CloudRain className="w-4 h-4 text-blue-400 shrink-0 mt-0.5 animate-bounce" />
                  <div>
                    <h4 className="text-xs font-bold text-white">Downpour starting in 12 mins</h4>
                    <p className="text-[10px] text-white/60 leading-relaxed mt-0.5">Route downtown is starting to slow. Put on water gear and take extra grip routes.</p>
                  </div>
                </div>

                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-white">Construction Detour Tip</h4>
                    <p className="text-[10px] text-white/60 leading-relaxed mt-0.5">Avoid Main St near Broadway. Route via 4th Ave to avoid a 5-minute wait.</p>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Emergency SOS Quick Action Card */}
          <GlassCard className={`border transition-all duration-300 ${sosState === 'active' ? 'border-red-500 bg-red-950/20 shadow-lg shadow-red-900/30 animate-pulse-subtle' : 'border-red-500/20 bg-red-950/5 hover:border-red-500/40'}`}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${sosState === 'active' ? 'bg-red-600 text-white animate-pulse' : 'bg-red-500/20 text-red-500'}`}>
                  <AlertOctagon className={`w-6 h-6 ${sosState === 'countdown' ? 'animate-bounce' : ''}`} />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base flex items-center gap-2">
                    Emergency SOS
                    {sosState === 'active' && (
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-red-600 text-white font-extrabold animate-pulse">ACTIVE</span>
                    )}
                    {sosState === 'countdown' && (
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500 text-black font-extrabold animate-pulse">ARMING IN {countdown}s</span>
                    )}
                  </h3>
                  <p className="text-xs text-white/60">
                    {sosState === 'active' 
                      ? 'SOS dispatch active. Coordinates transmitted, emergency services notified.' 
                      : sosState === 'countdown'
                        ? 'Triggering emergency dispatch center. Tap Cancel to abort.'
                        : 'Accident or emergency? Instantly notify dispatch & map nearest medical services.'
                    }
                  </p>
                </div>
              </div>
              
              <div className="flex gap-2 w-full md:w-auto">
                {sosState === 'idle' && (
                  <>
                    <button
                      onClick={startSosCountdown}
                      className="flex-1 md:flex-none px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-red-600/20 active:scale-95"
                    >
                      Trigger SOS
                    </button>
                    {setActiveTab && (
                      <button
                        onClick={() => setActiveTab('emergency')}
                        className="flex-1 md:flex-none px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-xs rounded-xl transition-all"
                      >
                        Open SOS Center
                      </button>
                    )}
                  </>
                )}
                {sosState === 'countdown' && (
                  <button
                    onClick={cancelSosCountdown}
                    className="w-full md:w-auto px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl transition-all border border-white/10"
                  >
                    Cancel SOS ({countdown}s)
                  </button>
                )}
                {sosState === 'active' && (
                  <>
                    <button
                      onClick={deactivateSos}
                      className="flex-1 md:flex-none px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all"
                    >
                      I'm Safe (Cancel Alert)
                    </button>
                    {setActiveTab && (
                      <button
                        onClick={() => setActiveTab('emergency')}
                        className="flex-1 md:flex-none px-5 py-2.5 bg-red-900/30 hover:bg-red-900/50 text-white font-semibold text-xs rounded-xl transition-all border border-red-500/20"
                      >
                        View Dispatch Info
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      {/* MAP TAB */}
      {activeTab === 'map' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 flex flex-col gap-4">
            {/* Filter Toggle Buttons */}
            <div className="flex flex-wrap gap-2 bg-white/5 p-2 rounded-xl border border-white/5">
              <button 
                onClick={() => toggleFilter('parking')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeFilters.parking ? 'bg-brand-orange text-white' : 'bg-white/5 text-white/60 hover:text-white'}`}
              >
                <span>🅿️</span> Parking
              </button>
              <button 
                onClick={() => toggleFilter('restroom')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeFilters.restroom ? 'bg-blue-600 text-white' : 'bg-white/5 text-white/60 hover:text-white'}`}
              >
                <span>🚻</span> Restrooms
              </button>
              <button 
                onClick={() => toggleFilter('fuel')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeFilters.fuel ? 'bg-amber-600 text-white' : 'bg-white/5 text-white/60 hover:text-white'}`}
              >
                <span>⛽</span> Fuel Stations
              </button>
              <button 
                onClick={() => toggleFilter('water')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeFilters.water ? 'bg-cyan-600 text-white' : 'bg-white/5 text-white/60 hover:text-white'}`}
              >
                <span>💧</span> Drinking Water
              </button>
            </div>

            {/* Map Container */}
            <GlassCard className="h-[450px] relative p-0 overflow-hidden flex flex-col justify-between border border-white/10 shadow-lg">
              <MapContainer 
                googleMapsApiKey={googleMapsApiKey}
                userLocation={userLocation}
                pois={pois}
                activeFilters={activeFilters}
                onSelectPoi={(poi) => setSelectedPoi(poi)}
              />

              {/* Selected POI Details popup overlay */}
              {selectedPoi && (
                <div className="absolute bottom-16 left-4 right-4 z-30 p-3 bg-brand-dark/95 backdrop-blur-md border border-brand-orange/30 rounded-xl flex justify-between items-start shadow-xl">
                  <div className="flex-1">
                    <span className="text-[9px] uppercase font-extrabold text-brand-orange tracking-wider">{selectedPoi.type}</span>
                    <h4 className="text-sm font-bold text-white mt-0.5">{selectedPoi.name}</h4>
                    <p className="text-xs text-white/70 mt-1">{selectedPoi.details}</p>
                  </div>
                  <button 
                    onClick={() => setSelectedPoi(null)}
                    className="text-white/40 hover:text-white text-xs px-2 py-1 rounded bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    Dismiss
                  </button>
                </div>
              )}

              {/* Floating details banner */}
              <div className="z-10 p-4 bg-brand-dark/95 border-b border-white/5 flex justify-between items-center w-full">
                <div>
                  <span className="text-[10px] text-white/50 uppercase block font-bold tracking-wider">Active GPS Reference</span>
                  <span className="text-sm font-bold text-white">
                    {userLocation ? `${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}` : 'Locating...'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-white/50 uppercase block font-bold tracking-wider">Navigation Status</span>
                  <span className="text-sm font-bold text-brand-orange">Optimized Route Live</span>
                </div>
              </div>

              {/* Map Legends info overlay */}
              <div className="z-10 p-4 bg-black/40 backdrop-blur-md border-t border-white/5 flex flex-wrap gap-4 text-[10px] text-white/60">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-brand-orange"></span> Your location</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Restrooms</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Fuel</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-cyan-500"></span> Drinking Water</span>
              </div>
            </GlassCard>
          </div>

          {/* Navigation instruction steps list */}
          <div className="space-y-4">
            <GlassCard className="h-full">
              <h3 className="font-bold text-white text-base mb-4 flex items-center gap-2">
                <Navigation className="w-5 h-5 text-brand-orange" />
                Turn-by-Turn GPS
              </h3>

              <div className="space-y-3">
                {routePoints.map((pt, idx) => (
                  <div 
                    key={idx} 
                    className={`
                      p-3 rounded-xl border flex items-center justify-between
                      ${currentRouteStep === idx 
                        ? 'bg-brand-orange-alpha border-brand-orange/30 text-white font-semibold' 
                        : 'bg-white/5 border-white/5 text-white/60'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold">
                        {idx + 1}
                      </span>
                      <span className="text-xs">{pt.label}</span>
                    </div>
                    {currentRouteStep === idx && <ChevronRight className="w-4 h-4 text-brand-orange" />}
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        </div>
      )}

      {/* EARNINGS TAB */}
      {activeTab === 'earnings' && (
        <div className="space-y-6">
          {/* Earnings performance overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <GlassCard className="space-y-3">
              <span className="text-xs font-bold text-white/50 uppercase">Shift Target Payout</span>
              <div className="text-3xl font-extrabold text-white">$150.00</div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-white/70 font-semibold">
                  <span>95% Achieved</span>
                  <span>$7.20 Left</span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full w-[95%] bg-emerald-400 rounded-full"></div>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="space-y-2">
              <span className="text-xs font-bold text-white/50 uppercase">Surge Bonuses Earned</span>
              <div className="text-3xl font-extrabold text-brand-orange">+$32.50</div>
              <p className="text-[10px] text-white/60">Includes weather surcharge and downtown rush hour multiplier.</p>
            </GlassCard>

            <GlassCard className="space-y-2">
              <span className="text-xs font-bold text-white/50 uppercase">Estimated Expense (Fuel/Tax)</span>
              <div className="text-3xl font-extrabold text-white/80">$12.40</div>
              <span className="text-xs text-emerald-400 font-bold">Net Earnings: $130.40</span>
            </GlassCard>
          </div>

          {/* Platform Performance metrics */}
          <GlassCard className="space-y-4">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <h3 className="font-bold text-white text-base">Active App Rates comparison</h3>
              <span className="text-xs text-white/50">Surge hotspots detected in your radius</span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-orange-600/20 flex items-center justify-center font-bold text-orange-400 text-sm">DD</div>
                  <div>
                    <h4 className="text-sm font-bold text-white">DoorDash</h4>
                    <span className="text-xs text-emerald-400 font-semibold">Surge Zone: Downtown (+ $4.00)</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-white/50 block">Avg Offer</span>
                  <span className="text-sm font-bold text-white">$14.20/order</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600/20 flex items-center justify-center font-bold text-emerald-400 text-sm">UE</div>
                  <div>
                    <h4 className="text-sm font-bold text-white">UberEats</h4>
                    <span className="text-xs text-emerald-400 font-semibold">Surge Zone: Central Square (+ $5.50)</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-white/50 block">Avg Offer</span>
                  <span className="text-sm font-bold text-white">$16.80/order</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-red-600/20 flex items-center justify-center font-bold text-red-400 text-sm">GH</div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Grubhub</h4>
                    <span className="text-xs text-white/40">Surge Zone: None active</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-white/50 block">Avg Offer</span>
                  <span className="text-sm font-bold text-white/70">$10.50/order</span>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      {/* CHAT TAB */}
      {activeTab === 'chat' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[480px] md:h-[550px]">
          {/* Main Chat Box */}
          <GlassCard className="lg:col-span-3 flex flex-col justify-between h-full p-0 overflow-hidden relative">
            {/* Chat Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {messages.map((msg, index) => {
                if (msg.sender === 'system') {
                  return (
                    <div key={index} className="flex justify-center my-2 animate-fade-in">
                      <div className="bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold px-4 py-2 rounded-full shadow-sm max-w-[90%] text-center flex items-center justify-center gap-2">
                        <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></span>
                        {msg.text}
                      </div>
                    </div>
                  );
                }
                return (
                  <div 
                    key={index}
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`
                      max-w-[75%] rounded-2xl p-4 text-sm shadow-md
                      ${msg.sender === 'user' 
                        ? 'bg-brand-orange text-white rounded-br-none' 
                        : 'bg-white/5 text-white/90 border border-white/8 rounded-bl-none'
                      }
                    `}>
                      <p className="leading-relaxed whitespace-pre-line">{msg.text}</p>
                      <span className="text-[9px] text-white/40 block text-right mt-1.5">{msg.time}</span>
                    </div>
                  </div>
                );
              })}
              
              {/* Typing indicator */}
              {isAiLoading && (
                <div className="flex justify-start">
                  <div className="max-w-[75%] rounded-2xl p-4 text-sm shadow-md bg-white/5 text-white/60 border border-white/8 rounded-bl-none flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-brand-orange" />
                    <span>Guardian is thinking...</span>
                  </div>
                </div>
              )}

              <div ref={chatBottomRef} />
            </div>

            {/* Chat Input form */}
            <form onSubmit={handleSendMessage} className="p-4 bg-brand-dark/95 border-t border-white/5 flex gap-2 w-full items-center">
              {/* Mic Input Trigger */}
              <button
                type="button"
                onClick={handleToggleListen}
                className={`p-3 rounded-xl shadow-lg border transition-all duration-300 shrink-0 ${
                  isListening 
                    ? 'bg-red-500 border-red-400 text-white animate-pulse' 
                    : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                }`}
                title={isListening ? "Listening... click to stop" : "Voice Input (Speech-to-Text)"}
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder={isListening ? "Listening... Speak clearly" : "Ask about weather, parking tips, payouts..."}
                className="flex-1 py-3 px-4 rounded-xl glass-input text-sm"
                disabled={isListening}
              />
              <button
                type="submit"
                disabled={isAiLoading || !chatInput.trim()}
                className="p-3 bg-brand-orange hover:bg-brand-orange-hover text-white rounded-xl shadow-lg transition-all duration-300 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </GlassCard>

          {/* Quick AI Suggestions Panel */}
          <div className="hidden lg:flex flex-col gap-4 h-full">
            <GlassCard className="flex-1">
              <h3 className="font-bold text-white text-sm mb-4 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-brand-orange" />
                Quick Commands
              </h3>
              <div className="space-y-2">
                <button 
                  onClick={() => {
                    setChatInput("Check current rain timing & hazards");
                  }} 
                  className="w-full p-3 bg-white/5 hover:bg-white/10 border border-white/5 text-xs text-white/80 rounded-xl text-left transition-colors"
                >
                  "Check weather status"
                </button>
                <button 
                  onClick={() => {
                    setChatInput("Where should I park at Downtown Grill House?");
                  }}
                  className="w-full p-3 bg-white/5 hover:bg-white/10 border border-white/5 text-xs text-white/80 rounded-xl text-left transition-colors"
                >
                  "Find pickup parking spot"
                </button>
                <button 
                  onClick={() => {
                    setChatInput("Show active platform surge bonuses");
                  }}
                  className="w-full p-3 bg-white/5 hover:bg-white/10 border border-white/5 text-xs text-white/80 rounded-xl text-left transition-colors"
                >
                  "Highest paying platforms now"
                </button>
                <button 
                  onClick={() => {
                    setChatInput("Where is a restroom or drinking water nearby?");
                  }}
                  className="w-full p-3 bg-white/5 hover:bg-white/10 border border-white/5 text-xs text-white/80 rounded-xl text-left transition-colors"
                >
                  "Find restrooms & water"
                </button>
              </div>
            </GlassCard>
          </div>
        </div>
      )}

      {/* EMERGENCY SOS TAB */}
      {activeTab === 'emergency' && (
        <div className="space-y-6 max-w-4xl mx-auto">
          {/* Main Emergency Control Panel */}
          <GlassCard className="relative overflow-hidden border border-red-500/25 bg-red-950/5 p-6 md:p-10 flex flex-col items-center text-center">
            
            {/* Status Indicator */}
            <div className="mb-6">
              <span className={`px-4 py-1.5 rounded-full text-xs font-extrabold tracking-widest uppercase flex items-center gap-2 border ${
                sosState === 'active'
                  ? 'bg-red-500/20 border-red-500 text-red-500 animate-pulse'
                  : sosState === 'countdown'
                    ? 'bg-amber-500/20 border-amber-500 text-amber-400 animate-bounce'
                    : 'bg-white/5 border-white/10 text-white/60'
              }`}>
                <Activity className="w-4 h-4" />
                Emergency Status: {sosState.toUpperCase()}
              </span>
            </div>

            {/* Central Alert Section or Trigger Button */}
            {sosState === 'idle' && (
              <div className="flex flex-col items-center space-y-6 my-4">
                <button
                  onClick={startSosCountdown}
                  className="w-48 h-48 rounded-full bg-gradient-to-br from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white flex flex-col items-center justify-center border-8 border-red-950/50 shadow-2xl shadow-red-900/50 hover:shadow-red-900/80 hover:scale-[1.03] active:scale-95 transition-all cursor-pointer relative group"
                >
                  {/* Glowing pulse ring around button */}
                  <div className="absolute inset-0 rounded-full border border-red-500/40 animate-ping opacity-75 group-hover:duration-300" />
                  <AlertOctagon className="w-16 h-16 text-white mb-2" />
                  <span className="font-extrabold text-2xl tracking-wider">SOS</span>
                  <span className="text-[10px] uppercase font-bold text-red-200 tracking-widest mt-1">Tap to Trigger</span>
                </button>
                <div className="max-w-md">
                  <h3 className="font-bold text-white text-lg">Pressing triggers a 5s countdown</h3>
                  <p className="text-xs text-white/50 mt-1 leading-relaxed">
                    Will instantly notify our 24/7 security dispatch, send your active coordinates, and message emergency contacts.
                  </p>
                </div>
              </div>
            )}

            {/* Countdown Overlay */}
            {sosState === 'countdown' && (
              <div className="flex flex-col items-center space-y-6 my-4 animate-fade-in">
                <div className="w-48 h-48 rounded-full bg-gradient-to-br from-amber-500 to-red-600 text-white flex flex-col items-center justify-center border-8 border-red-950/60 shadow-2xl relative">
                  <div className="absolute inset-0 rounded-full border-4 border-amber-500/30 animate-spin" style={{ borderTopColor: 'transparent' }} />
                  <span className="font-black text-6xl">{countdown}</span>
                  <span className="text-[10px] uppercase font-extrabold tracking-widest mt-2">Arming SOS</span>
                </div>
                <div className="max-w-md space-y-3">
                  <h3 className="font-bold text-amber-400 text-lg">SOS Trigger In Progress</h3>
                  <p className="text-xs text-white/70">
                    If this is a mistake, click the cancel button below immediately to prevent dispatch notification.
                  </p>
                  <button
                    onClick={cancelSosCountdown}
                    className="px-8 py-3 bg-white/10 hover:bg-white/15 text-white font-bold text-sm rounded-xl border border-white/10 transition-colors shadow-lg active:scale-95"
                  >
                    Cancel / Abort Trigger
                  </button>
                </div>
              </div>
            )}

            {/* Active Emergency Screen */}
            {sosState === 'active' && (
              <div className="w-full space-y-8 animate-pulse-subtle">
                <div className="flex flex-col items-center space-y-3">
                  <div className="w-24 h-24 rounded-full bg-red-600/20 border-2 border-red-500 flex items-center justify-center text-red-500">
                    <ShieldAlert className="w-12 h-12 animate-bounce" />
                  </div>
                  <h2 className="text-2xl font-black text-red-500 uppercase tracking-wide">Emergency SOS Triggered</h2>
                </div>

                {/* Status Messages */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                  <div className="p-4 bg-red-950/30 border border-red-500/30 rounded-xl space-y-2">
                    <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest block">Dispatch Action</span>
                    <p className="text-sm font-bold text-white">Emergency Services Dispatched</p>
                    <p className="text-xs text-white/70 leading-relaxed">
                      A safety agent is calling you now. If you cannot answer, local emergency services (911) will be guided to your coordinates.
                    </p>
                  </div>

                  <div className="p-4 bg-emerald-950/30 border border-emerald-500/30 rounded-xl space-y-2">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block">Emergency Contact</span>
                    <p className="text-sm font-bold text-white flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                      Contacts Notified
                    </p>
                    <p className="text-xs text-white/70 leading-relaxed">
                      SMS and email alert sent to your registered emergency contacts (Spouse/Guardian) with your live GPS location link.
                    </p>
                  </div>
                </div>

                {/* Dispatch Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-white/10 pt-6 text-left">
                  <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                    <span className="text-[10px] text-white/50 font-bold uppercase tracking-wider block">Current GPS</span>
                    <div className="text-sm font-extrabold text-white mt-1 flex items-center gap-1">
                      <MapPin className="w-4 h-4 text-red-500 shrink-0" />
                      <span className="truncate">
                        {userLocation ? `${userLocation.lat.toFixed(6)}, ${userLocation.lng.toFixed(6)}` : 'Locating...'}
                      </span>
                    </div>
                    <span className="text-[9px] text-white/40 block mt-1">Updated via Live GPS API</span>
                  </div>

                  <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                    <span className="text-[10px] text-white/50 font-bold uppercase tracking-wider block">Nearest Hospital</span>
                    <div className="text-sm font-extrabold text-white mt-1 flex items-center gap-1">
                      <Heart className="w-4 h-4 text-red-500 shrink-0" />
                      <span className="truncate">{getNearestHospital().name}</span>
                    </div>
                    <span className="text-[9px] text-white/40 block mt-1">{getNearestHospital().address} ({getNearestHospital().distance})</span>
                  </div>

                  <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                    <span className="text-[10px] text-white/50 font-bold uppercase tracking-wider block">Response ETA</span>
                    <div className="text-sm font-extrabold text-brand-orange mt-1 flex items-center gap-1">
                      <Clock className="w-4 h-4 text-brand-orange shrink-0" />
                      <span>{getNearestHospital().responseTime}</span>
                    </div>
                    <span className="text-[9px] text-white/40 block mt-1">Est. arrival of medical unit</span>
                  </div>
                </div>

                {/* Action button to declare safety */}
                <div className="pt-4 flex flex-col sm:flex-row justify-center gap-3">
                  <button
                    onClick={deactivateSos}
                    className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-xl transition-all shadow-md shadow-emerald-600/20 active:scale-95"
                  >
                    I'm Safe (Cancel Alert)
                  </button>
                  <a
                    href="tel:911"
                    className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-extrabold text-sm rounded-xl transition-all shadow-md shadow-red-600/20 text-center flex items-center justify-center gap-2"
                  >
                    <Phone className="w-4 h-4" />
                    Call 911 Directly
                  </a>
                </div>
              </div>
            )}
          </GlassCard>

          {/* Guidelines / Emergency protocol */}
          <GlassCard className="space-y-4">
            <h3 className="font-bold text-white text-base flex items-center gap-2 border-b border-white/5 pb-2.5">
              <ShieldAlert className="w-5 h-5 text-brand-orange" />
              Emergency Safety Checklist
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-white/70">
              <div className="space-y-1 p-3 bg-white/5 rounded-xl border border-white/5">
                <span className="font-bold text-white block">1. Pull over safely</span>
                <p className="leading-relaxed">Get your vehicle off the road. Turn on hazard lights to alert traffic.</p>
              </div>
              <div className="space-y-1 p-3 bg-white/5 rounded-xl border border-white/5">
                <span className="font-bold text-white block">2. Assess for injury</span>
                <p className="leading-relaxed">Do not make sudden movements if you suspect a spinal injury. Stay calm.</p>
              </div>
              <div className="space-y-1 p-3 bg-white/5 rounded-xl border border-white/5">
                <span className="font-bold text-white block">3. Keep app open</span>
                <p className="leading-relaxed">Our dispatch agents use your active app session to guide EMS vehicles.</p>
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      {/* EXPENSE TRACKER TAB */}
      {activeTab === 'expenses' && (
        <div className="space-y-6">
          {/* Expense Summary metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <GlassCard className="p-4 flex flex-col justify-between">
              <span className="text-xs font-semibold text-white/50 uppercase">Today's Expenses</span>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-2xl md:text-3xl font-extrabold text-white">${todayExpensesTotal.toFixed(2)}</span>
                <span className="text-xs text-emerald-400 font-semibold">Net Profit: ${netProfitToday.toFixed(2)}</span>
              </div>
            </GlassCard>

            <GlassCard className="p-4 flex flex-col justify-between">
              <span className="text-xs font-semibold text-white/50 uppercase">Weekly Expenses</span>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-2xl md:text-3xl font-extrabold text-white">${weeklyExpensesTotal.toFixed(2)}</span>
                <span className="text-xs text-emerald-400 font-semibold">Net Profit: ${netProfitWeekly.toFixed(2)}</span>
              </div>
            </GlassCard>

            <GlassCard className="p-4 flex flex-col justify-between">
              <span className="text-xs font-semibold text-white/50 uppercase">Monthly Expenses</span>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-2xl md:text-3xl font-extrabold text-white">${monthlyExpensesTotal.toFixed(2)}</span>
                <span className="text-xs text-white/50">Last 30 days</span>
              </div>
            </GlassCard>

            <GlassCard className="p-4 flex flex-col justify-between border border-emerald-500/20 bg-emerald-500/5">
              <span className="text-xs font-semibold text-white/50 uppercase">Net Profit (Monthly)</span>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-2xl md:text-3xl font-extrabold text-emerald-400">${netProfitMonthly.toFixed(2)}</span>
                <span className="text-xs text-emerald-400 font-semibold">{monthlyProfitMargin}% margin</span>
              </div>
            </GlassCard>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Quick Add Expense form */}
            <GlassCard className="space-y-4">
              <h3 className="font-bold text-white text-base flex items-center gap-2 border-b border-white/5 pb-3">
                <Plus className="w-5 h-5 text-brand-orange" />
                Quick Add Expense
              </h3>
              <form onSubmit={handleAddExpense} className="space-y-4">
                <div>
                  <label className="text-xs text-white/60 block mb-1 font-semibold">Category</label>
                  <select
                    value={newExpenseCategory}
                    onChange={(e) => setNewExpenseCategory(e.target.value as Expense['category'])}
                    className="w-full py-2.5 px-4 rounded-xl glass-input text-sm bg-brand-dark"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat} className="bg-brand-dark text-white">
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-white/60 block mb-1 font-semibold">Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={newExpenseAmount}
                    onChange={(e) => setNewExpenseAmount(e.target.value)}
                    required
                    className="w-full py-2.5 px-4 rounded-xl glass-input text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs text-white/60 block mb-1 font-semibold">Date</label>
                  <input
                    type="date"
                    value={newExpenseDate}
                    onChange={(e) => setNewExpenseDate(e.target.value)}
                    required
                    className="w-full py-2.5 px-4 rounded-xl glass-input text-sm bg-brand-dark"
                  />
                </div>

                <div>
                  <label className="text-xs text-white/60 block mb-1 font-semibold">Optional Note</label>
                  <input
                    type="text"
                    placeholder="e.g. Fuel up at Chevron"
                    value={newExpenseNote}
                    onChange={(e) => setNewExpenseNote(e.target.value)}
                    className="w-full py-2.5 px-4 rounded-xl glass-input text-sm"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-brand-orange hover:bg-brand-orange-hover text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-brand-orange/20 active:scale-95 flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Expense
                </button>
              </form>
            </GlassCard>

            {/* Analytics & Category Breakdown */}
            <GlassCard className="space-y-4">
              <h3 className="font-bold text-white text-base flex items-center gap-2 border-b border-white/5 pb-3">
                <TrendingDown className="w-5 h-5 text-brand-orange" />
                Category Analytics
              </h3>
              <div className="space-y-4">
                {categories.map((cat) => {
                  const amount = categoryTotals[cat] || 0;
                  const percent = totalExpensesAllTime > 0 
                    ? Math.round((amount / totalExpensesAllTime) * 100)
                    : 0;
                  return (
                    <div key={cat} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-white/80">
                        <span>{cat}</span>
                        <span>${amount.toFixed(2)} ({percent}%)</span>
                      </div>
                      <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-brand-orange rounded-full transition-all duration-500" 
                          style={{ width: `${percent}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Profit Margin Info */}
              <div className="mt-4 pt-3 border-t border-white/5 grid grid-cols-2 gap-2 text-xs">
                <div className="bg-white/5 p-3 rounded-xl border border-white/5 text-center">
                  <span className="text-white/40 block">Total Earnings</span>
                  <span className="font-extrabold text-white text-sm">${earningsMonthly.toFixed(2)}</span>
                </div>
                <div className="bg-white/5 p-3 rounded-xl border border-white/5 text-center">
                  <span className="text-white/40 block">Total Expenses</span>
                  <span className="font-extrabold text-white text-sm">${totalExpensesAllTime.toFixed(2)}</span>
                </div>
              </div>
            </GlassCard>

            {/* AI Insights & Recommendations */}
            <GlassCard className="space-y-4 border border-brand-orange/20 bg-brand-orange-alpha/5">
              <h3 className="font-bold text-white text-base flex items-center gap-2 border-b border-white/5 pb-3">
                <Sparkles className="w-5 h-5 text-brand-orange animate-float" />
                AI Expense Insights
              </h3>
              <div className="space-y-3">
                {getAiRecommendations().map((rec, idx) => (
                  <div key={idx} className="p-3 bg-white/5 border border-white/5 rounded-xl flex items-start gap-2.5">
                    <Sparkles className="w-4 h-4 text-brand-orange shrink-0 mt-0.5" />
                    <p className="text-xs text-white/85 leading-relaxed">{rec}</p>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>

          {/* Expense History Table */}
          <GlassCard className="space-y-4">
            <h3 className="font-bold text-white text-base flex items-center gap-2 border-b border-white/5 pb-3">
              <Receipt className="w-5 h-5 text-brand-orange" />
              Expense History
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-xs text-white/50 font-bold uppercase">
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Note</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm text-white/90">
                  {expenses.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-white/40">
                        No expenses recorded yet. Use the form to add one!
                      </td>
                    </tr>
                  ) : (
                    expenses.map((exp) => (
                      <tr key={exp.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-3 px-4 font-medium">{exp.date}</td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/10 text-white/80">
                            {exp.category}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-bold text-white">${exp.amount.toFixed(2)}</td>
                        <td className="py-3 px-4 text-white/70 max-w-[200px] truncate">{exp.note || '—'}</td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => handleDeleteExpense(exp.id)}
                            className="p-1.5 text-white/40 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                            title="Delete Expense"
                          >
                            <Trash2 className="w-4 h-4" />
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
      )}
    </div>
  );
};
