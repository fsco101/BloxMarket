import React, { createContext, useContext, useState, useEffect, Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
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

// Error Boundary Component
interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center p-8">
            <div className="text-red-500 mb-4">
              <svg className="w-16 h-16 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L4.316 15.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
            <p className="text-muted-foreground mb-4">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

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
interface User {
  id: string;
  username: string;
  email: string;
  role?: string;
  verified?: boolean;
  [key: string]: unknown;
}

const AuthContext = createContext<{
  user: User | null;
  login: (userData: User) => void;
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
  const [user, setUser] = useState<User | null>(null);
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

  const login = (userData: User) => {
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
        // Check if user has admin or moderator role
        if (user?.role === 'admin' || user?.role === 'moderator') {
          return <AdminPanel />;
        } else {
          // Redirect to dashboard if not authorized
          setCurrentPage('dashboard');
          return <Dashboard />;
        }
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
              <ErrorBoundary>
                {renderCurrentPage()}
              </ErrorBoundary>
            </main>
          </div>
        </AppContext.Provider>
      </AuthContext.Provider>
    </ThemeContext.Provider>
  );
}