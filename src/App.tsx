import { useState, useEffect } from 'react';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { Dashboard } from './pages/Dashboard';
import { Sidebar } from './components/Sidebar';
import { 
  INITIAL_MOCK_NOTIFICATIONS, 
  MOCK_POOL 
} from './pages/NotificationCenter';
import type { NotificationItem } from './pages/NotificationCenter';

type Page = 'landing' | 'login' | 'dashboard';

function App() {
  const [page, setPage] = useState<Page>('landing');
  const [activeTab, setActiveTab] = useState<string>('overview');

  // Load and manage notifications state globally so badge count works real-time
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem('deliverai_notifications');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse notifications", e);
      }
    }
    // Set default initial data
    localStorage.setItem('deliverai_notifications', JSON.stringify(INITIAL_MOCK_NOTIFICATIONS));
    return INITIAL_MOCK_NOTIFICATIONS;
  });

  // Keep localStorage in sync
  useEffect(() => {
    localStorage.setItem('deliverai_notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Background Notification Simulator: every 20-40 seconds
  useEffect(() => {
    if (page !== 'dashboard') return;

    const runSimulation = () => {
      const delay = Math.floor(Math.random() * (40000 - 20000) + 20000); // 20-40s delay
      
      timerId = setTimeout(() => {
        setNotifications(prev => {
          const randomIndex = Math.floor(Math.random() * MOCK_POOL.length);
          const poolItem = MOCK_POOL[randomIndex];

          // Check if setting is enabled for sound and this category
          const settingsStr = localStorage.getItem('deliverai_notification_settings');
          let settings = { weather: true, traffic: true, earnings: true, ai: true, emergency: true, fuel: true, battery: true, parking: true, sound: true };
          if (settingsStr) {
            try {
              settings = JSON.parse(settingsStr);
            } catch (e) {}
          }

          const newNotif: NotificationItem = {
            id: `notif-${Date.now()}`,
            title: poolItem.title,
            description: poolItem.description,
            category: poolItem.category,
            priority: poolItem.priority,
            time: 'Just now',
            timestamp: Date.now(),
            read: false,
          };

          const updated = [newNotif, ...prev];

          // Sound chimes if enabled and the user is subscribed to that category
          if (settings.sound && settings[poolItem.category] !== false) {
            try {
              const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
              const oscillator = audioCtx.createOscillator();
              const gainNode = audioCtx.createGain();
              oscillator.connect(gainNode);
              gainNode.connect(audioCtx.destination);
              oscillator.type = 'sine';
              oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
              gainNode.gain.setValueAtTime(0.04, audioCtx.currentTime);
              oscillator.start();
              oscillator.stop(audioCtx.currentTime + 0.12);
            } catch (e) {
              // Ignore audio play restrictions
            }
          }

          return updated;
        });

        // Set up the next simulator execution
        runSimulation();
      }, delay);
    };

    let timerId: any = null;
    runSimulation();

    return () => {
      if (timerId) clearTimeout(timerId);
    };
  }, [page]);

  const handleNavigate = (newPage: Page) => {
    setPage(newPage);
    if (newPage === 'dashboard') {
      setActiveTab('overview');
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-brand-dark text-white flex flex-col">
      {page === 'landing' && <LandingPage onNavigate={handleNavigate} />}
      
      {page === 'login' && <LoginPage onNavigate={handleNavigate} />}
      
      {page === 'dashboard' && (
        <div className="flex flex-col md:flex-row min-h-screen">
          {/* Sidebar */}
          <Sidebar 
            onNavigate={handleNavigate} 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            unreadCount={unreadCount}
          />
          
          {/* Main Content Area */}
          <main className="flex-1 flex flex-col overflow-hidden">
            <Dashboard 
              activeTab={activeTab} 
              setActiveTab={setActiveTab} 
              notifications={notifications}
              setNotifications={setNotifications}
            />
          </main>
        </div>
      )}
    </div>
  );
}

export default App;
