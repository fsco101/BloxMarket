import React from 'react';
import { useApp, useAuth, useTheme } from '../App';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { 
  Home, 
  ArrowLeftRight, 
  Heart, 
  Shield, 
  MessageSquare, 
  Calendar, 
  User, 
  Settings,
  LogOut,
  Moon,
  Sun
} from 'lucide-react';

export function Sidebar() {
  const { currentPage, setCurrentPage } = useApp();
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const menuItems = [
    { id: 'dashboard', label: 'Home', icon: Home },
    { id: 'trading-hub', label: 'Trading Hub', icon: ArrowLeftRight },
    { id: 'wishlist', label: 'Wishlist', icon: Heart },
    { id: 'middleman', label: 'Middleman Directory', icon: Shield },
    { id: 'forums', label: 'Forums', icon: MessageSquare },
    { id: 'events', label: 'Events & Giveaways', icon: Calendar },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'admin', label: 'Admin Panel', icon: Settings }
  ];

  return (
    <div className="w-64 h-screen bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">BM</span>
          </div>
          <div>
            <h1 className="font-bold text-lg text-sidebar-foreground">BloxMarket</h1>
            <p className="text-xs text-sidebar-foreground/60">Trading Community</p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={user?.avatar || "https://images.unsplash.com/photo-1740252117027-4275d3f84385?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHxyb2Jsb3glMjBhdmF0YXIlMjBjaGFyYWN0ZXJ8ZW58MXx8fHwxNzU4NTYwNDQ4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"} />
            <AvatarFallback>{user?.username?.[0] || 'U'}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm text-sidebar-foreground truncate">
              {user?.username || 'User'}
            </p>
            <p className="text-xs text-sidebar-foreground/60 truncate">
              {user?.robloxUsername || 'No Roblox linked'}
            </p>
            <div className="flex items-center gap-1 mt-1">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className={`w-2 h-2 ${i < (user?.rating || 0) ? 'bg-yellow-400' : 'bg-gray-300'}`} />
                ))}
              </div>
              <span className="text-xs text-sidebar-foreground/60 ml-1">
                ({user?.vouchCount || 0} vouches)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2">
        {menuItems.map(({ id, label, icon: Icon }) => (
          <Button
            key={id}
            variant={currentPage === id ? "secondary" : "ghost"}
            className={`w-full justify-start mb-1 h-10 ${
              currentPage === id 
                ? 'bg-sidebar-accent text-sidebar-accent-foreground' 
                : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
            }`}
            onClick={() => setCurrentPage(id)}
          >
            <Icon className="w-4 h-4 mr-3" />
            {label}
          </Button>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border space-y-3">
        {/* Theme Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            <span className="text-sm text-sidebar-foreground">Dark Mode</span>
          </div>
          <Switch checked={isDark} onCheckedChange={toggleTheme} />
        </div>

        {/* Logout */}
        <Button
          variant="ghost"
          className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          onClick={logout}
        >
          <LogOut className="w-4 h-4 mr-3" />
          Logout
        </Button>
      </div>
    </div>
  );
}