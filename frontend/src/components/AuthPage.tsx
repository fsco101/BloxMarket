import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Login } from './Login';
import { Registration } from './Registration';
import { SocialLogin } from './SocialLogin';

export function AuthPage() {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-slate-50 dark:bg-[#0A0A0B] text-slate-900 dark:text-slate-200 transition-colors duration-500">
      
      {/* Premium Background with Image */}
      <div className="fixed inset-0 z-0">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: 'url(/landingpage.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundAttachment: 'fixed'
          }}
        />
        
        {/* Responsive overlay for readability */}
        <div className="absolute inset-0 bg-white/40 backdrop-blur-sm dark:bg-black/60 dark:backdrop-blur-none transition-all duration-500 z-0" />
        
        {/* Glow Effects */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse-slow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse-slow" />
      </div>

      {/* Main Card */}
      <div className="relative w-full max-w-md z-10">
        
        {/* Welcome Text */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight mb-2 transition-colors">Welcome to BloxMarket</h1>
          <p className="text-slate-600 dark:text-slate-400 font-medium transition-colors">
            The ultimate Roblox trading community
          </p>
        </div>

        <div className="bg-white/60 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 backdrop-blur-xl rounded-3xl p-6 shadow-2xl transition-all duration-500">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'login' | 'register')} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-slate-200/50 dark:bg-black/40 border border-slate-300/50 dark:border-white/5 rounded-xl p-1 mb-6 transition-colors">
              <TabsTrigger 
                value="login" 
                className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-300 rounded-lg transition-all"
              >
                Login
              </TabsTrigger>
              <TabsTrigger 
                value="register"
                className="data-[state=active]:bg-violet-500/20 data-[state=active]:text-violet-300 rounded-lg transition-all"
              >
                Register
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
              <div className="space-y-6">
                <SocialLogin />
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-slate-300 dark:border-white/10 transition-colors" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase font-medium tracking-widest">
                    <span className="bg-white dark:bg-[#0f1115] px-4 text-slate-500 rounded-full border border-slate-200 dark:border-white/5 transition-colors">
                      Or continue with email
                    </span>
                  </div>
                </div>
                <Login />
              </div>
            </TabsContent>

            <TabsContent value="register" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
              <div className="space-y-6">
                <SocialLogin />
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-slate-300 dark:border-white/10 transition-colors" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase font-medium tracking-widest">
                    <span className="bg-white dark:bg-[#0f1115] px-4 text-slate-500 rounded-full border border-slate-200 dark:border-white/5 transition-colors">
                      Or continue with email
                    </span>
                  </div>
                </div>
                <Registration />
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <p className="text-center text-sm text-slate-600 dark:text-slate-500 mt-8 transition-colors">
          By signing up, you agree to our <a href="#" className="text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 dark:hover:text-cyan-300 transition-colors">Terms of Service</a> and <a href="#" className="text-violet-600 dark:text-violet-400 hover:text-violet-500 dark:hover:text-violet-300 transition-colors">Privacy Policy</a>
        </p>
      </div>
    </div>
  );
}