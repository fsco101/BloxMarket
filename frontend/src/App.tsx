import React, { createContext, useContext, useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { AuthPage } from './components/AuthPage';
import { Dashboard } from './components/Dashboard';
import { TradingHub } from './components/TradingHub';
import { Wishlist } from './components/Wishlist';
import { MiddlemanDirectory } from './components/MiddlemanDirectory';
import { Forums } from './components/Forums';
import { UserProfile } from './components/UserProfile';
import { AdminPanel } from './components/AdminPanel';
import { EventsGiveaways } from './components/EventsGiveaways';

// Theme Context
const ThemeContext = createContext<{
  isDark: boolean;
  toggleTheme: () => void;
}>({
  isDark: false,
  toggleTheme: () => {}
});

export const useTheme = () => useContext(ThemeContext);

// Auth Context
const AuthContext = createContext<{
  user: any;
  login: (userData: any) => void;
  logout: () => void;
  isLoggedIn: boolean;
}>({
  user: null,
  login: () => {},
  logout: () => {},
  isLoggedIn: false
});

export const useAuth = () => useContext(AuthContext);

// App Context for navigation
const AppContext = createContext<{
  currentPage: string;
  setCurrentPage: (page: string) => void;
}>({
  currentPage: 'dashboard',
  setCurrentPage: () => {}
});

export const useApp = () => useContext(AppContext);

export default function App() {
  const [isDark, setIsDark] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('bloxmarket-theme');
    if (savedTheme === 'dark') {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
    if (!isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('bloxmarket-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('bloxmarket-theme', 'light');
    }
  };

  const login = (userData: any) => {
    setUser(userData);
    setIsLoggedIn(true);
    setCurrentPage('dashboard');
  };

  const logout = () => {
    setUser(null);
    setIsLoggedIn(false);
    setCurrentPage('auth');
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'trading-hub':
        return <TradingHub />;
      case 'wishlist':
        return <Wishlist />;
      case 'middleman':
        return <MiddlemanDirectory />;
      case 'forums':
        return <Forums />;
      case 'events':
        return <EventsGiveaways />;
      case 'profile':
        return <UserProfile />;
      case 'admin':
        return <AdminPanel />;
      default:
        return <Dashboard />;
    }
  };

  if (!isLoggedIn) {
    return (
      <ThemeContext.Provider value={{ isDark, toggleTheme }}>
        <AuthContext.Provider value={{ user, login, logout, isLoggedIn }}>
          <div className="min-h-screen bg-background text-foreground">
            <AuthPage />
          </div>
        </AuthContext.Provider>
      </ThemeContext.Provider>
    );
  }

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      <AuthContext.Provider value={{ user, login, logout, isLoggedIn }}>
        <AppContext.Provider value={{ currentPage, setCurrentPage }}>
          <div className="min-h-screen bg-background text-foreground flex">
            <Sidebar />
            <main className="flex-1 overflow-hidden">
              {renderCurrentPage()}
            </main>
          </div>
        </AppContext.Provider>
      </AuthContext.Provider>
    </ThemeContext.Provider>
  );
}