import { 
  faArrowRight,
  faUserPlus, 
  faTrophy,
  faStar
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button } from '../ui/button';
import { useInView } from 'react-intersection-observer';

interface CTASectionProps {
  isLoggedIn: boolean;
  onGetStarted: () => void;
  onGoToDashboard: () => void;
}

export function CTASection({ 
  isLoggedIn, 
  onGetStarted, 
  onGoToDashboard 
}: CTASectionProps) {
  const { ref: ctaRef, inView: ctaInView } = useInView({ threshold: 0.1, triggerOnce: true });

  return (
    <section ref={ctaRef} className="relative py-32 overflow-hidden bg-transparent">
      <div className="container mx-auto px-6 relative z-10">
        
        {/* Main CTA Card */}
        <div className={`relative max-w-5xl mx-auto transition-all duration-1000 ${ctaInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          
          {/* Outer Glow */}
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-violet-500 to-fuchsia-500 rounded-[2.5rem] blur-xl opacity-30" />
          
          <div className="relative bg-white/80 dark:bg-[#0F1115] border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-12 md:p-20 overflow-hidden text-center transition-colors duration-500">
            
            {/* Inner Decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-fuchsia-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-violet-500/30 bg-violet-500/10 mb-8">
                <FontAwesomeIcon icon={faStar} className="w-4 h-4 text-violet-600 dark:text-violet-400 transition-colors" />
                <span className="text-violet-700 dark:text-violet-300 text-sm font-medium tracking-widest uppercase transition-colors">Start Your Journey</span>
              </div>

              <h2 className="text-5xl md:text-7xl font-black tracking-tight text-slate-900 dark:text-white mb-6 transition-colors">
                JOIN THE <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-violet-600 dark:from-cyan-400 dark:to-violet-400 transition-colors">ELITE</span>
              </h2>

              <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-12 transition-colors">
                Don't miss out on the fastest growing Roblox trading platform. 
                Secure your username and start building your reputation today.
              </p>

              {!isLoggedIn ? (
                <Button
                  onClick={onGetStarted}
                  size="lg"
                  className="relative overflow-hidden group bg-cyan-500 hover:bg-cyan-400 text-slate-900 px-10 py-7 text-xl font-bold rounded-2xl shadow-[0_0_40px_rgba(6,182,212,0.4)] transition-all transform hover:scale-105"
                >
                  <div className="absolute inset-0 w-full h-full bg-white/20 group-hover:translate-x-full transition-transform duration-500 ease-out -skew-x-12 -translate-x-full" />
                  <FontAwesomeIcon icon={faUserPlus} className="mr-3 h-6 w-6 text-slate-900" />
                  CREATE FREE ACCOUNT
                </Button>
              ) : (
                <Button
                  onClick={onGoToDashboard}
                  size="lg"
                  className="relative overflow-hidden group bg-violet-500 hover:bg-violet-400 text-white px-10 py-7 text-xl font-bold rounded-2xl shadow-[0_0_40px_rgba(139,92,246,0.4)] transition-all transform hover:scale-105"
                >
                  <div className="absolute inset-0 w-full h-full bg-white/20 group-hover:translate-x-full transition-transform duration-500 ease-out -skew-x-12 -translate-x-full" />
                  <FontAwesomeIcon icon={faTrophy} className="mr-3 h-6 w-6 text-white" />
                  ENTER DASHBOARD
                  <FontAwesomeIcon icon={faArrowRight} className="ml-3 h-6 w-6 text-white group-hover:translate-x-1 transition-transform" />
                </Button>
              )}
            </div>
            
          </div>
        </div>

      </div>
    </section>
  );
}