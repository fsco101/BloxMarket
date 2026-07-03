import React, { useState, useEffect } from 'react';
import { useAuth } from '../App';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { apiService } from '../services/api';

export function Registration() {
  const { login } = useAuth();
  const [registerForm, setRegisterForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    robloxUsername: '',
    messengerLink: '',
    avatar: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [verificationStep, setVerificationStep] = useState<'form' | 'email' | 'code' | 'register' | null>('form');
  const [verificationCode, setVerificationCode] = useState('');
  const [pendingEmail, setPendingEmail] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const validateForm = () => {
    if (registerForm.username.trim().length < 3) {
      setError('Username must be at least 3 characters long.');
      return false;
    }

    if (!registerForm.email.trim()) {
      setError('Email address is required.');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(registerForm.email)) {
      setError('Please enter a valid email address.');
      return false;
    }

    if (registerForm.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return false;
    }

    if (registerForm.password !== registerForm.confirmPassword) {
      setError('Passwords do not match. Please try again.');
      return false;
    }

    return true;
  };

  const handleProceedToEmailVerification = () => {
    if (!validateForm()) {
      return;
    }

    setVerificationStep('email');
    setError('');
  };

  const handleSendEmailVerification = async () => {
    setIsLoading(true);
    setError('');

    try {
      await apiService.sendEmailVerification(registerForm.email);
      setPendingEmail(registerForm.email);
      setVerificationStep('code');
      setResendCooldown(60); // Start 60 second cooldown
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send verification code. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyEmailCode = async () => {
    if (!verificationCode.trim()) {
      setError('Please enter the verification code.');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      await apiService.verifyEmailCode(pendingEmail, verificationCode.trim());
      setVerificationStep('register');
      setVerificationCode('');
      setError('');
    } catch (error: unknown) {
      let errorMessage = 'Verification failed. Please check your code and try again.';

      if (error instanceof Error) {
        errorMessage = error.message;
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
        username: registerForm.username.trim(),
        email: pendingEmail,
        password: registerForm.password,
        robloxUsername: registerForm.robloxUsername.trim() || undefined,
        messengerLink: registerForm.messengerLink.trim() || undefined
      });

      // Registration successful, login the user
      login(response.user, true);
      setVerificationStep(null);
      setPendingEmail('');
    } catch (error: unknown) {
      let errorMessage = 'Registration failed. Please try again.';

      if (error instanceof Error) {
        errorMessage = error.message;
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setError('');
    setIsLoading(true);

    try {
      await apiService.sendEmailVerification(pendingEmail);
      setResendCooldown(60);
      setError('');
    } catch (error: unknown) {
      let errorMessage = 'Failed to resend verification code. Please try again.';

      if (error instanceof Error) {
        errorMessage = error.message;
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-transparent border-none shadow-none">
      <CardHeader className="px-0 pt-0">
        <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight transition-colors">Create Account</CardTitle>
        <CardDescription className="text-slate-600 dark:text-slate-400 transition-colors">
          Join the BloxMarket community today
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        {verificationStep === 'form' ? (
          <form onSubmit={(e) => {
            e.preventDefault();
            handleProceedToEmailVerification();
          }} className="space-y-6">
            {error && (
              <Alert className="border-red-500/30 bg-red-500/10 text-red-400">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-3">
              <Label htmlFor="reg-username" className="text-slate-700 dark:text-slate-300 font-medium ml-1 transition-colors">Username *</Label>
              <Input
                id="reg-username"
                type="text"
                placeholder="Choose a username"
                value={registerForm.username}
                onChange={(e) => setRegisterForm(prev => ({ ...prev, username: e.target.value }))}
                disabled={isLoading}
                required
                className="h-12 px-4 bg-white/60 dark:bg-black/40 border-slate-200 dark:border-white/10 text-slate-900 dark:text-slate-200 placeholder:text-slate-500 dark:placeholder:text-slate-600 focus-visible:outline-none focus-visible:ring-0 focus-visible:border-violet-500 dark:focus-visible:border-violet-400 focus-visible:shadow-[0_0_15px_rgba(139,92,246,0.15)] transition-all rounded-xl text-base"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="email" className="text-slate-700 dark:text-slate-300 font-medium ml-1 transition-colors">Email Address *</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email address"
                value={registerForm.email}
                onChange={(e) => setRegisterForm(prev => ({ ...prev, email: e.target.value }))}
                disabled={isLoading}
                required
                className="h-12 px-4 bg-white/60 dark:bg-black/40 border-slate-200 dark:border-white/10 text-slate-900 dark:text-slate-200 placeholder:text-slate-500 dark:placeholder:text-slate-600 focus-visible:outline-none focus-visible:ring-0 focus-visible:border-violet-500 dark:focus-visible:border-violet-400 focus-visible:shadow-[0_0_15px_rgba(139,92,246,0.15)] transition-all rounded-xl text-base"
              />
              <p className="text-xs text-slate-600 dark:text-slate-500 ml-1 transition-colors">
                We'll send a verification code to this email
              </p>
            </div>

            <div className="space-y-3">
              <Label htmlFor="roblox-username" className="text-slate-700 dark:text-slate-300 font-medium ml-1 transition-colors">Roblox Username</Label>
              <Input
                id="roblox-username"
                type="text"
                placeholder="Enter your Roblox username (optional)"
                value={registerForm.robloxUsername}
                onChange={(e) => setRegisterForm(prev => ({ ...prev, robloxUsername: e.target.value }))}
                disabled={isLoading}
                className="h-12 px-4 bg-white/60 dark:bg-black/40 border-slate-200 dark:border-white/10 text-slate-900 dark:text-slate-200 placeholder:text-slate-500 dark:placeholder:text-slate-600 focus-visible:outline-none focus-visible:ring-0 focus-visible:border-violet-500 dark:focus-visible:border-violet-400 focus-visible:shadow-[0_0_15px_rgba(139,92,246,0.15)] transition-all rounded-xl text-base"
              />
              <p className="text-xs text-slate-600 dark:text-slate-500 ml-1 transition-colors">
                Link your Roblox account for verification
              </p>
            </div>

            <div className="space-y-3">
              <Label htmlFor="messenger-link" className="text-slate-700 dark:text-slate-300 font-medium ml-1 transition-colors">Messenger Link</Label>
              <Input
                id="messenger-link"
                type="text"
                placeholder="Your messenger profile link (optional)"
                value={registerForm.messengerLink}
                onChange={(e) => setRegisterForm(prev => ({ ...prev, messengerLink: e.target.value }))}
                disabled={isLoading}
                className="h-12 px-4 bg-white/60 dark:bg-black/40 border-slate-200 dark:border-white/10 text-slate-900 dark:text-slate-200 placeholder:text-slate-500 dark:placeholder:text-slate-600 focus-visible:outline-none focus-visible:ring-0 focus-visible:border-violet-500 dark:focus-visible:border-violet-400 focus-visible:shadow-[0_0_15px_rgba(139,92,246,0.15)] transition-all rounded-xl text-base"
              />
              <p className="text-xs text-slate-600 dark:text-slate-500 ml-1 transition-colors">
                Add your messenger contact for easier communication
              </p>
            </div>

            <div className="space-y-3">
              <Label htmlFor="reg-password" className="text-slate-700 dark:text-slate-300 font-medium ml-1 transition-colors">Password *</Label>
              <div className="relative">
                <Input
                  id="reg-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password (min. 6 characters)"
                  value={registerForm.password}
                  onChange={(e) => setRegisterForm(prev => ({ ...prev, password: e.target.value }))}
                  disabled={isLoading}
                  required
                  minLength={6}
                  className="h-12 px-4 bg-white/60 dark:bg-black/40 border-slate-200 dark:border-white/10 text-slate-900 dark:text-slate-200 placeholder:text-slate-500 dark:placeholder:text-slate-600 focus-visible:outline-none focus-visible:ring-0 focus-visible:border-violet-500 dark:focus-visible:border-violet-400 focus-visible:shadow-[0_0_15px_rgba(139,92,246,0.15)] transition-all rounded-xl pr-12 text-base"
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-500 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              <div className="h-1 w-full bg-slate-200 dark:bg-slate-800 mt-3 rounded transition-colors">
                <div
                  className={`h-full rounded transition-all duration-300 ${
                    registerForm.password.length === 0 ? 'w-0' :
                    registerForm.password.length < 6 ? 'w-1/4 bg-red-500' :
                    registerForm.password.length < 8 ? 'w-2/4 bg-yellow-500' :
                    registerForm.password.length < 10 ? 'w-3/4 bg-blue-500' :
                    'w-full bg-emerald-500'
                  }`}
                />
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-500 ml-1 transition-colors">
                {registerForm.password.length === 0 ? 'Password strength indicator' :
                 registerForm.password.length < 6 ? 'Very weak - Use at least 6 characters' :
                 registerForm.password.length < 8 ? 'Weak - Consider using a longer password' :
                 registerForm.password.length < 10 ? 'Good - Password has decent length' :
                 'Strong - Great password length'}
              </p>
            </div>

            <div className="space-y-3">
              <Label htmlFor="confirm-password" className="text-slate-700 dark:text-slate-300 font-medium ml-1 transition-colors">Confirm Password *</Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Re-enter your password"
                  value={registerForm.confirmPassword}
                  onChange={(e) => setRegisterForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  disabled={isLoading}
                  required
                  className="h-12 px-4 bg-white/60 dark:bg-black/40 border-slate-200 dark:border-white/10 text-slate-900 dark:text-slate-200 placeholder:text-slate-500 dark:placeholder:text-slate-600 focus-visible:outline-none focus-visible:ring-0 focus-visible:border-violet-500 dark:focus-visible:border-violet-400 focus-visible:shadow-[0_0_15px_rgba(139,92,246,0.15)] transition-all rounded-xl pr-12 text-base"
                />
              </div>
              {registerForm.password && registerForm.confirmPassword &&
               registerForm.password !== registerForm.confirmPassword && (
                <p className="text-xs text-red-500 dark:text-red-400 mt-2 ml-1 transition-colors">
                  Passwords do not match
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-violet-600 hover:bg-violet-500 dark:bg-violet-500 dark:hover:bg-violet-400 text-white font-bold rounded-xl py-6 shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all text-base mt-2"
              disabled={isLoading || !registerForm.username.trim() || !registerForm.email.trim() || !registerForm.password || !registerForm.confirmPassword}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Validating...
                </>
              ) : (
                'Continue to Email Verification'
              )}
            </Button>
          </form>
        ) : verificationStep === 'email' ? (
          <div className="space-y-6">
            {error && (
              <Alert className="border-red-500/30 bg-red-500/10 text-red-400">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-3">
              <Label className="text-slate-700 dark:text-slate-300 font-medium ml-1 transition-colors">Email Verification</Label>
              <p className="text-sm text-slate-600 dark:text-slate-400 ml-1 transition-colors">
                We will send a verification code to: <strong className="text-slate-900 dark:text-white transition-colors">{registerForm.email}</strong>
              </p>
            </div>

            <Button
              onClick={handleSendEmailVerification}
              className="w-full bg-violet-600 hover:bg-violet-500 dark:bg-violet-500 dark:hover:bg-violet-400 text-white font-bold rounded-xl py-6 shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all text-base"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Sending Code...
                </>
              ) : (
                'Send Verification Code'
              )}
            </Button>

            <div className="text-center">
              <Button
                variant="ghost"
                onClick={() => {
                  setVerificationStep('form');
                  setError('');
                }}
                className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/5 transition-colors"
              >
                Back to Form
              </Button>
            </div>
          </div>
        ) : verificationStep === 'code' ? (
          <div className="space-y-6">
            {error && (
              <Alert className="border-red-500/30 bg-red-500/10 text-red-400">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-3">
              <Label htmlFor="verification-code" className="text-slate-700 dark:text-slate-300 font-medium ml-1 transition-colors">Verification Code</Label>
              <Input
                id="verification-code"
                type="text"
                placeholder="Enter 6-digit code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                disabled={isLoading}
                maxLength={6}
                required
                className="h-14 px-4 bg-white/60 dark:bg-black/40 border-slate-200 dark:border-white/10 text-slate-900 dark:text-slate-200 placeholder:text-slate-500 dark:placeholder:text-slate-600 focus-visible:outline-none focus-visible:ring-0 focus-visible:border-violet-500 dark:focus-visible:border-violet-400 focus-visible:shadow-[0_0_15px_rgba(139,92,246,0.15)] transition-all rounded-xl text-center text-2xl tracking-widest font-mono"
              />
              <p className="text-xs text-slate-600 dark:text-slate-500 text-center mt-3 transition-colors">
                Enter the 6-digit code sent to {pendingEmail}
              </p>
            </div>

            <Button
              onClick={handleVerifyEmailCode}
              className="w-full bg-violet-600 hover:bg-violet-500 dark:bg-violet-500 dark:hover:bg-violet-400 text-white font-bold rounded-xl py-6 shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all text-base"
              disabled={isLoading || verificationCode.length !== 6}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify Email'
              )}
            </Button>

            <div className="text-center space-y-2">
              <Button
                variant="link"
                onClick={handleResendCode}
                disabled={isLoading || resendCooldown > 0}
                className="text-sm text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 dark:hover:text-cyan-300 transition-colors"
              >
                {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend verification code'}
              </Button>
              <br />
              <Button
                variant="ghost"
                onClick={() => {
                  setVerificationStep('form');
                  setVerificationCode('');
                  setError('');
                }}
                className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/5 transition-colors"
              >
                Change Email
              </Button>
            </div>
          </div>
        ) : verificationStep === 'register' ? (
          <form onSubmit={handleRegister} className="space-y-6">
            {error && (
              <Alert className="border-red-500/30 bg-red-500/10 text-red-400">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-3">
              <Label htmlFor="reg-password" className="text-slate-700 dark:text-slate-300 font-medium ml-1 transition-colors">Password</Label>
              <div className="relative">
                <Input
                  id="reg-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password (min. 6 characters)"
                  value={registerForm.password}
                  onChange={(e) => setRegisterForm(prev => ({ ...prev, password: e.target.value }))}
                  disabled={isLoading}
                  required
                  minLength={6}
                  className="h-12 px-4 bg-white/60 dark:bg-black/40 border-slate-200 dark:border-white/10 text-slate-900 dark:text-slate-200 placeholder:text-slate-500 dark:placeholder:text-slate-600 focus-visible:outline-none focus-visible:ring-0 focus-visible:border-violet-500 dark:focus-visible:border-violet-400 focus-visible:shadow-[0_0_15px_rgba(139,92,246,0.15)] transition-all rounded-xl pr-12 text-base"
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-500 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              <div className="h-1 w-full bg-slate-200 dark:bg-slate-800 mt-3 rounded transition-colors">
                <div
                  className={`h-full rounded transition-all duration-300 ${
                    registerForm.password.length === 0 ? 'w-0' :
                    registerForm.password.length < 6 ? 'w-1/4 bg-red-500' :
                    registerForm.password.length < 8 ? 'w-2/4 bg-yellow-500' :
                    registerForm.password.length < 10 ? 'w-3/4 bg-blue-500' :
                    'w-full bg-emerald-500'
                  }`}
                />
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-500 ml-1 transition-colors">
                {registerForm.password.length === 0 ? 'Password strength indicator' :
                 registerForm.password.length < 6 ? 'Very weak - Use at least 6 characters' :
                 registerForm.password.length < 8 ? 'Weak - Consider using a longer password' :
                 registerForm.password.length < 10 ? 'Good - Password has decent length' :
                 'Strong - Great password length'}
              </p>
            </div>

            <div className="space-y-3">
              <Label htmlFor="confirm-password" className="text-slate-700 dark:text-slate-300 font-medium ml-1 transition-colors">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Re-enter your password"
                  value={registerForm.confirmPassword}
                  onChange={(e) => setRegisterForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  disabled={isLoading}
                  required
                  className="h-12 px-4 bg-white/60 dark:bg-black/40 border-slate-200 dark:border-white/10 text-slate-900 dark:text-slate-200 placeholder:text-slate-500 dark:placeholder:text-slate-600 focus-visible:outline-none focus-visible:ring-0 focus-visible:border-violet-500 dark:focus-visible:border-violet-400 focus-visible:shadow-[0_0_15px_rgba(139,92,246,0.15)] transition-all rounded-xl pr-12 text-base"
                />
              </div>
              {registerForm.password && registerForm.confirmPassword &&
               registerForm.password !== registerForm.confirmPassword && (
                <p className="text-xs text-red-500 dark:text-red-400 mt-2 ml-1 transition-colors">
                  Passwords do not match
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-violet-600 hover:bg-violet-500 dark:bg-violet-500 dark:hover:bg-violet-400 text-white font-bold rounded-xl py-6 shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all text-base mt-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </Button>

            <div className="text-center">
              <Button
                variant="ghost"
                onClick={() => {
                  setVerificationStep('form');
                  setPendingEmail('');
                  setRegisterForm(prev => ({ ...prev, email: '' }));
                }}
                className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/5 transition-colors"
              >
                Change Email
              </Button>
            </div>
          </form>
        ) : null}
      </CardContent>
    </Card>
  );
}