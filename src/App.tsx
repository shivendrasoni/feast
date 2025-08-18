import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navigation } from './components/Navigation';
import { MainPage } from './components/MainPage';
import { Settings } from './components/Settings';

const AppContent: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('main');
  const { loadSettings } = useApp();

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Handle hash-based routing
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      if (hash === 'settings') {
        setCurrentPage('settings');
      } else {
        setCurrentPage('main');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // Handle initial hash

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return (
    <div className="min-h-screen bg-background dark">
      <Navigation currentPage={currentPage} setCurrentPage={setCurrentPage} />
      {currentPage === 'main' ? <MainPage /> : <Settings />}
    </div>
  );
};

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;