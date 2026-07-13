import React, { useState } from 'react';
import { 
  Shield, 
  LayoutDashboard, 
  Map, 
  DollarSign, 
  MessageSquare, 
  LogOut, 
  Menu, 
  X,
  User,
  Settings,
  Bell,
  AlertOctagon
} from 'lucide-react';

interface SidebarProps {
  onNavigate: (page: 'landing' | 'login' | 'dashboard') => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  onNavigate,
  activeTab,
  setActiveTab,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { id: 'overview', name: 'Overview', icon: LayoutDashboard },
    { id: 'map', name: 'Smart Route Map', icon: Map },
    { id: 'earnings', name: 'Earnings Tracker', icon: DollarSign },
    { id: 'chat', name: 'AI Partner Chat', icon: MessageSquare },
    { id: 'emergency', name: 'Emergency SOS', icon: AlertOctagon },
  ];

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    setIsOpen(false);
  };

  const handleLogout = () => {
    onNavigate('landing');
    setIsOpen(false);
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 glass-panel border-b border-white/10 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-brand-orange animate-pulse" />
          <span className="font-bold text-white text-lg tracking-wider">DeliverAI Guardian</span>
        </div>
        <button 
          onClick={handleToggle} 
          className="text-white hover:text-brand-orange p-1 transition-colors"
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Overlay for Mobile */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed md:sticky top-0 left-0 bottom-0 z-40
        w-64 h-full md:h-screen
        glass-panel border-r border-white/8
        flex flex-col justify-between
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Logo and Brand */}
        <div className="p-6">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-brand-orange animate-float" />
            <div>
              <h1 className="text-xl font-extrabold text-white tracking-tight m-0 leading-none">DeliverAI</h1>
              <span className="text-[10px] uppercase font-bold text-brand-orange tracking-widest">Guardian</span>
            </div>
          </div>
          
          {/* Quick Notification alert mockup */}
          <div className="mt-6 flex items-center gap-2 p-3 bg-brand-orange-alpha rounded-xl border border-brand-orange/20">
            <Bell className="w-4 h-4 text-brand-orange shrink-0 animate-bounce" />
            <p className="text-[11px] text-white/80 leading-snug">AI Guard: Rain warning starting in 15 mins!</p>
          </div>
        </div>

        {/* Navigation Menu Links */}
        <nav className="flex-1 px-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const isEmergency = item.id === 'emergency';
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`
                  w-full flex items-center gap-4 px-4 py-3 rounded-xl
                  text-sm font-medium transition-all duration-200
                  ${isActive 
                    ? isEmergency
                      ? 'bg-red-600 text-white shadow-md shadow-red-600/20 scale-[1.02]'
                      : 'bg-brand-orange text-white shadow-md shadow-brand-orange/20 scale-[1.02]' 
                    : isEmergency
                      ? 'text-red-400 hover:bg-red-600/10 hover:text-red-300'
                      : 'text-white/70 hover:bg-white/5 hover:text-white'
                  }
                `}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : isEmergency ? 'text-red-500 animate-pulse' : 'text-brand-orange'}`} />
                {item.name}
              </button>
            );
          })}
        </nav>

        {/* User profile section & logout */}
        <div className="p-4 border-t border-white/5 space-y-2 bg-black/10">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center border border-white/15">
              <User className="w-5 h-5 text-white/85" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">Karthik S.</p>
              <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                Active Shift
              </span>
            </div>
            <button className="text-white/50 hover:text-white p-1 transition-colors">
              <Settings className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
};
