import { useState } from 'react';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { Dashboard } from './pages/Dashboard';
import { Sidebar } from './components/Sidebar';

type Page = 'landing' | 'login' | 'dashboard';

function App() {
  const [page, setPage] = useState<Page>('landing');
  const [activeTab, setActiveTab] = useState<string>('overview');

  const handleNavigate = (newPage: Page) => {
    setPage(newPage);
    if (newPage === 'dashboard') {
      setActiveTab('overview');
    }
  };

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
          />
          
          {/* Main Content Area */}
          <main className="flex-1 flex flex-col overflow-hidden">
            <Dashboard activeTab={activeTab} setActiveTab={setActiveTab} />
          </main>
        </div>
      )}
    </div>
  );
}

export default App;
