import React, { useState } from 'react';
import { useAuth, useTheme } from '../App';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Switch } from './ui/switch';
import { Alert, AlertDescription } from './ui/alert';
import { Upload, Moon, Sun, Loader2 } from 'lucide-react';
import { apiService } from '../services/api';

export function AuthPage() {
  const { login } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [loginForm, setLoginForm] = useState({ username: '', password: '' }); // Keep as username
  const [registerForm, setRegisterForm] = useState({
    username: '',
    email: '',
    password: '',
    robloxUsername: '',
    avatar: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

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
      });

      // Ensure token is persisted and ApiService has it
      if (response.token) {
        apiService.setToken(response.token);
        localStorage.setItem('bloxmarket-token', response.token);
        localStorage.setItem('bloxmarket-user', JSON.stringify(response.user));
      }

      // Login successful, update auth context
      login(response.user);
    } catch (error: any) {
      console.error('Login error:', error);
      
      let errorMessage = 'Login failed. Please check your credentials.';
      
      if (error?.message) {
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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await apiService.register({
        username: registerForm.username,
        email: registerForm.email,
        password: registerForm.password,
        robloxUsername: registerForm.robloxUsername || undefined
      });
      
      // Registration successful, update auth context
      login(response.user);
    } catch (error: any) {
      const errorMessage = error?.message || 'Registration failed. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20 bg-gradient-to-br from-blue-100/50 to-purple-100/50 dark:from-blue-900/30 dark:to-purple-900/30" />
      
      <div className="relative w-full max-w-md">
        {/* Theme Toggle */}
        <div className="flex justify-end mb-4">
          <div className="flex items-center gap-2 bg-background/80 backdrop-blur-sm rounded-lg p-2">
            {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            <Switch checked={isDark} onCheckedChange={toggleTheme} />
          </div>
        </div>

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
            <span className="text-white font-bold text-2xl">BM</span>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            BloxMarket
          </h1>
          <p className="text-muted-foreground mt-2">
            The ultimate Roblox trading community
          </p>
        </div>

        <Card className="backdrop-blur-sm bg-background/95 shadow-xl border border-border/50">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <CardHeader>
                <CardTitle>Welcome Back</CardTitle>
                <CardDescription>
                  Sign in to your BloxMarket account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  {error && (
                    <Alert className="border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="username">Username or Email</Label>
                    <Input
                      id="username"
                      name="username"
                      type="text"
                      placeholder="Enter your username or email"
                      value={loginForm.username}
                      onChange={(e) => setLoginForm(prev => ({ ...prev, username: e.target.value }))}
                      disabled={isLoading}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="Enter your password"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                      disabled={isLoading}
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Signing In...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </Button>
                </form>
              </CardContent>
            </TabsContent>
            
            <TabsContent value="register">
              <CardHeader>
                <CardTitle>Create Account</CardTitle>
                <CardDescription>
                  Join the BloxMarket community today
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRegister} className="space-y-4">
                  {error && (
                    <Alert className="border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  
                  {/* Avatar Upload */}
                  <div className="space-y-2">
                    <Label>Profile Avatar</Label>
                    <div className="flex items-center gap-4">
                      <Avatar className="w-16 h-16">
                        <AvatarImage src={registerForm.avatar} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                          {registerForm.username?.[0]?.toUpperCase() || <Upload className="w-6 h-6" />}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <Input
                          type="url"
                          placeholder="Avatar URL (optional)"
                          value={registerForm.avatar}
                          onChange={(e) => setRegisterForm(prev => ({ ...prev, avatar: e.target.value }))}
                          disabled={isLoading}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Enter an image URL for your avatar
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reg-username">Username</Label>
                    <Input
                      id="reg-username"
                      type="text"
                      placeholder="Choose a username"
                      value={registerForm.username}
                      onChange={(e) => setRegisterForm(prev => ({ ...prev, username: e.target.value }))}
                      disabled={isLoading}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={registerForm.email}
                      onChange={(e) => setRegisterForm(prev => ({ ...prev, email: e.target.value }))}
                      disabled={isLoading}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="roblox-username">Roblox Username</Label>
                    <Input
                      id="roblox-username"
                      type="text"
                      placeholder="Enter your Roblox username (optional)"
                      value={registerForm.robloxUsername}
                      onChange={(e) => setRegisterForm(prev => ({ ...prev, robloxUsername: e.target.value }))}
                      disabled={isLoading}
                    />
                    <p className="text-xs text-muted-foreground">
                      Link your Roblox account for verification
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="reg-password">Password</Label>
                    <Input
                      id="reg-password"
                      type="password"
                      placeholder="Create a password (min. 6 characters)"
                      value={registerForm.password}
                      onChange={(e) => setRegisterForm(prev => ({ ...prev, password: e.target.value }))}
                      disabled={isLoading}
                      required
                      minLength={6}
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </Button>
                </form>
              </CardContent>
            </TabsContent>
          </Tabs>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          By signing up, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}