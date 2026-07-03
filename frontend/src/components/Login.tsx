import React, { useState } from 'react';
import { useAuth } from '../App';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Checkbox } from './ui/checkbox';
import { Alert, AlertDescription } from './ui/alert';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { apiService } from '../services/api';
import { alertService } from '../services/alertService';

interface Penalty {
  type: 'warning' | 'restriction' | 'suspension' | 'strike';
  severity: 'low' | 'medium' | 'high' | 'critical';
  reason: string;
  expires_at?: string;
}

export function Login() {
  const { login } = useAuth();
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Use the state values directly instead of FormData
      const username = loginForm.username?.trim();
      const password = loginForm.password;

      // Validate input
      if (!username || !password) {
        setError('Please enter both username/email and password.');
        setIsLoading(false);
        return;
      }

      console.log('Attempting login with:', { username, password: password ? '[REDACTED]' : 'empty' });

      // Send username (which can be email or username) in the login request
      const response = await apiService.login({
        username: username,
        password: password
      }, rememberMe);

      // Check for active penalties in the response
      if (response.penalties && response.penalties.length > 0) {
        // Show penalty warnings to the user
        const penaltyMessages = response.penalties.map((penalty: Penalty) => 
          `${penalty.type.charAt(0).toUpperCase() + penalty.type.slice(1)} (${penalty.severity}): ${penalty.reason}`
        ).join('\n• ');
        
        // You can show this as a toast or alert
        console.warn('User has active penalties:', response.penalties);
        // For now, we'll show it in an alert after login
        setTimeout(() => {
          alertService.warning(`Warning: You have active penalties:\n• ${penaltyMessages}\n\nPlease review and comply with platform rules to avoid further action.`);
        }, 1000);
      }

      // Ensure token is persisted and ApiService has it
      if (response.token) {
        // Use the updated setToken method that handles storage based on rememberMe
        apiService.setToken(response.token, rememberMe);

        // Store user data in the same storage as the token
        const storage = rememberMe ? localStorage : sessionStorage;
        storage.setItem('bloxmarket-user', JSON.stringify(response.user));

        // Clean up the other storage to prevent conflicts
        const otherStorage = rememberMe ? sessionStorage : localStorage;
        otherStorage.removeItem('bloxmarket-token');
        otherStorage.removeItem('bloxmarket-user');
      }

      // Login successful, update auth context with rememberMe preference
      login(response.user, rememberMe);
    } catch (error: unknown) {
      console.error('Login error:', error);

      let errorMessage = 'Login failed. Please check your credentials.';

      if (error instanceof Error) {
        // Handle specific error messages from the backend
        if (error.message.includes('banned')) {
          errorMessage = 'Your account has been banned. Please contact support.';
        } else if (error.message.includes('deactivated') || error.message.includes('disabled')) {
          errorMessage = 'Your account has been deactivated. Please contact support.';
        } else if (error.message.includes('Invalid credentials')) {
          errorMessage = 'Invalid username/email or password. Please try again.';
        } else if (error.message.includes('required')) {
          errorMessage = 'Please enter both username/email and password.';
        } else {
          errorMessage = error.message;
        }
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-transparent border-none shadow-none">
      <CardHeader className="px-0 pt-0">
        <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight transition-colors">Welcome Back</CardTitle>
        <CardDescription className="text-slate-600 dark:text-slate-400 transition-colors">
          Sign in to your BloxMarket account
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <Alert className="border-red-500/30 bg-red-500/10 text-red-400">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-3">
            <Label htmlFor="username" className="text-slate-700 dark:text-slate-300 font-medium ml-1 transition-colors">Username or Email</Label>
            <Input
              id="username"
              name="username"
              type="text"
              placeholder="Enter your username or email"
              value={loginForm.username}
              onChange={(e) => setLoginForm(prev => ({ ...prev, username: e.target.value }))}
              disabled={isLoading}
              required
              className="h-12 px-4 bg-white/60 dark:bg-black/40 border-slate-200 dark:border-white/10 text-slate-900 dark:text-slate-200 placeholder:text-slate-500 dark:placeholder:text-slate-600 focus-visible:outline-none focus-visible:ring-0 focus-visible:border-cyan-500 dark:focus-visible:border-cyan-400 focus-visible:shadow-[0_0_15px_rgba(6,182,212,0.15)] transition-all rounded-xl text-base"
            />
          </div>
          <div className="space-y-3">
            <Label htmlFor="password" className="text-slate-700 dark:text-slate-300 font-medium ml-1 transition-colors">Password</Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={loginForm.password}
                onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                disabled={isLoading}
                required
                className="h-12 px-4 bg-white/60 dark:bg-black/40 border-slate-200 dark:border-white/10 text-slate-900 dark:text-slate-200 placeholder:text-slate-500 dark:placeholder:text-slate-600 focus-visible:outline-none focus-visible:ring-0 focus-visible:border-cyan-500 dark:focus-visible:border-cyan-400 focus-visible:shadow-[0_0_15px_rgba(6,182,212,0.15)] transition-all rounded-xl pr-12 text-base"
              />
              <button
                type="button"
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-500 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            <div className="flex justify-end">
              <a href="#" className="text-sm font-medium text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 dark:hover:text-cyan-300 transition-colors">
                Forgot password?
              </a>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-cyan-600 hover:bg-cyan-500 dark:bg-cyan-500 dark:hover:bg-cyan-400 text-white dark:text-slate-900 font-bold rounded-xl py-6 shadow-[0_0_20px_rgba(8,145,178,0.3)] dark:shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all text-base mt-2"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Signing In...
              </>
            ) : (
              'Sign In'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}