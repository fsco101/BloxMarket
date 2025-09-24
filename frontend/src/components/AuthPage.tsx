import React, { useState } from 'react';
import { useAuth, useTheme } from '../App';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Switch } from './ui/switch';
import { Upload, Moon, Sun } from 'lucide-react';

export function AuthPage() {
  const { login } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [registerForm, setRegisterForm] = useState({
    username: '',
    email: '',
    password: '',
    robloxUsername: '',
    avatar: ''
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock login
    login({
      username: loginForm.username,
      email: 'user@example.com',
      robloxUsername: 'TestUser123',
      avatar: 'https://images.unsplash.com/photo-1740252117027-4275d3f84385?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHxyb2Jsb3glMjBhdmF0YXIlMjBjaGFyYWN0ZXJ8ZW58MXx8fHwxNzU4NTYwNDQ4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      rating: 4,
      vouchCount: 23,
      joinDate: new Date().toISOString()
    });
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock registration
    login({
      username: registerForm.username,
      email: registerForm.email,
      robloxUsername: registerForm.robloxUsername,
      avatar: registerForm.avatar || 'https://images.unsplash.com/photo-1740252117027-4275d3f84385?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHxyb2Jsb3glMjBhdmF0YXIlMjBjaGFyYWN0ZXJ8ZW58MXx8fHwxNzU4NTYwNDQ4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      rating: 0,
      vouchCount: 0,
      joinDate: new Date().toISOString()
    });
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
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      type="text"
                      placeholder="Enter your username"
                      value={loginForm.username}
                      onChange={(e) => setLoginForm(prev => ({ ...prev, username: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                    Sign In
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
                  {/* Avatar Upload */}
                  <div className="space-y-2">
                    <Label>Profile Avatar</Label>
                    <div className="flex items-center gap-4">
                      <Avatar className="w-16 h-16">
                        <AvatarImage src={registerForm.avatar} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                          {registerForm.username?.[0] || <Upload className="w-6 h-6" />}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <Input
                          type="url"
                          placeholder="Avatar URL (optional)"
                          value={registerForm.avatar}
                          onChange={(e) => setRegisterForm(prev => ({ ...prev, avatar: e.target.value }))}
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
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="roblox-username">Roblox Username</Label>
                    <Input
                      id="roblox-username"
                      type="text"
                      placeholder="Enter your Roblox username"
                      value={registerForm.robloxUsername}
                      onChange={(e) => setRegisterForm(prev => ({ ...prev, robloxUsername: e.target.value }))}
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
                      placeholder="Create a password"
                      value={registerForm.password}
                      onChange={(e) => setRegisterForm(prev => ({ ...prev, password: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <Button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                    Create Account
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