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
import { apiService } from './services/api';

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
  isLoading: boolean;
}>({
  user: null,
  login: () => {},
  logout: () => {},
  isLoggedIn: false,
  isLoading: true
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('bloxmarket-theme');
    if (savedTheme === 'dark') {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }

    // Check for existing authentication token
    const token = localStorage.getItem('bloxmarket-token');
    if (token) {
      // Verify token and get user data
      apiService.getCurrentUser()
        .then((userData) => {
          setUser(userData);
          setIsLoggedIn(true);
        })
        .catch((error) => {
          console.error('Token verification failed:', error);
          // Clear invalid token
          localStorage.removeItem('bloxmarket-token');
          apiService.clearToken();
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
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
    // Clear token from localStorage and API service
    localStorage.removeItem('bloxmarket-token');
    apiService.clearToken();
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

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4 shadow-lg animate-pulse">
            <span className="text-white font-bold text-2xl">BM</span>
          </div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <ThemeContext.Provider value={{ isDark, toggleTheme }}>
        <AuthContext.Provider value={{ user, login, logout, isLoggedIn, isLoading }}>
          <div className="min-h-screen bg-background text-foreground">
            <AuthPage />
          </div>
        </AuthContext.Provider>
      </ThemeContext.Provider>
    );
  }

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      <AuthContext.Provider value={{ user, login, logout, isLoggedIn, isLoading }}>
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